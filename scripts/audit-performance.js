import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { setTimeout as delay } from "timers/promises";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const configFile = "lighthouserc.json";
const distDir = path.join(rootDir, "dist");
const reportsDir = path.join(rootDir, "reports", "performance");

const { collect } = JSON.parse(
  readFileSync(path.join(rootDir, configFile), "utf8"),
).ci;
const urls = collect.url;
const runsPerUrl = collect.numberOfRuns;
const { origin, hostname, port } = new URL(urls[0]);

// Extra `lhci collect` flags per device profile. Lighthouse emulates a mobile
// device by default; desktop uses its built-in preset.
const PROFILES = {
  mobile: [],
  desktop: ["--settings.preset=desktop"],
};
const METRIC_AUDITS = {
  lcp: "largest-contentful-paint",
  cls: "cumulative-layout-shift",
  tbt: "total-blocking-time",
  fcp: "first-contentful-paint",
};
const UNITS = {
  performance: "score 0-100",
  lcp: "ms",
  cls: "unitless",
  tbt: "ms",
  fcp: "ms",
};
const LOCAL_HOSTS = ["127.0.0.1", "localhost"];
const READY_TIMEOUT_MS = 30_000;
const STOP_TIMEOUT_MS = 10_000;
const EXIT_CODES = { SIGINT: 130, SIGTERM: 143 };

// Package executables run with the current Node.js binary, without a shell or a global install.
const binPath = (packageName, binName) => {
  const manifestPath = require.resolve(`${packageName}/package.json`);
  return path.join(
    path.dirname(manifestPath),
    require(manifestPath).bin[binName],
  );
};
const viteBin = binPath("vite", "vite");
const lhciBin = binPath("@lhci/cli", "lhci");

// Lighthouse CI lets LHCI_* variables override lighthouserc.json and even CLI flags
// (e.g. LHCI_UPLOAD__TARGET), so they never reach it: runs stay local and as configured.
const isLhciVariable = (name) => /^LHCI_/i.test(name);
const ignoredLhciVariables = Object.keys(process.env).filter(isLhciVariable);
const lhciEnv = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !isLhciVariable(name)),
);

const children = new Set();
let interrupted = null;

const run = (bin, args, options) => {
  const child = spawn(process.execPath, [bin, ...args], {
    cwd: rootDir,
    // Its own process group lets stop() also end Lighthouse and Chrome on POSIX systems.
    detached: process.platform !== "win32",
    ...options,
  });
  const exited = new Promise((resolve) => {
    child.once("exit", (code) => resolve(code));
    child.once("error", (error) => {
      console.error(error.message);
      resolve(null);
    });
  });
  children.add(child);
  exited.then(() => children.delete(child));
  return { child, exited };
};

// Ends a child process together with every process it started.
const stop = (child) => {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null)
    return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      // The process group has already exited.
    }
  }
};

const interrupt = (signal) => {
  if (interrupted) process.exit(EXIT_CODES[signal]);
  interrupted = signal;
  console.error(
    `\nPrzerwano (${signal}): zatrzymywanie Lighthouse i Vite Preview.`,
  );
  children.forEach(stop);
};
process.on("SIGINT", interrupt);
process.on("SIGTERM", interrupt);
process.on("exit", () => children.forEach(stop));

// Returns the HTTP status, or 0 when nothing answers at the address.
const statusOf = async (url) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return response.status;
  } catch {
    return 0;
  }
};

const checkSetup = (chromePath) => {
  for (const url of urls) {
    const { hostname: host, origin: urlOrigin, pathname } = new URL(url);
    if (!LOCAL_HOSTS.includes(host) || urlOrigin !== origin) {
      throw new Error(
        `${configFile}: adres ${url} musi wskazywać lokalny serwer ${origin}.`,
      );
    }
    if (!existsSync(path.join(distDir, pathname))) {
      throw new Error(
        `Brak dist${pathname}. Uruchom audyt przez npm run audit:performance, który najpierw buduje stronę.`,
      );
    }
  }
  if (!existsSync(chromePath)) {
    throw new Error(
      process.env.CHROME_PATH
        ? `CHROME_PATH wskazuje nieistniejący plik: ${chromePath}`
        : `Brak Chromium dla Playwright (${chromePath}). Zainstaluj go poleceniem npx playwright install chromium albo wskaż przeglądarkę w CHROME_PATH.`,
    );
  }
};

