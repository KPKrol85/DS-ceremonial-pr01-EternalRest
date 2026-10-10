# Eternal Rest — Workflow Improvements

**Analysis date:** 2026-10-06
**Completed and archived:** 2026-10-08
**Status:** COMPLETED — all five selected improvements closed.
**Scope:** Project-wide development workflow.

## Overview

Five workflow improvements were completed or resolved, covering improvement-report maintenance, documentation ownership, development environment requirements, Vite page discovery and code formatting.

During this cycle, the project owner adopted a simplified documentation model. This superseded IMP-WORKFLOW-01 and replaced the original approach proposed for IMP-WORKFLOW-02.

The remaining improvements were implemented within the existing technology stack, without additional dependencies, CI infrastructure or deployment automation.

## Completed improvements

### IMP-WORKFLOW-01 — Define the improvement-report lifecycle in the project contract

- **Status:** COMPLETED — implemented and subsequently superseded.
- **Result:** Initially defined improvement-report status, lifecycle and archiving conventions in `AGENTS.md`. The rules were later removed under the owner-approved simplified documentation model, leaving `AGENTS.md` focused on stable project guardrails.
- **Verification:** Static inspection confirmed the original implementation and its subsequent removal. No runtime checks were necessary because application behavior was unchanged. The original lifecycle conventions were no longer active when this report was archived.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-02 — Align project documentation with the simplified documentation model

- **Status:** COMPLETED — resolved through an owner-approved alternative.
- **Result:** Removed the redundant project context document and simplified documentation ownership. `README.md` became the primary project reference, `AGENTS.md` retained stable agent guardrails, `CLAUDE.md` became import-only, and `docs/CHANGELOG.md` retained significant changes. Both README languages received the confirmed public demo link. The original proposal for a manual release procedure and deployed-revision tracking was not adopted.
- **Verification:** Static inspection confirmed document removal, consistent README commands and paths, PL/EN content alignment and updated document references. No deployment or runtime verification was performed. The deployed revision remained untracked by design.
- **Impact:** High
- **Effort:** Small

### IMP-WORKFLOW-03 — Declare the supported Node.js and npm versions

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added Node.js `>=22.20.0 <23` and npm `>=10` requirements to `package.json`, synchronized the root entry in `package-lock.json` and documented the supported versions in both README languages. Dependency versions and installation behavior remained unchanged.
- **Verification:** `npm ci`, `npm run lint` and `npm run build` passed without engine warnings on Node.js 22.23.2 and npm 10.9.8. Other Node.js release lines were not tested. Engine ranges are advisory without `engine-strict`.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-04 — Make the root HTML pages the single source of the page inventory

- **Status:** COMPLETED — implemented and verified.
- **Result:** Replaced the manually maintained Vite MPA page list with automatic discovery of root-level `*.html` files using Node.js `readdirSync`. Preserved `appType: "mpa"`, relative base paths and existing output structure. Updated Polish and English README descriptions to remove hard-coded page counts.
- **Verification:** The production build was byte-identical to the previous baseline. A temporary root-level HTML page was included automatically, while a nested test page was excluded. Both probes were removed afterward. Any regular root-level `*.html` file, including a temporary draft, remains eligible for the build.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-05 — Give the Prettier workflow a defined scope and a read-only check

- **Status:** COMPLETED — implemented and verified within the approved scope.
- **Result:** Added `.prettierignore` to exclude generated output, dependencies, the lockfile, licensing content, legal pages and archived documents. Added the read-only `format:check` script while preserving the existing writing command and Prettier defaults. Updated README in both languages. No repository-wide baseline formatting was performed.
- **Verification:** `npm run format:check` ran without modifying files but exited with code 1 because of existing formatting differences. An LF-normalized copy identified 12 files with content differences; checksum and Git checks confirmed the command was read-only. Exclusions were verified without running the writing command. LF checkout rules were added later in a separate change, but a fully passing formatting baseline was not established.
- **Impact:** Medium
- **Effort:** Medium

## Excluded observations

The original workflow analysis identified additional issues outside the five approved improvements:

- **Changelog heading hierarchy:** Corrected under IMP-WORKFLOW-02.
- **README structure trees:** Their application-only scope was intentionally retained under IMP-WORKFLOW-02.
- **`.gitignore` documentation comments:** At archiving, the comments referenced removed or nonexistent files. This was not corrected within the workflow improvement cycle.
- **Development server exposure:** The existing development command exposed the server to the local network. Changing this behavior required a separate decision.
- **Converted image ownership:** The tracking policy for converted images had not been decided.
- **Lint coverage:** Node tooling files were outside the existing ESLint scope.

These are historical observations from the workflow review, not confirmation that the issues remain open in the current repository.

## Verification limitations

The original workflow analysis was based on source inspection and did not run npm commands, browser tests or deployment checks.

Verification results listed under individual improvements reflect checks recorded during their implementation. No additional tests were performed solely for archiving.

The archived report documents historical decisions and outcomes; current repository files remain the source of truth.
