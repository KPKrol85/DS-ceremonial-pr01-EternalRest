# Eternal Rest

## PL

### Przegląd projektu

Eternal Rest to polskojęzyczny, statyczny projekt demonstracyjny witryny wielostronicowej prezentującej koncepcję usług domu pogrzebowego, pakiety cenowe, informacje o firmie i poradnik dla rodzin. Projekt KP_Code Digital Studio składa się ze stron HTML ze wspólnymi stylami i interakcjami w JavaScript.

Formularz kontaktowy jest demonstracją interfejsu: skrypt sprawdza wypełnienie pól, wyświetla komunikat i resetuje formularz. Przy działającym JavaScripcie nie wysyła zgłoszenia ani nie zapisuje danych na serwerze. Bez skryptu formularz może wykonać domyślne żądanie GET z polami w adresie; nie należy używać go bez JavaScriptu ani wpisywać rzeczywistych danych. Mapa dojazdu jest ilustracją SVG; stopka prowadzi do regulaminu, polityki prywatności i polityki cookies, natomiast odnośniki społecznościowe pozostają placeholderami.

### Wersja online

Publiczna wersja demonstracyjna projektu: [ds-ceremonial-pr01-eternalrest.netlify.app](https://ds-ceremonial-pr01-eternalrest.netlify.app/)

### Kluczowe funkcje

- Motyw jasny, ciemny i systemowy z zapisem preferencji w przeglądarce.
- Rozwijane menu mobilne oraz przycisk powrotu na górę strony.
- Filtrowanie pakietów według rodzaju ceremonii i rozwijanie ich szczegółów.
- Akordeony FAQ na stronie głównej i w poradniku.
- Wybór preferowanej formy kontaktu i lokalna walidacja niepustych pól formularza.
- Regulamin (17 sekcji), polityka prywatności (14 sekcji) i polityka cookies (9 sekcji) z natywnymi spisami treści i odnośnikami powrotu do spisu, działającymi bez JavaScriptu. Polityka prywatności opisuje rzeczywiste działanie korespondencji e-mail, zapisu motywu i formularza demonstracyjnego, a polityka cookies – zapis motywu w `localStorage` jako jedyną technologię przechowywania danych, bez plików cookies ustawianych przez aplikację.

### Stack technologiczny

- HTML, CSS z właściwościami niestandardowymi oraz Vanilla JavaScript ładowany jako moduł ES.
- Vite do developmentu, budowania wielu stron i podglądu wyniku.
- PostCSS z Autoprefixer do przetwarzania CSS.
- ESLint do analizy JavaScript i Prettier do formatowania.
- Sharp i fast-glob w osobnym skrypcie konwersji obrazów.
- Node.js i npm jako środowisko narzędziowe; zależności zapisane w `package-lock.json`.

### Architektura

Źródłem treści są pliki HTML w katalogu głównym. Kanoniczne nazwy plików i trasy używają języka angielskiego, a treść interfejsu pozostaje polska. Nawigacja korzysta ze zwykłych odnośników między stronami, bez routera po stronie klienta.

Wspólne elementy stron mają jedno źródło w katalogu `partials/`: `site-header.html` (odnośnik pomijający i nagłówek), `footer-marketing.html` (stopka sześciu stron usługowych), `footer-legal.html` (stopka `terms.html`, `privacy.html` i `cookies.html`), `back-to-top.html` oraz `disclosure-init.html` — skrypt inline w `<head>` stron `index.html`, `guide.html` i `pricing.html`, który utrzymuje zwinięte FAQ i szczegóły pakietów do uruchomienia `main.js`, a gdy moduł się nie wczyta, przywraca ich wersję bez JavaScriptu; ewentualna polityka CSP musi dopuścić ten skrypt, np. przez hash. Strona wskazuje fragment znacznikiem `<!-- partial:nazwa -->` w miejscu, w którym ma się on pojawić. Lokalna wtyczka w `vite.config.js` (hook `transformIndexHtml`, wykonywany przed własnym przetwarzaniem HTML przez Vite) wstawia fragmenty podczas `npm run dev` i `npm run build`, dlatego `dist/` i `npm run preview` zawierają kompletne strony. Odnośnik oznaczony we fragmencie atrybutem `data-partial-current` otrzymuje `aria-current="page"` na stronie, do której prowadzi; sam atrybut nie trafia do wyniku. Brakujący plik fragmentu lub niepoprawny znacznik kończy przetwarzanie strony błędem, a zmiana fragmentu w trybie deweloperskim przeładowuje otwarte strony. Fragmenty nie są stronami produkcyjnymi, ponieważ wejścia Vite powstają wyłącznie z plików w katalogu głównym.

`css/main.css` importuje kolejno tokeny, style bazowe, układ, komponenty, klasy pomocnicze i style stron. `css/pages/legal.css` jest wspólnym arkuszem rodziny stron prawnych, używanym przez `terms.html`, `privacy.html` i `cookies.html`. `js/main.js` zawiera wspólne zachowania i podłącza interakcje do elementów oznaczonych atrybutami `data-*`. Pliki HTML w katalogu głównym są źródłem stron produkcyjnych: `vite.config.js` automatycznie wyznacza wejścia Vite MPA ze wszystkich plików `*.html` w katalogu głównym, bez przeszukiwania podkatalogów. Dodanie lub zmiana nazwy strony nie wymaga edycji `vite.config.js`.

### Struktura projektu

```text
.
├── index.html                 # Strona główna
├── about.html                 # Informacje o firmie
├── services.html              # Usługi
├── pricing.html               # Pakiety i filtr
├── contact.html               # Kontakt i formularz demonstracyjny
├── guide.html                 # Poradnik i FAQ
├── terms.html                 # Regulamin projektu demonstracyjnego
├── privacy.html               # Polityka prywatności projektu demonstracyjnego
├── cookies.html               # Polityka cookies projektu demonstracyjnego
├── partials/                  # Wspólny nagłówek, dwie stopki, przycisk powrotu i inicjalizator ujawnień
│   ├── site-header.html
│   ├── footer-marketing.html
│   ├── footer-legal.html
│   ├── back-to-top.html
│   └── disclosure-init.html
├── assets/
│   ├── icons/
│   ├── illustrations/
│   └── src-images/
├── css/
│   ├── main.css
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── utilities.css
│   └── pages/
│       ├── home.css
│       ├── services.css
│       └── legal.css
├── js/main.js
├── scripts/
│   ├── check-references.js
│   └── convert-images.js
├── .eslintrc.cjs
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── vite.config.js
├── LICENSE.md
└── README.md
```

### Instalacja

Wymagane są Node.js 22.20+ z linii 22.x oraz npm 10 lub nowszy. W katalogu głównym repozytorium zainstaluj zależności zgodnie z plikiem blokady:

```bash
npm ci
```

### Dostępne skrypty

Polecenia są zdefiniowane w [package.json](package.json).

| Polecenie | Działanie |
| --- | --- |
| `npm run dev` | Uruchamia Vite z `--host`, udostępniając serwer także w sieci lokalnej. |
| `npm run build` | Buduje wszystkie strony HTML z katalogu głównego przez `vite build`. |
| `npm run preview` | Uruchamia `vite preview`; wymaga wcześniejszego buildu. |
| `npm run lint` | Uruchamia ESLint wyłącznie dla `js/**/*.js`. |
| `npm run check:references` | Sprawdza odwołania do identyfikatorów i duplikaty `id` w zbudowanych stronach `dist/`; wymaga wcześniejszego buildu i niczego nie zapisuje. |
| `npm run format` | Uruchamia `prettier --write .` i nadpisuje niesformatowane pliki w zakresie formatowania. |
| `npm run format:check` | Uruchamia `prettier --check .`; zgłasza różnice w formatowaniu bez zmieniania plików. |
| `npm run images:convert` | Konwertuje PNG/JPG/JPEG z `assets/src-images/` do WebP i AVIF w generowanym `assets/images/`. |

Strony otwieraj przez serwer Vite, korzystając z adresu podanego w terminalu. Bezpośrednie otwieranie plików z dysku nie zapewnia obsługi skryptu modułowego.

### Build produkcyjny

Vite generuje `dist/` ze wszystkimi stronami HTML z katalogu głównego oraz przetworzonymi zasobami. Importy CSS są scalane, Autoprefixer dodaje prefiksy, a wynikowe CSS i JavaScript podlegają minifikacji. Emitowane zasoby otrzymują nazwy z hashem. Ustawienie `base: "./"` zapewnia względne ścieżki zasobów w wyniku.

`dist/` jest wykluczony z Git i nie należy edytować go ręcznie. Podgląd produkcyjny serwuje ten katalog. Repozytorium nie zawiera konfiguracji hostingu ani automatycznego wdrażania.

Konwersja obrazów jest osobnym etapem i nie jest wywoływana przez build. Obecne zasoby graficzne są zapisane jako SVG bezpośrednio w HTML; repozytorium nie zawiera zdjęć do konwersji. Skrypt zapisuje pliki w płaskim katalogu wynikowym, dlatego nazwy źródłowych zdjęć powinny być unikalne również między podkatalogami. Nowe obrazy trzeba wskazać w HTML lub CSS, aby zostały uwzględnione w przetwarzaniu zasobów przez Vite.

### Testy i walidacja

Konfiguracja ESLint korzysta z `eslint:recommended`, środowiska przeglądarkowego i ostrzeżeń dla nieużywanych zmiennych. Zakres lintowania nie obejmuje HTML, CSS ani skryptów w `scripts/`. Repozytorium nie zawiera automatycznych testów jednostkowych ani przeglądarkowych; sama konfiguracja narzędzi nie potwierdza poprawności interfejsu.

`npm run check:references` sprawdza odwołania do identyfikatorów w stronach HTML z katalogu głównego `dist/`, czyli już po wstawieniu fragmentów z `partials/` przez Vite. Dlatego wymaga wcześniejszego `npm run build` i sam go nie uruchamia. Na każdej stronie wykrywa zduplikowane `id` oraz odwołania bez celu w `aria-controls`, `aria-describedby` i `aria-labelledby` (każdy identyfikator z listy rozdzielonej spacjami osobno), w `label[for]`, w odnośnikach `href="#id"` na tej samej stronie i w odnośnikach do fragmentów innych stron projektu, np. `services.html#id`, sprawdzanych na stronie docelowej. Ten sam `id` na różnych stronach nie jest duplikatem. Pomijane są adresy zewnętrzne, `mailto:`, `tel:` i placeholdery `href="#"`. Każdy błąd podaje stronę, wiersz, atrybut oraz brakujący lub zduplikowany identyfikator, a polecenie kończy się wtedy kodem różnym od zera; przy powodzeniu podaje liczbę sprawdzonych stron i odwołań. Brak `dist/` również kończy się błędem z poleceniem wykonania buildu. Skrypt korzysta wyłącznie z wbudowanych modułów Node.js, niczego nie zapisuje i nie jest częścią `npm run build`. Sprawdza tylko istnienie celów odwołań, a nie semantykę ARIA ani działanie interakcji w przeglądarce.

`npm run format:check` porównuje pliki z wynikiem Prettiera 3 w ustawieniach domyślnych (repozytorium nie zawiera konfiguracji Prettiera) i niczego nie zapisuje; kończy się błędem, gdy którykolwiek plik w zakresie wymaga formatowania. Jego zapisującym odpowiednikiem jest `npm run format`. Sprawdzenie dotyczy wyłącznie zapisu kodu i nie zastępuje lintowania ESLint ani testów działania strony w przeglądarce. Repozytorium nie przeszło formatowania bazowego, dlatego sprawdzenie zgłasza obecnie istniejące rozbieżności. Prettier domyślnie oczekuje końców linii LF, więc w kopii roboczej z końcami CRLF (np. w Windows z `core.autocrlf=true`) zgłasza każdy plik w zakresie.

Oba polecenia pomijają pliki wskazane w `.gitignore` i `.prettierignore`. `.prettierignore` wyłącza generowany `dist/`, `node_modules/`, `package-lock.json`, `LICENSE.md`, strony prawne `terms.html`, `privacy.html` i `cookies.html` oraz archiwum raportów `docs/archive/`, aby formatowanie nie zmieniało tych plików. Wykluczone pliki nie są też sprawdzane; wspólny nagłówek i stopki, także te używane przez strony prawne, znajdują się jednak w `partials/` i podlegają sprawdzeniu. `.prettierignore` działa wyłącznie dla Prettiera i nie chroni plików przed innymi narzędziami ani ręczną edycją.

### Dostępność

- Semantyczne obszary `header`, `nav`, `main`, `footer`, odnośnik pomijający nawigację i style `:focus-visible`.
- Menu mobilne z aktualizacją `aria-expanded` i `aria-hidden`, przenoszeniem i przywracaniem fokusu, pętlą klawisza Tab, zamykaniem przez Escape oraz blokadą przewijania. Zamknięte menu i niewidoczny przycisk powrotu na górę nie przyjmują fokusu.
- Bieżąca strona oznaczona `aria-current="page"` w nawigacji głównej, a na stronach prawnych także w odnośnikach do dokumentów prawnych w stopce.
- Akordeony i szczegóły pakietów synchronizujące `aria-expanded` z widocznością paneli.
- Pola formularza z etykietami i powiązanymi komunikatami przez `aria-describedby`; błędy oznaczane przez `aria-invalid`, lokalny komunikat zakończenia z `role="status"` i przeniesieniem fokusu.
- Obsługa `prefers-reduced-motion` wyłączająca czasy przejść CSS i płynne przewijanie.

Są to mechanizmy obecne w kodzie, bez deklaracji zgodności z WCAG.

### SEO

Każda strona zawiera polski atrybut języka dokumentu, własny tytuł i opis meta. Repozytorium nie zawiera konfiguracji adresów kanonicznych, Open Graph, danych strukturalnych, mapy witryny ani reguł dla robotów.

### Dane i trwałość stanu

Treści i ceny są zapisane w HTML. Preferencja motywu trafia do `localStorage` pod kluczem `eternalRestTheme` jako obiekt z wersją `1` i trybem `auto`, `light` lub `dark`. Zapis powstaje dopiero po użyciu przełącznika motywu lub przycisku „Tryb systemowy” i nie ma terminu wygaśnięcia. Filtr cen, rozwinięte panele i formularz nie mają trwałego zapisu; implementacja nie korzysta z backendu ani bazy danych. Aplikacja nie ustawia plików cookies i nie korzysta z `sessionStorage`, IndexedDB, Cache Storage, Service Workera ani narzędzi analitycznych lub marketingowych, dlatego nie zawiera banera cookies ani mechanizmu zarządzania zgodą.

### Licencja

Projekt podlega [Własnościowej Licencji Projektu KP_CODE](LICENSE.md), wersja 1.0, i nie jest oprogramowaniem open source. Licencja opisuje ograniczony użytek lokalny do prywatnej, niekomercyjnej oceny; publiczne wdrożenie, redystrybucja i wykorzystanie komercyjne wymagają odrębnej pisemnej zgody. Materiały podmiotów trzecich zachowują własne warunki licencyjne.

## EN

### Project Overview

Eternal Rest is a Polish-language static multi-page demonstration project presenting a funeral-home service concept, pricing packages, company information and guidance for families. This KP_Code Digital Studio project consists of HTML pages with shared styles and JavaScript interactions.

The contact form is an interface demonstration: its script checks for non-empty fields, displays a message and resets the form. With JavaScript working, it does not send an enquiry or store data on a server. Without the script, the form can perform a default GET request with fields in the URL; do not use it without JavaScript or enter real data. The location map is an SVG illustration; the footer links to the Terms, Privacy Policy and Cookies Policy pages, while social links remain placeholders.

### Live Version

Public project demo: [ds-ceremonial-pr01-eternalrest.netlify.app](https://ds-ceremonial-pr01-eternalrest.netlify.app/)

### Key Features

- Light, dark and system themes with preferences stored in the browser.
- Expandable mobile navigation and a back-to-top button.
- Package filtering by ceremony type and expandable package details.
- FAQ accordions on the home and guide pages.
- Preferred contact method selection and local validation for non-empty form fields.
- Terms (17 sections), Privacy Policy (14 sections) and Cookies Policy (9 sections) with native section indexes and return links that work without JavaScript. The Privacy Policy describes the actual behavior of e-mail correspondence, theme storage and the demonstration form, while the Cookies Policy documents theme storage in `localStorage` as the only storage technology, with no application-set cookies.

### Tech Stack

- HTML, CSS custom properties and Vanilla JavaScript loaded as an ES module.
- Vite for development, multi-page builds and build previews.
- PostCSS with Autoprefixer for CSS processing.
- ESLint for JavaScript analysis and Prettier for formatting.
- Sharp and fast-glob in a separate image conversion script.
- Node.js and npm for tooling; dependencies recorded in `package-lock.json`.

### Architecture

Root HTML files own the content. Canonical filenames and routes use English technical names, while interface content remains Polish. Navigation uses ordinary links between pages, without a client-side router.

Shared page chrome has a single source in `partials/`: `site-header.html` (skip link and header), `footer-marketing.html` (footer of the six service pages), `footer-legal.html` (footer of `terms.html`, `privacy.html` and `cookies.html`), `back-to-top.html` and `disclosure-init.html`, an inline `<head>` script on `index.html`, `guide.html` and `pricing.html` that keeps the FAQ and package details collapsed until `main.js` runs and restores their no-JavaScript version if the module fails to load; a Content Security Policy must allow this script, for example by hash. A page places a partial with a `<!-- partial:name -->` marker where it should appear. A local plugin in `vite.config.js` (a `transformIndexHtml` hook that runs before Vite's own HTML processing) inserts the partials during `npm run dev` and `npm run build`, so `dist/` and `npm run preview` contain complete pages. A link marked with `data-partial-current` in a partial receives `aria-current="page"` on the page it points to; the attribute itself is not emitted. A missing partial file or an invalid marker stops processing of the page with an error, and editing a partial in development reloads open pages. Partials are not production pages, because Vite entries are derived only from root-level files.

`css/main.css` imports tokens, base styles, layout, components, utilities and page styles in that order. `css/pages/legal.css` is the shared stylesheet for legal pages, used by `terms.html`, `privacy.html` and `cookies.html`. `js/main.js` contains shared behavior and attaches interactions to elements marked with `data-*` attributes. Root-level HTML files are the source of the production pages: `vite.config.js` derives the Vite MPA entry points automatically from all root-level `*.html` files, without scanning subdirectories. Adding or renaming a page does not require editing `vite.config.js`.

### Project Structure

```text
.
├── index.html                 # Home page
├── about.html                 # Company information
├── services.html              # Services
├── pricing.html               # Packages and filter
├── contact.html               # Contact and demonstration form
├── guide.html                 # Guide and FAQ
├── terms.html                 # Demonstration project Terms
├── privacy.html               # Demonstration project Privacy Policy
├── cookies.html               # Demonstration project Cookies Policy
├── partials/                  # Shared header, two footers, back-to-top control and disclosure initializer
│   ├── site-header.html
│   ├── footer-marketing.html
│   ├── footer-legal.html
│   ├── back-to-top.html
│   └── disclosure-init.html
├── assets/
│   ├── icons/
│   ├── illustrations/
│   └── src-images/
├── css/
│   ├── main.css
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── utilities.css
│   └── pages/
│       ├── home.css
│       ├── services.css
│       └── legal.css
├── js/main.js
├── scripts/
│   ├── check-references.js
│   └── convert-images.js
├── .eslintrc.cjs
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── vite.config.js
├── LICENSE.md
└── README.md
```

### Installation

Node.js 22.20+ within the 22.x line and npm 10 or newer are required. Install dependencies from the lockfile in the repository root:

```bash
npm ci
```

### Available Scripts

Commands are defined in [package.json](package.json).

| Command | Behavior |
| --- | --- |
| `npm run dev` | Starts Vite with `--host`, also exposing the server to the local network. |
| `npm run build` | Builds all root-level HTML pages through `vite build`. |
| `npm run preview` | Starts `vite preview`; requires a prior build. |
| `npm run lint` | Runs ESLint only on `js/**/*.js`. |
| `npm run check:references` | Checks ID references and duplicate IDs in the built `dist/` pages; requires a prior build and writes nothing. |
| `npm run format` | Runs `prettier --write .` and overwrites unformatted files within the formatting scope. |
| `npm run format:check` | Runs `prettier --check .`; reports formatting differences without changing files. |
| `npm run images:convert` | Converts PNG/JPG/JPEG from `assets/src-images/` into WebP and AVIF in the generated `assets/images/` directory. |

Open pages through the Vite server using the address printed in the terminal. Opening files directly from disk does not provide the required module-script support.

### Production Build

Vite generates `dist/` containing all root-level HTML pages and processed assets. CSS imports are combined, Autoprefixer adds prefixes, and the resulting CSS and JavaScript are minified. Emitted assets receive hashed filenames. The `base: "./"` setting produces relative asset paths in the output.

`dist/` is excluded from Git and should not be edited manually. Production preview serves this directory. The repository contains no hosting or automated deployment configuration.

Image conversion is a separate step and is not invoked by the build. Current graphics are SVG embedded directly in HTML; the repository contains no photographs to convert. The script writes to a flat output directory, so source image basenames should be unique across subdirectories. New images must be referenced in HTML or CSS to enter Vite's asset processing workflow.

### Testing and Validation

ESLint is configured with `eslint:recommended`, a browser environment and warnings for unused variables. Linting does not cover HTML, CSS or the scripts in `scripts/`. The repository contains no automated unit or browser tests; tool configuration alone does not establish interface correctness.

`npm run check:references` checks ID references in the root-level HTML pages of `dist/`, after Vite has inserted the `partials/` content. It therefore requires a prior `npm run build` and does not run one itself. On every page it reports duplicate `id` values and references without a target in `aria-controls`, `aria-describedby` and `aria-labelledby` (each ID of a whitespace-separated list separately), in `label[for]`, in same-page `href="#id"` links and in fragment links to other project pages, such as `services.html#id`, which are checked on the target page. The same `id` on different pages is not a duplicate. External URLs, `mailto:`, `tel:` and `href="#"` placeholders are skipped. Each error names the page, line, attribute and the missing or duplicated ID, and the command then exits with a non-zero code; on success it reports how many pages and references it checked. A missing `dist/` also fails, with an instruction to build first. The script uses only built-in Node.js modules, writes nothing and is not part of `npm run build`. It checks only that reference targets exist, not ARIA semantics or interactive behavior in a browser.

`npm run format:check` compares files with Prettier 3 output using default options (the repository contains no Prettier configuration) and writes nothing; it fails when any in-scope file needs formatting. `npm run format` is its writing counterpart. The check covers code layout only and does not replace ESLint linting or runtime testing of the site in a browser. The repository has not received a baseline format, so the check currently reports existing differences. Prettier expects LF line endings by default, so in a working copy with CRLF endings (for example on Windows with `core.autocrlf=true`) it reports every in-scope file.

Both commands skip files matched by `.gitignore` and `.prettierignore`. `.prettierignore` excludes the generated `dist/`, `node_modules/`, `package-lock.json`, `LICENSE.md`, the legal pages `terms.html`, `privacy.html` and `cookies.html`, and the report archive in `docs/archive/`, so formatting does not change these files. Excluded files are not checked either; the shared header and footers, including those used by the legal pages, live in `partials/` and are checked. `.prettierignore` applies only to Prettier and does not protect files from other tools or manual edits.

### Accessibility

- Semantic `header`, `nav`, `main` and `footer` regions, a skip link and `:focus-visible` styles.
- Mobile navigation with synchronized `aria-expanded` and `aria-hidden`, focus transfer and restoration, Tab looping, Escape dismissal and scroll locking. The closed menu and the hidden back-to-top control cannot receive focus.
- The current page is marked with `aria-current="page"` in the main navigation and, on the legal pages, also in the footer links to the legal documents.
- Accordions and package details synchronizing `aria-expanded` with panel visibility.
- Form fields with labels and messages connected through `aria-describedby`; errors marked with `aria-invalid`, plus a local completion message using `role="status"` and focus transfer.
- `prefers-reduced-motion` handling that disables CSS transition durations and smooth scrolling.

These are mechanisms present in the code, without a claim of WCAG compliance.

### SEO

Each page declares Polish as its document language and has its own title and meta description. The repository contains no canonical URL configuration, Open Graph metadata, structured data, sitemap or robot directives.

### Data and State Persistence

Content and prices are stored in HTML. The theme preference is saved in `localStorage` under `eternalRestTheme` as an object with version `1` and mode `auto`, `light` or `dark`. The entry is created only when the theme toggle or the system-mode button is used and has no expiry. The pricing filter, expanded panels and form have no persistent storage; the implementation uses no backend or database. The application sets no cookies and uses no `sessionStorage`, IndexedDB, Cache Storage, Service Worker, analytics or marketing tools, so it includes no cookie banner or consent manager.

### License

The project is covered by the [KP_CODE Proprietary Project License](LICENSE.md), version 1.0, and is not open-source software. The license describes limited local use for private, non-commercial evaluation; public deployment, redistribution and commercial use require separate written permission. Third-party materials retain their own license terms.