const startPreview = async () => {
  if (await statusOf(origin)) {
    throw new Error(
      `Adres ${origin} jest już zajęty. Zatrzymaj działający tam serwer i uruchom audyt ponownie.`,
    );
  }
  const preview = run(
    viteBin,
    ["preview", "--host", hostname, "--port", port, "--strictPort"],
    // Plain output keeps Vite's startup errors readable in summary.json.
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NO_COLOR: "1" },
    },
  );
  let output = "";
  preview.child.stdout.on("data", (chunk) => (output += chunk));
  preview.child.stderr.on("data", (chunk) => (output += chunk));

  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline && !interrupted) {
    if (preview.child.exitCode !== null) {
      throw new Error(
        `Vite Preview zakończył działanie (kod ${preview.child.exitCode}) przed gotowością:\n${output.trim()}`,
      );
    }
    if ((await statusOf(urls[0])) === 200) {
      console.log(`Vite Preview działa pod ${origin}.`);
      return preview;
    }
    await delay(250);
  }
  stop(preview.child);
  throw new Error(
    interrupted
      ? "Przerwano przed uruchomieniem Lighthouse."
      : `Vite Preview nie odpowiedział pod ${urls[0]} w ciągu ${READY_TIMEOUT_MS / 1000} s:\n${output.trim()}`,
  );
};

const stopPreview = async (preview) => {
  stop(preview.child);
  const stopped = await Promise.race([
    preview.exited.then(() => true),
    delay(STOP_TIMEOUT_MS, false),
  ]);
  if (stopped) console.log("Vite Preview zatrzymany.");
  return stopped;
};

const lhci = async (command, args) => {
  const { exited } = run(
    lhciBin,
    [command, `--config=${configFile}`, ...args],
    {
      stdio: "inherit",
      env: lhciEnv,
    },
  );
  return (await exited) === 0;
};

// Reads one exported run and rejects anything that is not a valid measurement of
// a configured page, collected by this invocation with the expected device profile.
const readRun = (entry, profile, startedAt) => {
  const lhr = JSON.parse(readFileSync(entry.jsonPath, "utf8"));
  if (!readFileSync(entry.htmlPath, "utf8").includes("__LIGHTHOUSE_JSON__")) {
    throw new Error("raport HTML nie zawiera wyniku Lighthouse");
  }
  if (lhr.runtimeError) {
    throw new Error(`błąd Lighthouse ${lhr.runtimeError.code}`);
  }
  if (!urls.includes(lhr.requestedUrl)) {
    throw new Error(`nieoczekiwany adres ${lhr.requestedUrl}`);
  }
  if (lhr.configSettings.formFactor !== profile) {
    throw new Error(`zebrano z profilem ${lhr.configSettings.formFactor}`);
  }
  if (Date.parse(lhr.fetchTime) < startedAt) {
    throw new Error("pomiar sprzed bieżącego uruchomienia");
  }
  const values = { performance: lhr.categories.performance?.score };
  for (const [key, audit] of Object.entries(METRIC_AUDITS)) {
    values[key] = lhr.audits[audit]?.numericValue;
  }
  const missing = Object.keys(values).filter(
    (key) => !Number.isFinite(values[key]),
  );
  if (missing.length) throw new Error(`brak wartości: ${missing.join(", ")}`);
  return { lhr, values };
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

// Scores use Lighthouse's 0–100 scale; CLS keeps Lighthouse's three decimals.
const round = (key, value) => {
  if (key === "performance") return Math.round(value * 100);
  if (key === "cls") return Math.round(value * 1000) / 1000;
  return Math.round(value);
};
const rounded = (values) =>
  Object.fromEntries(
    Object.keys(UNITS).map((key) => [key, round(key, values[key])]),
  );

const toReportPath = (file) =>
  path.relative(reportsDir, file).split(path.sep).join("/");

const summarize = (startedAt, errors) => {
  const results = [];
  const profiles = {};
  let environment = null;

  for (const profile of Object.keys(PROFILES)) {
    const manifestPath = path.join(reportsDir, profile, "manifest.json");
    const manifest = existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, "utf8"))
      : [];
    const runsByUrl = new Map(urls.map((url) => [url, []]));
    const seen = new Set();

    for (const entry of manifest) {
      const report = toReportPath(entry.jsonPath);
      if (seen.has(report)) {
        errors.push(`${report}: plik raportu nadpisany przez inny przebieg`);
        continue;
      }
      seen.add(report);
      try {
        const { lhr, values } = readRun(entry, profile, startedAt[profile]);
        const { configSettings: settings } = lhr;
        environment ??= {
          lighthouseVersion: lhr.lighthouseVersion,
          userAgent: lhr.environment.hostUserAgent,
        };
        profiles[profile] ??= {
          formFactor: settings.formFactor,
          screenEmulation: settings.screenEmulation,
          throttlingMethod: settings.throttlingMethod,
          throttling: settings.throttling,
        };
        runsByUrl.get(lhr.requestedUrl).push({
          fetchTime: lhr.fetchTime,
          json: report,
          html: toReportPath(entry.htmlPath),
          // Lighthouse's host CPU benchmark; low values make simulated results less reliable.
          benchmarkIndex: Math.round(lhr.environment.benchmarkIndex),
          raw: values,
          warnings: lhr.runWarnings,
        });
      } catch (error) {
        errors.push(`${report}: ${error.message}`);
      }
    }

    for (const [url, runs] of runsByUrl) {
      const route = new URL(url).pathname;
      if (runs.length !== runsPerUrl) {
        errors.push(
          `${profile} ${route}: ${runs.length}/${runsPerUrl} poprawnych pomiarów`,
        );
      }
      runs.sort((a, b) => Date.parse(a.fetchTime) - Date.parse(b.fetchTime));
      const medians = Object.fromEntries(
        Object.keys(UNITS).map((key) => [
          key,
          median(runs.map(({ raw }) => raw[key])),
        ]),
      );
      results.push({
        route,
        profile,
        completedRuns: runs.length,
        median: runs.length ? rounded(medians) : null,
        warnings: [...new Set(runs.flatMap(({ warnings }) => warnings))],
        runs: runs.map(({ fetchTime, json, html, benchmarkIndex, raw }) => ({
          fetchTime,
          json,
          html,
          benchmarkIndex,
          ...rounded(raw),
        })),
      });
    }
  }

  const completedRuns = results.reduce(
    (sum, result) => sum + result.completedRuns,
    0,
  );
  return {
    generatedAt: new Date().toISOString(),
    status: errors.length ? "incomplete" : "complete",
    expectedRuns: urls.length * Object.keys(PROFILES).length * runsPerUrl,
    completedRuns,
    origin,
    ...environment,
    units: UNITS,
    profiles,
    results,
    errors,
  };
};

