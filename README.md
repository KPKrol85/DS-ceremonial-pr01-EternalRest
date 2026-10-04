# Eternal Rest

## PL

### Przegląd projektu

Eternal Rest to polskojęzyczna, statyczna witryna wielostronicowa prezentująca usługi domu pogrzebowego, pakiety cenowe, informacje o firmie i poradnik dla rodzin. Projekt KP_Code Digital Studio składa się z sześciu stron HTML ze wspólnymi stylami i interakcjami w JavaScript.

Formularz kontaktowy jest demonstracją interfejsu: skrypt sprawdza wypełnienie pól, wyświetla komunikat i resetuje formularz. Nie wysyła zgłoszenia ani nie zapisuje danych na serwerze. Mapa dojazdu jest ilustracją SVG; odnośniki społecznościowe i prawne w stopce nie prowadzą do docelowych stron.

### Wersja online

[Podany adres podglądu Eternal Rest](https://ds-ceremonial-pr01-eternalrest.netlify.app/) — jego dostępność i zgodność z bieżącą wersją repozytorium nie zostały potwierdzone.

### Kluczowe funkcje

- Motyw jasny, ciemny i systemowy z zapisem preferencji w przeglądarce.
- Rozwijane menu mobilne oraz przycisk powrotu na górę strony.
- Filtrowanie pakietów według rodzaju ceremonii i rozwijanie ich szczegółów.
- Akordeony FAQ na stronie głównej i w poradniku.
- Wybór preferowanej formy kontaktu i lokalna walidacja niepustych pól formularza.

### Stack technologiczny

- HTML, CSS z właściwościami niestandardowymi oraz Vanilla JavaScript ładowany jako moduł ES.
- Vite do developmentu, budowania wielu stron i podglądu wyniku.
- PostCSS z Autoprefixer do przetwarzania CSS.
- ESLint do analizy JavaScript i Prettier do formatowania.
- Sharp i fast-glob w osobnym skrypcie konwersji obrazów.
- Node.js i npm jako środowisko narzędziowe; zależności zapisane w `package-lock.json`.

### Architektura

Źródłem treści są pliki HTML w katalogu głównym. Nawigacja korzysta ze zwykłych odnośników między stronami; nagłówek i stopka są zapisane osobno w każdej stronie. Nie ma generatora wspólnych fragmentów ani routera po stronie klienta.

`css/main.css` importuje kolejno tokeny, style bazowe, układ, komponenty, klasy pomocnicze i style stron. `js/main.js` zawiera wspólne zachowania i podłącza interakcje do elementów oznaczonych atrybutami `data-*`. Wszystkie sześć wejść produkcyjnych określa `vite.config.js`.

### Struktura projektu

```text
.
├── index.html                 # Strona główna
├── o-nas.html                 # Informacje o firmie
├── uslugi.html                # Usługi
├── cennik.html                # Pakiety i filtr
├── formularz.html             # Kontakt i formularz demonstracyjny
├── poradnik.html              # Poradnik i FAQ
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
├── js/main.js
├── scripts/convert-images.js
├── .eslintrc.cjs
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── vite.config.js
├── LICENSE.md
└── README.md
```

### Instalacja

Wymagane są Node.js i npm. W katalogu głównym repozytorium zainstaluj zależności zgodnie z plikiem blokady:

```bash
npm ci
```

### Dostępne skrypty

Polecenia są zdefiniowane w [package.json](package.json).

| Polecenie | Działanie |
| --- | --- |
| `npm run dev` | Uruchamia Vite z `--host`, udostępniając serwer także w sieci lokalnej. |
| `npm run build` | Buduje sześć stron przez `vite build`. |
| `npm run preview` | Uruchamia `vite preview`; wymaga wcześniejszego buildu. |
| `npm run lint` | Uruchamia ESLint wyłącznie dla `js/**/*.js`. |
| `npm run format` | Uruchamia `prettier --write .` i zapisuje zmiany w plikach. |
| `npm run images:convert` | Konwertuje PNG/JPG/JPEG z `assets/src-images/` do WebP i AVIF w generowanym `assets/images/`. |

Strony otwieraj przez serwer Vite, korzystając z adresu podanego w terminalu. Bezpośrednie otwieranie plików z dysku nie zapewnia obsługi skryptu modułowego.

### Build produkcyjny

Vite generuje `dist/` z sześcioma stronami HTML oraz przetworzonymi zasobami. Importy CSS są scalane, Autoprefixer dodaje prefiksy, a wynikowe CSS i JavaScript podlegają minifikacji. Emitowane zasoby otrzymują nazwy z hashem. Ustawienie `base: "./"` zapewnia względne ścieżki zasobów w wyniku.

`dist/` jest wykluczony z Git i nie należy edytować go ręcznie. Podgląd produkcyjny serwuje ten katalog. Repozytorium nie zawiera konfiguracji hostingu ani automatycznego wdrażania.

Konwersja obrazów jest osobnym etapem i nie jest wywoływana przez build. Obecne zasoby graficzne są zapisane jako SVG bezpośrednio w HTML; repozytorium nie zawiera zdjęć do konwersji. Skrypt zapisuje pliki w płaskim katalogu wynikowym, dlatego nazwy źródłowych zdjęć powinny być unikalne również między podkatalogami. Nowe obrazy trzeba wskazać w HTML lub CSS, aby zostały uwzględnione w przetwarzaniu zasobów przez Vite.

### Testy i walidacja

Konfiguracja ESLint korzysta z `eslint:recommended`, środowiska przeglądarkowego i ostrzeżeń dla nieużywanych zmiennych. Zakres lintowania nie obejmuje HTML, CSS ani skryptu konwersji obrazów. Repozytorium nie zawiera automatycznych testów jednostkowych ani przeglądarkowych; sama konfiguracja narzędzi nie potwierdza poprawności interfejsu.

### Dostępność

- Semantyczne obszary `header`, `nav`, `main`, `footer`, odnośnik pomijający nawigację i style `:focus-visible`.
- Menu mobilne z aktualizacją `aria-expanded` i `aria-hidden`, przenoszeniem i przywracaniem fokusu, pętlą klawisza Tab, zamykaniem przez Escape oraz blokadą przewijania.
- Akordeony i szczegóły pakietów synchronizujące `aria-expanded` z widocznością paneli.
- Pola formularza z etykietami i powiązanymi komunikatami przez `aria-describedby`; błędy oznaczane przez `aria-invalid`, lokalny komunikat zakończenia z `role="status"` i przeniesieniem fokusu.
- Obsługa `prefers-reduced-motion` wyłączająca czasy przejść CSS i płynne przewijanie.

Są to mechanizmy obecne w kodzie, bez deklaracji zgodności z WCAG.

### SEO

Każda strona zawiera polski atrybut języka dokumentu, własny tytuł i opis meta. Repozytorium nie zawiera konfiguracji adresów kanonicznych, Open Graph, danych strukturalnych, mapy witryny ani reguł dla robotów.

### Dane i trwałość stanu

Treści i ceny są zapisane w HTML. Preferencja motywu trafia do `localStorage` pod kluczem `eternalRestTheme` jako obiekt z wersją `1` i trybem `auto`, `light` lub `dark`. Filtr cen, rozwinięte panele i formularz nie mają trwałego zapisu; implementacja nie korzysta z backendu ani bazy danych.

### Licencja

Projekt podlega [Własnościowej Licencji Projektu KP_CODE](LICENSE.md), wersja 1.0, i nie jest oprogramowaniem open source. Licencja opisuje ograniczony użytek lokalny do prywatnej, niekomercyjnej oceny; publiczne wdrożenie, redystrybucja i wykorzystanie komercyjne wymagają odrębnej pisemnej zgody. Materiały podmiotów trzecich zachowują własne warunki licencyjne.

## EN

### Project Overview

Eternal Rest is a Polish-language static multi-page website presenting funeral-home services, pricing packages, company information and guidance for families. This KP_Code Digital Studio project consists of six HTML pages with shared styles and JavaScript interactions.

The contact form is an interface demonstration: its script checks for non-empty fields, displays a message and resets the form. It does not send an enquiry or store data on a server. The location map is an SVG illustration; social and legal links in the footer do not lead to destination pages.

### Live Version

[Provided Eternal Rest preview URL](https://ds-ceremonial-pr01-eternalrest.netlify.app/) — its availability and correspondence with the current repository revision have not been confirmed.

### Key Features

- Light, dark and system themes with preferences stored in the browser.
- Expandable mobile navigation and a back-to-top button.
- Package filtering by ceremony type and expandable package details.
- FAQ accordions on the home and guide pages.
- Preferred contact method selection and local validation for non-empty form fields.

### Tech Stack

- HTML, CSS custom properties and Vanilla JavaScript loaded as an ES module.
- Vite for development, multi-page builds and build previews.
- PostCSS with Autoprefixer for CSS processing.
- ESLint for JavaScript analysis and Prettier for formatting.
- Sharp and fast-glob in a separate image conversion script.
- Node.js and npm for tooling; dependencies recorded in `package-lock.json`.

### Architecture

Root HTML files own the content. Navigation uses ordinary links between pages; each page contains its own header and footer markup. There is no shared-fragment generator or client-side router.

`css/main.css` imports tokens, base styles, layout, components, utilities and page styles in that order. `js/main.js` contains shared behavior and attaches interactions to elements marked with `data-*` attributes. `vite.config.js` defines all six production entry points.

### Project Structure

```text
.
├── index.html                 # Home page
├── o-nas.html                 # Company information
├── uslugi.html                # Services
├── cennik.html                # Packages and filter
├── formularz.html             # Contact and demonstration form
├── poradnik.html              # Guide and FAQ
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
├── js/main.js
├── scripts/convert-images.js
├── .eslintrc.cjs
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── vite.config.js
├── LICENSE.md
└── README.md
```

### Installation

Node.js and npm are required. Install dependencies from the lockfile in the repository root:

```bash
npm ci
```

### Available Scripts

Commands are defined in [package.json](package.json).

| Command | Behavior |
| --- | --- |
| `npm run dev` | Starts Vite with `--host`, also exposing the server to the local network. |
| `npm run build` | Builds all six pages through `vite build`. |
| `npm run preview` | Starts `vite preview`; requires a prior build. |
| `npm run lint` | Runs ESLint only on `js/**/*.js`. |
| `npm run format` | Runs `prettier --write .` and writes changes to files. |
| `npm run images:convert` | Converts PNG/JPG/JPEG from `assets/src-images/` into WebP and AVIF in the generated `assets/images/` directory. |

Open pages through the Vite server using the address printed in the terminal. Opening files directly from disk does not provide the required module-script support.

### Production Build

Vite generates `dist/` containing six HTML pages and processed assets. CSS imports are combined, Autoprefixer adds prefixes, and the resulting CSS and JavaScript are minified. Emitted assets receive hashed filenames. The `base: "./"` setting produces relative asset paths in the output.

`dist/` is excluded from Git and should not be edited manually. Production preview serves this directory. The repository contains no hosting or automated deployment configuration.

Image conversion is a separate step and is not invoked by the build. Current graphics are SVG embedded directly in HTML; the repository contains no photographs to convert. The script writes to a flat output directory, so source image basenames should be unique across subdirectories. New images must be referenced in HTML or CSS to enter Vite's asset processing workflow.

### Testing and Validation

ESLint is configured with `eslint:recommended`, a browser environment and warnings for unused variables. Linting does not cover HTML, CSS or the image conversion script. The repository contains no automated unit or browser tests; tool configuration alone does not establish interface correctness.

### Accessibility

- Semantic `header`, `nav`, `main` and `footer` regions, a skip link and `:focus-visible` styles.
- Mobile navigation with synchronized `aria-expanded` and `aria-hidden`, focus transfer and restoration, Tab looping, Escape dismissal and scroll locking.
- Accordions and package details synchronizing `aria-expanded` with panel visibility.
- Form fields with labels and messages connected through `aria-describedby`; errors marked with `aria-invalid`, plus a local completion message using `role="status"` and focus transfer.
- `prefers-reduced-motion` handling that disables CSS transition durations and smooth scrolling.

These are mechanisms present in the code, without a claim of WCAG compliance.

### SEO

Each page declares Polish as its document language and has its own title and meta description. The repository contains no canonical URL configuration, Open Graph metadata, structured data, sitemap or robot directives.

### Data and State Persistence

Content and prices are stored in HTML. The theme preference is saved in `localStorage` under `eternalRestTheme` as an object with version `1` and mode `auto`, `light` or `dark`. The pricing filter, expanded panels and form have no persistent storage; the implementation uses no backend or database.

### License

The project is covered by the [KP_CODE Proprietary Project License](LICENSE.md), version 1.0, and is not open-source software. The license describes limited local use for private, non-commercial evaluation; public deployment, redistribution and commercial use require separate written permission. Third-party materials retain their own license terms.