const main = async () => {
  const chromePath = process.env.CHROME_PATH || chromium.executablePath();
  checkSetup(chromePath);
  rmSync(reportsDir, { recursive: true, force: true });
  mkdirSync(reportsDir, { recursive: true });
  if (ignoredLhciVariables.length) {
    console.log(
      `Pominięto zmienne środowiskowe ${ignoredLhciVariables.join(", ")}; ustawienia określa ${configFile}.`,
    );
  }

  const startedAt = {};
  const errors = [];
  let preview = null;
  try {
    preview = await startPreview();
    for (const [profile, flags] of Object.entries(PROFILES)) {
      if (interrupted) break;
      console.log(
        `\nLighthouse, profil ${profile}: ${urls.length} strony × ${runsPerUrl} pomiary`,
      );
      startedAt[profile] = Date.now();
      if (!(await lhci("collect", [`--chromePath=${chromePath}`, ...flags]))) {
        errors.push(`${profile}: lhci collect nie zakończył zbierania wyników`);
      }
      if (interrupted) break;
      // Exports this profile's collected runs, including those of an incomplete collection.
      const outputDir = path.join(reportsDir, profile);
      if (!(await lhci("upload", [`--outputDir=${outputDir}`]))) {
        errors.push(`${profile}: lhci upload nie zapisał raportów lokalnie`);
      }
    }
  } catch (error) {
    errors.push(error.message);
  } finally {
    if (preview && !(await stopPreview(preview))) {
      errors.push(
        `Vite Preview nie zakończył działania w ciągu ${STOP_TIMEOUT_MS / 1000} s`,
      );
    }
  }
  if (interrupted) errors.unshift(`Przerwano sygnałem ${interrupted}`);

  const summary = summarize(startedAt, errors);
  writeFileSync(
    path.join(reportsDir, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  console.log("\nMediany Lighthouse (symulowane warunki laboratoryjne):");
  console.table(
    summary.results.map(({ profile, route, completedRuns, median }) => ({
      profile,
      route,
      runs: `${completedRuns}/${runsPerUrl}`,
      ...median,
    })),
  );
  console.log("Podsumowanie: reports/performance/summary.json");

  const warnings = new Set(summary.results.flatMap(({ warnings }) => warnings));
  if (warnings.size) {
    console.warn("\nOstrzeżenia Lighthouse (strony i profile w summary.json):");
    warnings.forEach((warning) => console.warn(`  ${warning}`));
  }

  if (summary.status === "complete") {
    console.log(
      `Pomiar bazowy kompletny: ${summary.completedRuns}/${summary.expectedRuns} pomiarów.`,
    );
    return;
  }
  console.error(
    `\nPomiar bazowy niekompletny: ${summary.completedRuns}/${summary.expectedRuns} poprawnych pomiarów.`,
  );
  summary.errors.forEach((error) => console.error(`  ${error}`));
  process.exitCode = EXIT_CODES[interrupted] ?? 1;
};

main().catch((error) => {
  console.error(error.message);
  children.forEach(stop);
  process.exitCode = 1;
});
