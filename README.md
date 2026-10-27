# Eternal Rest

## PL

### Przegląd projektu

Eternal Rest to polskojęzyczny, statyczny projekt demonstracyjny witryny wielostronicowej prezentującej koncepcję usług domu pogrzebowego, pakiety cenowe, informacje o firmie i poradnik dla rodzin. Projekt KP_Code Digital Studio składa się ze stron HTML ze wspólnymi stylami i interakcjami w JavaScript.

Formularz kontaktowy przyjmuje rzeczywiste zapytania kierowane do KP_Code Digital Studio, autora projektu, a nie do fikcyjnego domu pogrzebowego. Jest zarejestrowany w Netlify Forms jako `kontakt-kp-code` (`method="POST"`, `data-netlify="true"` i ukryte pole `form-name` w statycznym HTML, zachowane w `dist/contact.html`). `main.js` sprawdza wypełnienie pól i poprawność formatu adresu e-mail, a następnie wysyła formularz przez `fetch` metodą POST na `/` jako `application/x-www-form-urlencoded`, z limitem czasu 15 s. Podczas wysyłki przycisk ma `aria-disabled="true"`, a kolejne zatwierdzenia są ignorowane. Komunikat sukcesu i reset pól następują tylko po odpowiedzi HTTP 2xx; błąd sieci, przekroczenie czasu lub inny status wyświetla komunikat błędu z `role="alert"` i zachowuje wpisane wartości. Lokalny Vite Preview nie obsługuje Netlify Forms, więc wysyłka działa dopiero we wdrożeniu na Netlify; odbiorców powiadomień konfiguruje się w panelu Netlify, nie w kodzie. Bez JavaScriptu lub gdy moduł się nie wczyta, formularz działa natywnie: przeglądarka sprawdza pola `required` i format pola `type="email"`, a następnie wysyła zwykłe żądanie POST `application/x-www-form-urlencoded` na adres strony z tymi samymi polami, w tym `form-name` i pustym polem honeypot `bot-field`, więc wpisane dane nie trafiają do adresu URL. Natywna walidacja wyświetla komunikaty przeglądarki i w odróżnieniu od `main.js` przyjmuje pola zawierające wyłącznie spacje; ta ścieżka nie ma też komunikatów na stronie, blokady ponownego zatwierdzenia ani limitu czasu, a po wysyłce Netlify może wyświetlić własną stronę potwierdzenia. `main.js` ustawia `novalidate` dopiero po podpięciu obsługi wysyłki i wtedy zastępuje natywną walidację własną. Nad formularzem działającym natywnie widoczny jest komunikat o wysyłce przez przeglądarkę z odnośnikami e-mail i telefonu, który `main.js` ukrywa. Mapa dojazdu jest ilustracją SVG; stopka prowadzi do regulaminu, polityki prywatności i polityki cookies, a odnośniki społecznościowe w stopce `partials/footer-marketing.html` prowadzą do profili autora projektu w serwisach GitHub, Facebook, Instagram oraz X i otwierają się w nowej karcie.

### Wersja online

Publiczna wersja demonstracyjna projektu: [ds-ceremonial-pr01-eternalrest.netlify.app](https://ds-ceremonial-pr01-eternalrest.netlify.app/)

### Kluczowe funkcje

- Motyw jasny, ciemny i systemowy z zapisem preferencji w przeglądarce, stosowanym od pierwszego renderu strony.
- Rozwijane menu mobilne oraz przycisk powrotu na górę strony.
- Filtrowanie pakietów według rodzaju ceremonii i rozwijanie ich szczegółów.
- Akordeony FAQ na stronie głównej i w poradniku.
- Własna strona błędu `404.html` z powrotem na stronę główną i kontaktem do autora projektu.
- Formularz kontaktowy z walidacją niepustych pól i formatu adresu e-mail oraz wysyłką zapytań do KP_Code Digital Studio przez Netlify Forms, działający również bez JavaScriptu dzięki natywnej walidacji i wysyłce przeglądarki.
- Regulamin (17 sekcji), polityka prywatności (14 sekcji) i polityka cookies (9 sekcji) z natywnymi spisami treści i odnośnikami powrotu do spisu, działającymi bez JavaScriptu. Polityka prywatności opisuje rzeczywiste działanie korespondencji e-mail, zapisu motywu i formularza kontaktowego obsługiwanego przez Netlify Forms, a polityka cookies – zapis motywu w `localStorage` jako jedyną technologię przechowywania danych, bez plików cookies ustawianych przez aplikację.

### Stack technologiczny

- HTML, CSS z właściwościami niestandardowymi oraz Vanilla JavaScript ładowany jako moduł ES.
- Vite do developmentu, budowania wielu stron i podglądu wyniku.
- PostCSS z Autoprefixer do przetwarzania CSS.
- ESLint do analizy JavaScript i Prettier do formatowania.
- `@playwright/test` jako zależność developerska do testów smoke w Chromium, Firefox i WebKit lokalnie i w GitHub Actions.
- `@axe-core/playwright` (axe-core) jako zależność developerska do lokalnych automatycznych skanów dostępności w Chromium.
- `@lhci/cli` (Lighthouse CI i Lighthouse) jako zależność developerska do lokalnych pomiarów wydajności w Chromium.
- Sharp i fast-glob w osobnym skrypcie konwersji obrazów.
- Node.js i npm jako środowisko narzędziowe; zależności zapisane w `package-lock.json`.

### Architektura

Źródłem treści są pliki HTML w katalogu głównym. Kanoniczne nazwy plików i trasy używają języka angielskiego, a treść interfejsu pozostaje polska. Nawigacja korzysta ze zwykłych odnośników między stronami, bez routera po stronie klienta.

Wspólne elementy stron mają jedno źródło w katalogu `partials/`: `site-header.html` (odnośnik pomijający i nagłówek), `footer-marketing.html` (stopka sześciu stron usługowych i strony 404), `footer-legal.html` (stopka `terms.html`, `privacy.html` i `cookies.html`), `back-to-top.html` oraz `disclosure-init.html` — skrypt inline w `<head>` każdej strony, który utrzymuje zamknięte menu nagłówka, zwinięte FAQ i szczegóły pakietów oraz ukryty komunikat formularza do uruchomienia `main.js`, a gdy moduł się nie wczyta, przywraca ich wersję bez JavaScriptu. Ten sam skrypt odczytuje też zapisaną preferencję motywu i ustawia `html[data-theme]` jeszcze przed arkuszem stylów, dlatego pierwszy render używa zapisanego motywu, a nie schematu systemowego, który `main.js` zmieniłby dopiero po wczytaniu; `main.js` nadal obsługuje przełącznik motywu, tryb systemowy i jedyny zapis preferencji. Ewentualna polityka CSP musi dopuścić ten skrypt, np. przez hash. Strona wskazuje fragment znacznikiem `<!-- partial:nazwa -->` w miejscu, w którym ma się on pojawić. Lokalna wtyczka w `vite.config.js` (hook `transformIndexHtml`, wykonywany przed własnym przetwarzaniem HTML przez Vite) wstawia fragmenty podczas `npm run dev` i `npm run build`, dlatego `dist/` i `npm run preview` zawierają kompletne strony. Odnośnik oznaczony we fragmencie atrybutem `data-partial-current` otrzymuje `aria-current="page"` na stronie, do której prowadzi; sam atrybut nie trafia do wyniku. Brakujący plik fragmentu lub niepoprawny znacznik kończy przetwarzanie strony błędem, a zmiana fragmentu w trybie deweloperskim przeładowuje otwarte strony. Fragmenty nie są stronami produkcyjnymi, ponieważ wejścia Vite powstają wyłącznie z plików w katalogu głównym.

`css/main.css` importuje kolejno tokeny, style bazowe, układ, komponenty, klasy pomocnicze i style stron. `css/pages/legal.css` jest wspólnym arkuszem rodziny stron prawnych, używanym przez `terms.html`, `privacy.html` i `cookies.html`. `js/main.js` zawiera wspólne zachowania i podłącza interakcje do elementów oznaczonych atrybutami `data-*`. Pliki HTML w katalogu głównym są źródłem stron produkcyjnych: `vite.config.js` automatycznie wyznacza wejścia Vite MPA ze wszystkich plików `*.html` w katalogu głównym, bez przeszukiwania podkatalogów. Dodanie lub zmiana nazwy strony nie wymaga edycji `vite.config.js`.

### Struktura projektu

```text
.
├── index.html                 # Strona główna
├── 404.html                   # Własna strona błędu
├── about.html                 # Informacje o firmie
├── services.html              # Usługi
├── pricing.html               # Pakiety i filtr
├── contact.html               # Kontakt i formularz Netlify Forms
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
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   ├── logos/
│   └── src-images/
├── public/                    # Pliki statyczne kopiowane bez przetwarzania
│   ├── favicons/              # Ikony witryny (wybrane pliki) i manifest
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   └── site.webmanifest
│   ├── images/og.jpg          # Obraz podglądu przy udostępnianiu
│   ├── robots.txt
│   └── sitemap.xml
├── css/
│   ├── main.css
│   ├── fonts.css
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── utilities.css
│   └── pages/
│       ├── 404.css
│       ├── home.css
│       ├── services.css
│       ├── guide.css
│       ├── legal.css
│       ├── contact.css
│       ├── about.css
│       └── pricing.css
├── js/main.js
├── scripts/
│   ├── audit-performance.js
│   ├── check-references.js
│   └── convert-images.js
├── tests/
│   ├── accessibility.spec.js  # Skany dostępności axe-core
│   └── smoke.spec.js          # Testy smoke Playwright
├── .github/
│   └── workflows/
│       └── quality.yml        # Kontrole jakości w GitHub Actions
├── docs/
│   ├── CHANGELOG.md           # Historia zmian
│   └── archive/               # Archiwalne audyty, usprawnienia i plany
│       ├── audits/
│       │   └── AUDIT-2026-10-25.md # Końcowy audyt techniczny
│       └── plans/
│           └── PLAN-2026-10-25.md # Ukończony plan rozwoju
├── eslint.config.js
├── .gitattributes             # Reguły Git dotyczące plików i końców linii
├── .gitignore                 # Pliki pomijane przez Git
├── .prettierignore            # Pliki pomijane przez Prettiera
├── package.json
├── package-lock.json
├── playwright.config.js       # Konfiguracja testów przeglądarkowych
├── playwright.a11y.config.js  # Konfiguracja skanów dostępności
├── lighthouserc.json          # Konfiguracja pomiarów Lighthouse CI
├── postcss.config.cjs
├── vite.config.js
├── AGENTS.md                  # Instrukcje dla agentów pracujących nad projektem
├── CLAUDE.md                  # Instrukcje dla Claude
├── LICENSE.md
├── THIRD-PARTY-NOTICES.md      # Informacje o zasobach i licencjach stron trzecich
└── README.md
```

### Instalacja

Wymagane są Node.js 22.20+ z linii 22.x oraz npm 10 lub nowszy. W katalogu głównym repozytorium zainstaluj zależności zgodnie z plikiem blokady:

```bash
npm ci
```

Przed pierwszym uruchomieniem testów lub pomiarów wydajności zainstaluj przeglądarki dla wersji Playwright z pliku blokady (ponów po aktualizacji Playwright). Do szybkiego `test:smoke`, do `test:a11y` i do `audit:performance` wystarczy Chromium; `test:cross-browser` wymaga Firefox i WebKit:

```bash
npx playwright install chromium
npx playwright install firefox webkit
```

Na Linuksie użyj `npx playwright install --with-deps chromium firefox webkit`, aby zainstalować również wymagane zależności systemowe. Te polecenia są etapem przygotowania środowiska; skrypty testowe i `audit:performance` nie instalują przeglądarek automatycznie.

### Dostępne skrypty

Polecenia są zdefiniowane w [package.json](package.json).

| Polecenie                    | Działanie                                                                                                                                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Uruchamia Vite z `--host`, udostępniając serwer także w sieci lokalnej.                                                                                                                                                          |
| `npm run build`              | Buduje wszystkie strony HTML z katalogu głównego przez `vite build`.                                                                                                                                                             |
| `npm run preview`            | Uruchamia `vite preview`; wymaga wcześniejszego buildu.                                                                                                                                                                          |
| `npm run test:smoke`         | Buduje stronę od nowa jeden raz i uruchamia trzynaście testów Playwright wyłącznie w Chromium na lokalnym Vite Preview.                                                                                                          |
| `npm run test:cross-browser` | Buduje stronę od nowa jeden raz i uruchamia ten sam zestaw testów w Firefox i WebKit na lokalnym Vite Preview.                                                                                                                   |
| `npm run test:a11y`          | Buduje stronę od nowa jeden raz i uruchamia 30 skanów dostępności axe-core wyłącznie w Chromium na lokalnym Vite Preview, niezależnie od testów smoke.                                                                           |
| `npm run audit:performance`  | Buduje stronę od nowa jeden raz i wykonuje 24 lokalne pomiary Lighthouse (cztery strony, profil mobilny i desktopowy, po trzy pomiary) na Vite Preview; raporty i mediany zapisuje w `reports/performance/`.                     |
| `npm run lint`               | Uruchamia ESLint wyłącznie dla `js/**/*.js`.                                                                                                                                                                                     |
| `npm run check:references`   | Sprawdza odwołania do identyfikatorów, duplikaty `id` i zgodność ścieżki modułu aplikacji z inicjalizatorem `partials/disclosure-init.html` w zbudowanych stronach `dist/`; wymaga wcześniejszego buildu i niczego nie zapisuje. |
| `npm run format`             | Uruchamia `prettier --write .` i nadpisuje niesformatowane pliki w zakresie formatowania.                                                                                                                                        |
| `npm run format:check`       | Uruchamia `prettier --check .`; zgłasza różnice w formatowaniu bez zmieniania plików.                                                                                                                                            |
| `npm run images:convert`     | Konwertuje PNG/JPG/JPEG z `assets/src-images/` do WebP i AVIF w generowanym `assets/images/`.                                                                                                                                    |

Strony otwieraj przez serwer Vite, korzystając z adresu podanego w terminalu. Bezpośrednie otwieranie plików z dysku nie zapewnia obsługi skryptu modułowego.

### Build produkcyjny

Vite generuje `dist/` ze wszystkimi stronami HTML z katalogu głównego oraz przetworzonymi zasobami. Importy CSS są scalane, Autoprefixer dodaje prefiksy, a wynikowe CSS i JavaScript podlegają minifikacji. Emitowane zasoby otrzymują nazwy z hashem. Ustawienie `base: "./"` zapewnia względne ścieżki zasobów w wyniku.

Strona `404.html` jest dziesiątym wejściem MPA i korzysta ze wspólnych komponentów oraz tokenowych stylów `css/pages/404.css`. Jej lokalne `<base href="/404.html" />` rozwiązuje względne zasoby Vite, logo, fonty i odnośniki od katalogu głównego także pod adresem `/missing/nested/page/`; odnośnik pomijający `#main` prowadzi wtedy do `/404.html#main`, również bez JavaScriptu. Zakłada hosting w korzeniu domeny. Plik `dist/404.html` jest przeznaczony do standardowej obsługi błędów Netlify bez dodatkowych reguł przekierowań. Po ręcznym wdrożeniu trzeba sprawdzić treść, zasoby i rzeczywisty status HTTP 404 nieznanej trasy; samo otwarcie `/404.html` ani lokalny podgląd tego nie potwierdza.

`dist/` jest wykluczony z Git i nie należy edytować go ręcznie. Podgląd produkcyjny serwuje ten katalog. Repozytorium nie zawiera konfiguracji hostingu ani automatycznego wdrażania.

Konwersja obrazów jest osobnym etapem i nie jest wywoływana przez build. Źródłami zdjęć hero jest sześć plików PNG w `assets/src-images/`. `npm run images:convert` tworzy z nich pliki AVIF i WebP w `assets/images/`, które są zapisane w repozytorium i używane przez sześć stron: `index.html`, `about.html`, `services.html`, `pricing.html`, `guide.html` i `contact.html` (element `<picture>` z AVIF i zapasowym WebP). Ponieważ build nie odtwarza tych plików, po zmianie źródłowego PNG konwersję trzeba uruchomić ponownie. Skrypt zapisuje pliki w płaskim katalogu wynikowym, dlatego nazwy źródłowych zdjęć powinny być unikalne również między podkatalogami. Nowe obrazy trzeba wskazać w HTML lub CSS, aby zostały uwzględnione w przetwarzaniu zasobów przez Vite.

Dodatkowo skrypt generuje warianty szerokości 768 i 1152 px dla `hero` oraz 480 i 960 px dla `hero-services` i `hero-pricing`, w obu formatach, np. `hero-768.avif` i `hero-services-480.webp`. Zachowuje proporcje, pomija szerokości równe lub większe od źródła i pozostawia pełne wersje pod dotychczasowymi nazwami. `npm run images:convert -- --responsive-only` generuje wyłącznie te mniejsze warianty, bez nadpisywania pełnych wersji i pozostałych zdjęć. Trzy strony używają deskryptorów szerokości w `srcset` i wartości `sizes` wynikających z kontenera 1120 px, odstępów i progów CSS; dla strony głównej oraz tabletowego kadru cennika uwzględniają też skalowanie przez `object-fit: cover`. Od 760 px strona główna przyjmuje górną granicę szerokości zdjęcia wynikającą z maksymalnej wysokości kadru, uwzględniając też wysokość wymuszoną przez tekst. Przeglądarka dobiera plik z uwzględnieniem gęstości pikseli ekranu; pełne obrazy nadal są największymi kandydatami, a WebP pozostaje formatem zapasowym.

### Testy i walidacja

`npm run lint` używa ESLint 8.57.x i automatycznie wykrywanej konfiguracji Flat Config w `eslint.config.js`, bez ręcznego ustawiania zmiennych środowiskowych. Zachowuje reguły `eslint:recommended` przez `@eslint/js`, globale przeglądarkowe i ES2021 przez `globals`, `ecmaVersion: "latest"`, `sourceType: "module"` oraz `no-unused-vars` na poziomie ostrzeżenia. Zakres pozostaje ograniczony do `js/**/*.js`, z zachowaniem pomijania ukrytych plików i katalogów; nie obejmuje HTML, CSS ani skryptów w `scripts/`. Repozytorium nie zawiera automatycznych testów jednostkowych.

`npm run test:smoke` najpierw wykonuje build produkcyjny, a następnie uruchamia dokładnie trzynaście niezależnych testów z `tests/smoke.spec.js`: menu mobilne (nazwa przycisku, zamykanie przyciskiem, Escape i kliknięciem poza panelem, fokus i izolacja tła oraz ponowne otwarcie po przejściu z widoku mobilnego do desktopowego i z powrotem przy progu 1152 px), zastosowanie zapisanego motywu przed modułem aplikacji (motyw ciemny w pamięci przy jasnym schemacie systemowym i zablokowanym żądaniu modułu), przełączanie jasnego i ciemnego motywu z wersjonowanym zapisem preferencji, zachowaniem wyboru po przeładowaniu i powrotem do trybu systemowego reagującego na zmianę preferencji systemu, rozwijanie i zwijanie FAQ w poradniku, filtrowanie cen z komunikatem liczby wyników, niezależne rozwijanie i zwijanie szczegółów pakietów (etykiety, `aria-expanded` i widoczność paneli wskazanych przez `aria-controls`), walidację pustego formularza z fokusem na pierwszym błędnym polu, udaną wysyłkę formularza (atrybuty Netlify, jedno żądanie POST z treścią URL-encoded mimo ponownego zatwierdzenia w trakcie wysyłki, komunikat sukcesu z fokusem i reset pól), nieudaną wysyłkę po błędzie sieci i statusie HTTP 500 (komunikat błędu z fokusem i zachowane wartości), własny komunikat błędnego adresu e-mail zamiast walidacji natywnej (`novalidate` po uruchomieniu `main.js`, ukryty komunikat zastępczy, brak żądania) oraz natywną wysyłkę przy wyłączonym JavaScripcie i przy zablokowanym żądaniu modułu (widoczny komunikat zastępczy, zablokowanie pustych pól i błędnego adresu e-mail, jedno żądanie POST na `/contact.html` z polami, `form-name` i pustym `bot-field` w treści, bez danych w adresie URL). Dodatkowy test strony 404 sprawdza strukturę, zasoby, nawigację i odnośnik pomijający także bez JavaScriptu, serwując rzeczywisty wynik `dist/404.html` ze sztucznym statusem 404 pod zagnieżdżonym adresem; nie weryfikuje konfiguracji Netlify. Testy sprawdzają widoczność i powiązane stany ARIA. Testy wysyłki wpisują wyłącznie fikcyjne dane testowe, a żądania przechwytuje `page.route`, więc nie trafiają do Netlify.

`playwright.config.js` definiuje projekty `chromium`, `firefox` i `webkit`, z jednym workerem, bez ponowień i z dotychczasowymi limitami czasu, viewportem oraz ograniczonym ruchem. `npm run test:smoke` wybiera wyłącznie Chromium (13 testów), a `npm run test:cross-browser` wyłącznie Firefox i WebKit (po 13 testów). Po `npm run build` polecenie `npx playwright test` uruchamia wszystkie trzy silniki (39 wykonań), a `npx playwright test --list` wyświetla wybór bez uruchamiania przeglądarek. Playwright uruchamia i zatrzymuje Vite Preview pod `http://127.0.0.1:8182`; zajęty port powoduje błąd, zamiast użycia istniejącego serwera lub innego portu. Nieudany build lub test zwraca kod różny od zera. Testy działają na lokalnym `dist/` zarówno na komputerze dewelopera, jak i w GitHub Actions; nie sprawdzają publicznego Netlify.

Test menu uruchamia wspólne kontrole otwierania i zamykania, widoczności, ARIA, fokusu, pętli Tab, izolacji przez `inert`, odtworzenia wcześniejszych wartości i przejścia mobilny–desktop–mobilny w każdym silniku. Przed otwarciem ustawia fokus na przycisku, aby jednoznacznie sprawdzić jego przywrócenie, i sprawdza odrzucenie prób fokusu na linkach tła. Chromium dodatkowo sprawdza natywne drzewo dostępności przez CDP (`Accessibility.getFullAXTree`); Firefox i WebKit nie korzystają z CDP. Kontrole DOM i fokusu nie są równoważne inspekcji tego drzewa. WebKit w Playwright nie zastępuje pełnych testów Safari na fizycznych urządzeniach Apple.

Lokalna weryfikacja CB-01 (2026-10-26, Windows, po instalacji wszystkich przeglądarek): `npm run test:smoke` — PASS, 13/13 Chromium; `npm run test:cross-browser` — FAIL, 24/26 (Firefox 13/13, WebKit 11/13, kod 1). W WebKit pozostały błędy menu i strony 404 przy przechodzeniu Tabem do linków; pomijanie zwykłych `<a href>` odtworzono również na dokumencie kontrolnym bez aplikacji, także po aktywowaniu strony. Nie zastąpiono tych asercji wymuszaniem fokusu ani zmianą DOM. Wcześniejsze timeouty kliknięcia i przeładowania w Firefox nie powtórzyły się w pełnym przebiegu bez śladów; ich pierwotna przyczyna pozostaje niepotwierdzona. Osobny przebieg diagnostyczny ze śladami zakończył się 6 błędami, obejmującymi również timeouty przygotowania strony przed uruchomieniem aplikacji. Lokalna weryfikacja w Windows pozostaje PARTIAL.

Weryfikacja CB-01 w GitHub Actions (2026-10-26, workflow `Quality Checks`, [przebieg #69](https://github.com/KPKrol85/DS-ceremonial-pr01-EternalRest/actions/runs/40355906120), commit `c04f0ef`, `ubuntu-latest`, job `Build and Quality Checks`) — SUCCESS: `npx playwright test` — PASS, 39/39 (Chromium 13/13, Firefox 13/13, WebKit 13/13, 40,3 s). Kroki lint, buildu produkcyjnego, `check:references` i instalacji przeglądarek również zakończyły się powodzeniem. Wynik z Linuxa nie unieważnia opisanych wyżej błędów WebKit z Windows, które pozostają udokumentowanym ograniczeniem tamtego środowiska. Testy smoke potwierdzają wyłącznie objęte nimi scenariusze w silnikach Playwright; nie dowodzą pełnej zgodności z przeglądarkami i urządzeniami, zgodności z WCAG ani działania Safari na fizycznych urządzeniach Apple.

Workflow `Quality Checks` (`.github/workflows/quality.yml`) uruchamia się po pushu do `main`, dla pull requestów kierowanych do `main` (przy ich otwarciu, ponownym otwarciu i każdym nowym commicie) oraz ręcznie. Push do innych gałęzi nie uruchamia go samodzielnie, a wynik nie jest wymaganym warunkiem scalenia. W istniejącym jobie, z uprawnieniami tylko do odczytu, Node.js 22 i cache npm, wykonuje kolejno `npm ci`, `npm run lint`, `npm run build` i `npm run check:references`, następnie instaluje Chromium, Firefox i WebKit z wymaganymi zależnościami systemowymi przez `npx playwright install --with-deps chromium firefox webkit` i uruchamia wszystkie trzy projekty przez `npx playwright test`. Testy korzystają z już utworzonego buildu, bez ponownego budowania; błąd testu kończy job niepowodzeniem. Wdrożenie produkcyjne do Netlify pozostaje ręczne.

`npm run test:a11y` wykonuje build produkcyjny jeden raz, a następnie uruchamia osobny zestaw automatycznych skanów dostępności z `tests/accessibility.spec.js` przez `playwright.a11y.config.js`. Ta konfiguracja przejmuje z `playwright.config.js` serwer Vite Preview pod `http://127.0.0.1:8182`, jeden worker, brak ponowień, limity czasu, viewport 1280 × 800 i ograniczony ruch, ale wybiera wyłącznie własny plik testów i tylko Chromium. Wymaga zainstalowanego Chromium (`npx playwright install chromium`). Domyślna konfiguracja, `test:smoke`, `test:cross-browser`, 39 wykonań testów smoke i workflow `Quality Checks` nie uruchamiają tych skanów; nie są one warunkiem CI.

Zestaw korzysta z `@axe-core/playwright` (axe-core 4.14.0) i obejmuje 30 testów, każdy z jednym skanem: dziesięć stron (`index.html`, `about.html`, `services.html`, `pricing.html`, `guide.html`, `contact.html`, `terms.html`, `privacy.html`, `cookies.html`, `404.html`) oraz pięć stanów interaktywnych, wszystkie w motywie jasnym i ciemnym. Strony są skanowane w całości. Stany to: otwarte menu mobilne przy szerokości 390 px (zakres `[data-site-header]`; tło i logo mają wtedy `inert`, więc axe sprawdza przycisk i panel menu), cztery odpowiedzi FAQ poradnika rozwinięte przyciskami (`[data-accordion]`), szczegóły trzech pakietów cennika rozwinięte przyciskami (`[data-pricing-card]`), formularz kontaktowy po wysłaniu pustych pól z pięcioma błędami pól wymaganych (`[data-validate-form]`; każde żądanie POST jest przerywane, a test sprawdza, że żadne nie wystąpiło) oraz cała strona 404 pod zagnieżdżonym nieznanym adresem z symulowanym statusem 404 i fokusem klawiatury na odnośniku pomijającym.

Reguły są wybierane jawnie tagami `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` i `wcag22aa`. axe-core 4.14.0 nie ma reguł z tagiem `wcag22a`, a WCAG 2.2 AA reprezentuje w nim reguła `target-size`. Uruchamianych jest 64 z 70 reguł o tych tagach: zgodnie z domyślnym działaniem axe-core pominięte są 4 reguły eksperymentalne (`css-orientation-lock`, `p-as-heading`, `table-fake-caption`, `td-has-header`) i 2 przestarzałe (`aria-roledescription`, `audio-caption`). Reguły best practice i AAA nie należą do tej bazy; zestaw nie wyłącza żadnej reguły i nie filtruje wyników według wpływu. Każdy test działa w nowym kontekście przeglądarki, w którym motyw wybierają jednocześnie emulowany schemat systemowy i zapisana preferencja `eternalRestTheme` (wersja 1, tryb `light` lub `dark`). Przed skanem test czeka, bez stałych opóźnień, aż `main.js` ustawi klasę `js`, `html[data-theme]` i stan przełącznika motywu oraz aż rozwiąże się `document.fonts.ready`; stany interaktywne powstają przez użycie rzeczywistych kontrolek.

Każde naruszenie kończy test niepowodzeniem. Komunikat podaje adres i zakres skanu, a dla każdej reguły jej identyfikator, wpływ, opis, odnośnik do wskazówek naprawy oraz selektor i podsumowanie błędu każdego elementu. Pełne wyniki (`violations` oraz `incomplete`, czyli wyniki wymagające ręcznej oceny) każdego skanu trafiają do `reports/accessibility/<test>/axe-results.json`; katalog jest pomijany przez Git i czyszczony przy każdym uruchomieniu. Taki komunikat oznacza wykryte naruszenie, natomiast przekroczenie czasu, błąd nawigacji lub nieudana asercja przygotowania stanu oznacza błąd przed skanem, bez pliku wyników.

Bazowy przebieg A11Y-01 (2026-10-26, Windows, Chromium z Playwright 1.64.1, axe-core 4.14.0, lokalny `dist/`): `npm run test:a11y` — PASS, 30/30 wykonanych skanów, 0 naruszeń reguł WCAG A/AA (1,9 min). axe oznaczył do ręcznej oceny 100 wyników `color-contrast`, wyłącznie w skanach stron, po 50 na motyw: 40 dla dekoracyjnej strzałki `↑` (`span[aria-hidden="true"]`) w odnośnikach `.legal-section__back` stron prawnych (17 w `terms.html`, 14 w `privacy.html`, 9 w `cookies.html`), której zawartość axe uznaje za znaki nietekstowe; 5 dla `.page-closing__label` na `index.html`, `about.html`, `services.html`, `pricing.html` i `guide.html` oraz 5 dla `.hero__eyebrow`, `h1`, `.hero__lead` i dwóch odnośników `.button` sekcji hero na `index.html`, gdzie axe nie ustalił tła z powodu nakładających się elementów. Kontrast tych elementów nie został oceniony ani jako zgodny, ani jako niezgodny i wymaga ręcznego sprawdzenia. Kontrola negatywna tego samego zestawu na kopii buildu poza repozytorium, z usuniętym atrybutem `lang` i `alt` logo w `index.html`, zakończyła się niepowodzeniem obu skanów tej strony z regułami `html-has-lang` i `image-alt`.

Brak naruszeń w automatycznym skanie nie oznacza zgodności z WCAG. axe-core sprawdza tylko część kryteriów, a wynik dotyczy wyłącznie Chromium, opisanych viewportów i stanów oraz ograniczonego ruchu. Skany nie zastępują ręcznych testów, testów z czytnikami ekranu i innymi technologiami asystującymi ani weryfikacji na rzeczywistych urządzeniach.

`npm run check:references` sprawdza odwołania do identyfikatorów w stronach HTML z katalogu głównego `dist/`, czyli już po wstawieniu fragmentów z `partials/` przez Vite. Dlatego wymaga wcześniejszego `npm run build` i sam go nie uruchamia. Na każdej stronie wykrywa zduplikowane `id` oraz odwołania bez celu w `aria-controls`, `aria-describedby` i `aria-labelledby` (każdy identyfikator z listy rozdzielonej spacjami osobno), w `label[for]`, w odnośnikach `href="#id"` na tej samej stronie i w odnośnikach do fragmentów innych stron projektu, np. `services.html#id`, sprawdzanych na stronie docelowej. Ten sam `id` na różnych stronach nie jest duplikatem. Pomijane są adresy zewnętrzne, `mailto:`, `tel:` i placeholdery `href="#"`. Każdy błąd podaje stronę, wiersz, atrybut oraz brakujący lub zduplikowany identyfikator, a polecenie kończy się wtedy kodem różnym od zera; przy powodzeniu podaje liczbę sprawdzonych stron i odwołań. Brak `dist/` również kończy się błędem z poleceniem wykonania buildu. Skrypt korzysta wyłącznie z wbudowanych modułów Node.js, niczego nie zapisuje i nie jest częścią `npm run build`. Sprawdza tylko istnienie celów odwołań, a nie semantykę ARIA ani działanie interakcji w przeglądarce.

To samo polecenie pilnuje kontraktu ścieżki modułu z `partials/disclosure-init.html`: inicjalizator usuwa `js-pending` tylko po błędzie ładowania lub parsowania skryptu, którego ścieżka pasuje do jego wyrażenia `appModule`. Skrypt odczytuje to wyrażenie bezpośrednio z pliku partiala jako literał (bez wykonywania kodu), więc nie utrzymuje jego drugiej kopii; gdy nie da się go znaleźć lub skompilować, kończy się błędem. Strony z inicjalizatorem rozpoznaje w zbudowanym HTML, a pozostałe wymienia jako pominięte. Na każdej takiej stronie wymaga dokładnie jednego `<script type="module" src>`, rozwiązuje jego `src` względem strony do ścieżki URL i porównuje ją z wyrażeniem. Przy powodzeniu wypisuje stronę i dopasowaną ścieżkę; błąd podaje stronę, wiersz, `src`, rozwiązaną ścieżkę i wyrażenie, a polecenie kończy się kodem różnym od zera. Wykrywa to np. zmianę nazewnictwa plików przez Vite, która po nieudanym załadowaniu modułu pozostawiłaby menu nagłówka zamknięte, a odpowiedzi FAQ i szczegóły pakietów ukryte. Sprawdzenie nie symuluje awarii modułu w przeglądarce.

`npm run format:check` porównuje pliki z wynikiem Prettiera 3 w ustawieniach domyślnych (repozytorium nie zawiera konfiguracji Prettiera) i niczego nie zapisuje; kończy się błędem, gdy którykolwiek plik w zakresie wymaga formatowania. Jego zapisującym odpowiednikiem jest `npm run format`. Sprawdzenie dotyczy wyłącznie zapisu kodu i nie zastępuje lintowania ESLint ani testów działania strony w przeglądarce. Wszystkie pliki w zakresie przeszły formatowanie bazowe, więc w czystej kopii roboczej sprawdzenie kończy się powodzeniem. Prettier domyślnie oczekuje końców linii LF; `.gitattributes` (`* text=auto eol=lf`) zapewnia LF w każdej kopii roboczej, także w Windows z `core.autocrlf=true`, a plik zapisany z końcami CRLF, np. przez edytor, zostanie zgłoszony.

Oba polecenia pomijają pliki wskazane w `.gitignore` i `.prettierignore`. `.prettierignore` wyłącza generowany `dist/`, `node_modules/`, `package-lock.json`, `LICENSE.md`, strony prawne `terms.html`, `privacy.html` i `cookies.html` oraz archiwum raportów `docs/archive/`, aby formatowanie nie zmieniało tych plików. Wykluczone pliki nie są też sprawdzane; wspólny nagłówek i stopki, także te używane przez strony prawne, znajdują się jednak w `partials/` i podlegają sprawdzeniu. `.prettierignore` działa wyłącznie dla Prettiera i nie chroni plików przed innymi narzędziami ani ręczną edycją.

### Pomiary wydajności

`npm run audit:performance` wykonuje build produkcyjny jeden raz, a następnie uruchamia `scripts/audit-performance.js`. Skrypt startuje Vite Preview pod `http://127.0.0.1:8183` z `--strictPort` (port inny niż 8182 używany przez Playwright; zajęty port kończy pomiar błędem zamiast użycia istniejącego serwera), czeka do 30 s na odpowiedź strony głównej i uruchamia Lighthouse CI (`@lhci/cli` 0.15.1 z Lighthouse 12.6.1) z konfiguracją `lighthouserc.json`. Mierzone są cztery strony: `index.html`, `pricing.html`, `guide.html` i `contact.html`, każda trzykrotnie w dwóch osobnych fazach: najpierw w domyślnym profilu mobilnym Lighthouse, potem w profilu desktopowym (`preset: desktop`). Razem to 24 pomiary, wyłącznie kategorii Performance. Po zakończeniu, błędzie lub przerwaniu (Ctrl+C) skrypt zatrzymuje Lighthouse i serwer. Polecenie nie należy do workflow `Quality Checks` ani do innych skryptów i nie wysyła wyników do zewnętrznych usług: `lhci upload --target=filesystem` zapisuje raporty wyłącznie na dysku. Skrypt uruchamia Lighthouse CI bez zmiennych środowiskowych `LHCI_*`, które mogłyby nadpisać `lighthouserc.json` i flagi skryptu, w tym cel zapisu raportów; pominięte zmienne wymienia w wyniku polecenia.

Skrypt przekazuje Lighthouse ścieżkę Chromium zainstalowanego dla Playwright (`npx playwright install chromium`, ta sama instalacja co dla testów). Inną przeglądarkę Chrome lub Chromium można wskazać zmienną środowiskową `CHROME_PATH`. Brak przeglądarki, brak zbudowanej strony w `dist/` lub adres spoza lokalnego serwera w konfiguracji kończą polecenie błędem przed pomiarem, bez zmiany wcześniejszych raportów. Globalna instalacja Lighthouse nie jest potrzebna.

Wyniki trafiają do pomijanego przez Git katalogu `reports/performance/`, czyszczonego po sprawdzeniu tych wymagań, przed uruchomieniem serwera. Katalogi `mobile/` i `desktop/` zawierają raport HTML i JSON każdego pomiaru, nazwany ścieżką strony i czasem rozpoczęcia w UTC (np. `index_html-2026_10_27_15_15_23.report.html`), oraz `manifest.json` Lighthouse CI. `summary.json` zawiera dla każdej pary strony i profilu liczbę poprawnych pomiarów, mediany wyniku Performance (0–100), LCP, TBT i FCP (ms) oraz CLS (bez jednostki), wartości poszczególnych pomiarów ze ścieżkami raportów i wynikiem testu procesora Lighthouse (`benchmarkIndex`), ostrzeżenia Lighthouse, wersje Lighthouse i przeglądarki, rzeczywiste ustawienia emulacji obu profili, status `complete` lub `incomplete` i listę błędów. Medianę każdej metryki skrypt liczy osobno z rzeczywistych pomiarów, więc mediany jednej strony mogą pochodzić z różnych przebiegów. Pomijany przez Git katalog `.lighthouseci/` przechowuje roboczą kopię wyników ostatniej fazy Lighthouse CI.

Pomiar jest odrzucany, gdy Lighthouse zgłosi błąd wykonania (`runtimeError`), raport ma inny profil urządzenia, inny adres, brakującą metrykę lub czas sprzed bieżącej fazy albo gdy brakuje raportu HTML. Nieudane uruchomienie Lighthouse jest ponawiane przez Lighthouse CI do trzech prób. Polecenie kończy się kodem różnym od zera, gdy zawiedzie build, start serwera, przeglądarka lub zbieranie wyników albo gdy którakolwiek z ośmiu par strony i profilu nie ma dokładnie trzech poprawnych pomiarów; raporty ukończonych pomiarów i `summary.json` ze statusem `incomplete` pozostają wtedy do diagnostyki. Po przerwaniu zachowane są raporty faz zakończonych wcześniej, bez wyników przerwanej fazy. Niski wynik Performance nie jest błędem wykonania: polecenie nie ma progów ani asercji wyników.

Wyniki są pomiarami laboratoryjnymi. Lighthouse ładuje strony z lokalnego Vite Preview w nowym profilu przeglądarki i symuluje ograniczenia sieci i procesora (`throttlingMethod: simulate`): profil mobilny emuluje ekran 412 × 823 px przy DPR 1,75, RTT 150 ms, przepustowość 1,6 Mb/s i czterokrotnie wolniejszy procesor, a desktopowy ekran 1350 × 940 px przy DPR 1, RTT 40 ms, 10 Mb/s i procesor bez spowolnienia. Wyniki nie opisują wydajności hostingu Netlify (CDN, kompresja, nagłówki cache, wersja HTTP, odległość sieciowa) ani doświadczeń rzeczywistych użytkowników. Core Web Vitals użytkowników pochodzą z danych terenowych (np. CrUX lub RUM), których projekt nie zbiera. Standardowy audyt ładowania strony nie mierzy INP, ponieważ ta metryka wymaga rzeczywistych interakcji; TBT jest odrębną metryką laboratoryjną i nie jest szacunkiem INP. Wyniki zależą od wydajności i obciążenia komputera, dlatego porównywać należy przebiegi wykonane w zbliżonych warunkach; mediana z trzech pomiarów ogranicza, ale nie usuwa zmienności.

Bazowy przebieg PERF-01 (2026-10-27, Windows 11, Chromium 156.0.8078.4 z Playwright 1.64.1 w trybie headless, Lighthouse 12.6.1, lokalny `dist/`): `npm run audit:performance` — kompletny, 24/24 pomiary, kod 0 (ok. 14 min z buildem). Mediany:

| Strona         | Profil     | Performance | LCP (ms) | CLS   | TBT (ms) | FCP (ms) |
| -------------- | ---------- | ----------- | -------- | ----- | -------- | -------- |
| `index.html`   | mobilny    | 91          | 2877     | 0     | 0        | 2427     |
| `pricing.html` | mobilny    | 97          | 2202     | 0,001 | 0        | 1977     |
| `guide.html`   | mobilny    | 97          | 2202     | 0     | 0        | 1977     |
| `contact.html` | mobilny    | 97          | 2196     | 0,001 | 0        | 1964     |
| `index.html`   | desktopowy | 98          | 609      | 0,001 | 0        | 550      |
| `pricing.html` | desktopowy | 100         | 486      | 0     | 0        | 466      |
| `guide.html`   | desktopowy | 99          | 486      | 0     | 0        | 466      |
| `contact.html` | desktopowy | 97          | 714      | 0     | 16       | 660      |

We wszystkich 12 pomiarach mobilnych Lighthouse ostrzegł, że procesor wydaje się wolniejszy, niż zakłada profil; `benchmarkIndex` wynosił 418–622 w pomiarach mobilnych i 351–789 we wszystkich 24 pomiarach, a komputer był w trakcie pomiaru obciążony innymi aplikacjami. Pojedyncze pomiary mobilne odbiegały od pozostałych (`index.html`: 65, 91 i 91; `pricing.html`: 97, 97 i 83), dlatego wyniki tego przebiegu są punktem odniesienia dla tego komputera i warunków, a nie wartościami bezwzględnymi.

### Dostępność

- Semantyczne obszary `header`, `nav`, `main`, `footer`, odnośnik pomijający nawigację i style `:focus-visible`.
- Menu mobilne z aktualizacją `aria-expanded` i `aria-hidden`, przenoszeniem i przywracaniem fokusu, pętlą klawisza Tab, zamykaniem przez Escape oraz blokadą przewijania. Zamknięte menu i niewidoczny przycisk powrotu na górę nie przyjmują fokusu.
- Bieżąca strona oznaczona `aria-current="page"` w nawigacji głównej, a na stronach prawnych także w odnośnikach do dokumentów prawnych w stopce.
- Akordeony i szczegóły pakietów synchronizujące `aria-expanded` z widocznością paneli.
- Pola formularza z etykietami i powiązanymi komunikatami przez `aria-describedby`; błędy oznaczane przez `aria-invalid`; po wysyłce komunikat sukcesu z `role="status"` lub błędu z `role="alert"` z przeniesieniem fokusu, a podczas wysyłki `aria-busy` na formularzu i `aria-disabled` na przycisku, który pozostaje fokusowalny.
- Obsługa `prefers-reduced-motion` wyłączająca czasy przejść CSS i płynne przewijanie.

Są to mechanizmy obecne w kodzie, bez deklaracji zgodności z WCAG.

### SEO

Wszystkie dziesięć stron zawiera polski atrybut języka dokumentu, własny tytuł i opis meta oraz spójne deklaracje favicon (ICO, PNG 96 × 96, SVG i Apple Touch Icon 180 × 180) i manifestu z `public/favicons/`. Na dziewięciu stronach treściowych metadane Open Graph (`pl_PL`, typ `website`) i karty Twitter/X `summary_large_image` wykorzystują tytuł i opis danej strony oraz wspólny obraz `public/images/og.jpg` (JPEG 1200 × 630) z polskim opisem alternatywnym. Adresy stron w Open Graph i adres obrazu są bezwzględnymi adresami produkcyjnymi w domenie `https://ds-ceremonial-pr01-eternalrest.netlify.app/`.

Każda z dziesięciu stron zawiera w `<head>` jedną dyrektywę `<meta name="robots" content="noindex, follow" />`, aby wyłączyć indeksowanie demonstracyjnej witryny fikcyjnej firmy, zachowując możliwość podążania za odnośnikami. Plik `public/robots.txt` pozostawia `User-agent: *` i `Allow: /`, aby roboty mogły pobrać strony i odczytać `noindex`. Witryna pozostaje publicznie dostępna, a podglądy Open Graph i Twitter/X nadal działają. Niezmieniony `public/sitemap.xml` pozostaje dostępny jako techniczna demonstracja struktury adresów, ale nie jest już reklamowany deklaracją `Sitemap:` w `robots.txt`; mapa obejmuje dziewięć stron treściowych, w tym dokumenty prawne, bez strony `404.html`, a stronę główną reprezentuje adresem `/`, bez wymyślonych dat i parametrów aktualizacji. Zastosowanie dyrektywy przez wyszukiwarki wymaga ponownego pobrania stron i nie gwarantuje natychmiastowego usunięcia ich z indeksów.

Vite kopiuje zawartość `public/` do katalogu głównego `dist/`, zachowując podkatalogi; ścieżki ikon w manifeście są względne wobec `favicons/site.webmanifest`. Nie dodano znaczników `link rel="canonical"` ani danych strukturalnych. Wdrożenie na Netlify pozostaje ręczne.

### Dane i trwałość stanu

Treści i ceny są zapisane w HTML. Preferencja motywu trafia do `localStorage` pod kluczem `eternalRestTheme` jako obiekt z wersją `1` i trybem `auto`, `light` lub `dark`. Zapis powstaje dopiero po użyciu przełącznika motywu lub przycisku „Tryb systemowy” i nie ma terminu wygaśnięcia. Inicjalizator w `<head>` tylko odczytuje ten wpis przed pierwszym renderem i nigdy do niego nie zapisuje; brak wpisu, wpis nieczytelny lub w innej wersji oznacza schemat systemowy. Filtr cen, rozwinięte panele i formularz nie mają trwałego zapisu w przeglądarce; implementacja nie ma własnego backendu ani bazy danych, a wysłane zgłoszenia formularza przechowuje usługa Netlify Forms. Aplikacja nie ustawia plików cookies i nie korzysta z `sessionStorage`, IndexedDB, Cache Storage, Service Workera ani narzędzi analitycznych lub marketingowych, dlatego nie zawiera banera cookies ani mechanizmu zarządzania zgodą.

### Licencja

Projekt podlega [Własnościowej Licencji Projektu KP_CODE](LICENSE.md), wersja 1.0, i nie jest oprogramowaniem open source. Licencja opisuje ograniczony użytek lokalny do prywatnej, niekomercyjnej oceny; publiczne wdrożenie, redystrybucja i wykorzystanie komercyjne wymagają odrębnej pisemnej zgody. Materiały podmiotów trzecich zachowują własne warunki licencyjne; ich wykaz zawiera plik [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## EN

### Project Overview

Eternal Rest is a Polish-language static multi-page demonstration project presenting a funeral-home service concept, pricing packages, company information and guidance for families. This KP_Code Digital Studio project consists of HTML pages with shared styles and JavaScript interactions.

The contact form accepts real enquiries addressed to KP_Code Digital Studio, the project author, not to the fictional funeral home. It is registered with Netlify Forms as `kontakt-kp-code` (`method="POST"`, `data-netlify="true"` and a hidden `form-name` field in static HTML, preserved in `dist/contact.html`). `main.js` checks for non-empty fields and a valid e-mail address format, then submits the form with `fetch` as a POST to `/` encoded as `application/x-www-form-urlencoded`, with a 15-second timeout. While the request is pending, the button has `aria-disabled="true"` and further submissions are ignored. The success message and field reset happen only after an HTTP 2xx response; a network error, timeout or any other status shows an error message with `role="alert"` and keeps the entered values. Local Vite Preview does not process Netlify Forms, so submissions work only on a Netlify deployment; notification recipients are configured in the Netlify UI, not in code. Without JavaScript, or if the module fails to load, the form works natively: the browser checks the `required` fields and the `type="email"` format, then sends a regular `application/x-www-form-urlencoded` POST to the page URL with the same fields, including `form-name` and the empty `bot-field` honeypot, so entered data does not reach the URL. Native validation shows browser messages and, unlike `main.js`, accepts whitespace-only fields; this path also has no on-page messages, duplicate-submit protection or timeout, and Netlify may show its own confirmation page after submission. `main.js` sets `novalidate` only after attaching its submit handler and then replaces native validation with its own. While the form works natively, a notice above it explains browser submission and offers e-mail and phone links; `main.js` hides it. The location map is an SVG illustration; the footer links to the Terms, Privacy Policy and Cookies Policy pages, and the social links in the `partials/footer-marketing.html` footer point to the project author's GitHub, Facebook, Instagram and X profiles and open in a new tab.

### Live Version

Public project demo: [ds-ceremonial-pr01-eternalrest.netlify.app](https://ds-ceremonial-pr01-eternalrest.netlify.app/)

### Key Features

- Light, dark and system themes with preferences stored in the browser and applied from the first paint.
- Expandable mobile navigation and a back-to-top button.
- Package filtering by ceremony type and expandable package details.
- FAQ accordions on the home and guide pages.
- A custom `404.html` error page with links to the homepage and project author contact.
- Contact form with validation of non-empty fields and the e-mail address format, submitting enquiries to KP_Code Digital Studio through Netlify Forms, also without JavaScript through native browser validation and submission.
- Terms (17 sections), Privacy Policy (14 sections) and Cookies Policy (9 sections) with native section indexes and return links that work without JavaScript. The Privacy Policy describes the actual behavior of e-mail correspondence, theme storage and the Netlify Forms contact form, while the Cookies Policy documents theme storage in `localStorage` as the only storage technology, with no application-set cookies.

### Tech Stack

- HTML, CSS custom properties and Vanilla JavaScript loaded as an ES module.
- Vite for development, multi-page builds and build previews.
- PostCSS with Autoprefixer for CSS processing.
- ESLint for JavaScript analysis and Prettier for formatting.
- `@playwright/test` as a development dependency for Chromium, Firefox and WebKit smoke tests locally and in GitHub Actions.
- `@axe-core/playwright` (axe-core) as a development dependency for local automated accessibility scans in Chromium.
- `@lhci/cli` (Lighthouse CI and Lighthouse) as a development dependency for local performance audits in Chromium.
- Sharp and fast-glob in a separate image conversion script.
- Node.js and npm for tooling; dependencies recorded in `package-lock.json`.

### Architecture

Root HTML files own the content. Canonical filenames and routes use English technical names, while interface content remains Polish. Navigation uses ordinary links between pages, without a client-side router.

Shared page chrome has a single source in `partials/`: `site-header.html` (skip link and header), `footer-marketing.html` (footer of the six service pages and the 404 page), `footer-legal.html` (footer of `terms.html`, `privacy.html` and `cookies.html`), `back-to-top.html` and `disclosure-init.html`, an inline `<head>` script on every page that keeps the header menu closed, the FAQ and package details collapsed and the contact-form notice hidden until `main.js` runs and restores their no-JavaScript version if the module fails to load. The same script also reads the stored theme preference and sets `html[data-theme]` before the stylesheet, so the first paint uses the stored theme instead of the system scheme that `main.js` would only replace once loaded; `main.js` still owns the theme toggle, the system mode and the one preference write. A Content Security Policy must allow this script, for example by hash. A page places a partial with a `<!-- partial:name -->` marker where it should appear. A local plugin in `vite.config.js` (a `transformIndexHtml` hook that runs before Vite's own HTML processing) inserts the partials during `npm run dev` and `npm run build`, so `dist/` and `npm run preview` contain complete pages. A link marked with `data-partial-current` in a partial receives `aria-current="page"` on the page it points to; the attribute itself is not emitted. A missing partial file or an invalid marker stops processing of the page with an error, and editing a partial in development reloads open pages. Partials are not production pages, because Vite entries are derived only from root-level files.

`css/main.css` imports tokens, base styles, layout, components, utilities and page styles in that order. `css/pages/legal.css` is the shared stylesheet for legal pages, used by `terms.html`, `privacy.html` and `cookies.html`. `js/main.js` contains shared behavior and attaches interactions to elements marked with `data-*` attributes. Root-level HTML files are the source of the production pages: `vite.config.js` derives the Vite MPA entry points automatically from all root-level `*.html` files, without scanning subdirectories. Adding or renaming a page does not require editing `vite.config.js`.

### Project Structure

```text
.
├── index.html                 # Home page
├── 404.html                   # Custom error page
├── about.html                 # Company information
├── services.html              # Services
├── pricing.html               # Packages and filter
├── contact.html               # Contact and Netlify Forms form
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
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   ├── logos/
│   └── src-images/
├── public/                    # Static files copied without processing
│   ├── favicons/              # Site icons (selected files) and manifest
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   └── site.webmanifest
│   ├── images/og.jpg          # Social sharing preview image
│   ├── robots.txt
│   └── sitemap.xml
├── css/
│   ├── main.css
│   ├── fonts.css
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── utilities.css
│   └── pages/
│       ├── 404.css
│       ├── home.css
│       ├── services.css
│       ├── guide.css
│       ├── legal.css
│       ├── contact.css
│       ├── about.css
│       └── pricing.css
├── js/main.js
├── scripts/
│   ├── audit-performance.js
│   ├── check-references.js
│   └── convert-images.js
├── tests/
│   ├── accessibility.spec.js  # axe-core accessibility scans
│   └── smoke.spec.js          # Playwright smoke tests
├── .github/
│   └── workflows/
│       └── quality.yml        # Quality checks in GitHub Actions
├── docs/
│   ├── CHANGELOG.md           # Change history
│   └── archive/               # Archived audits, improvements and plans
│       ├── audits/
│       │   └── AUDIT-2026-10-25.md # Final technical audit
│       └── plans/
│           └── PLAN-2026-10-25.md # Completed development plan
├── eslint.config.js
├── .gitattributes             # Git file and line-ending rules
├── .gitignore                 # Files ignored by Git
├── .prettierignore            # Files ignored by Prettier
├── package.json
├── package-lock.json
├── playwright.config.js       # Browser test configuration
├── playwright.a11y.config.js  # Accessibility scan configuration
├── lighthouserc.json          # Lighthouse CI audit configuration
├── postcss.config.cjs
├── vite.config.js
├── AGENTS.md                  # Instructions for agents working on the project
├── CLAUDE.md                  # Instructions for Claude
├── LICENSE.md
├── THIRD-PARTY-NOTICES.md      # Third-party asset and license notices
└── README.md
```

### Installation

Node.js 22.20+ within the 22.x line and npm 10 or newer are required. Install dependencies from the lockfile in the repository root:

```bash
npm ci
```

Before the first test or performance audit run, install browsers for the locked Playwright version (repeat after updating Playwright). Chromium is sufficient for the fast `test:smoke` command, for `test:a11y` and for `audit:performance`; `test:cross-browser` requires Firefox and WebKit:

```bash
npx playwright install chromium
npx playwright install firefox webkit
```

On Linux, use `npx playwright install --with-deps chromium firefox webkit` to install the required system dependencies as well. These are environment setup commands; test scripts and `audit:performance` do not install browsers automatically.

### Available Scripts

Commands are defined in [package.json](package.json).

| Command                      | Behavior                                                                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Starts Vite with `--host`, also exposing the server to the local network.                                                                                                                          |
| `npm run build`              | Builds all root-level HTML pages through `vite build`.                                                                                                                                             |
| `npm run preview`            | Starts `vite preview`; requires a prior build.                                                                                                                                                     |
| `npm run test:smoke`         | Builds once and runs thirteen Playwright tests only in Chromium against local Vite Preview.                                                                                                        |
| `npm run test:cross-browser` | Builds once and runs the same test suite in Firefox and WebKit against local Vite Preview.                                                                                                         |
| `npm run test:a11y`          | Builds once and runs 30 axe-core accessibility scans only in Chromium against local Vite Preview, separately from the smoke tests.                                                                 |
| `npm run audit:performance`  | Builds once and runs 24 local Lighthouse measurements (four pages, mobile and desktop profiles, three runs each) against Vite Preview; writes reports and medians to `reports/performance/`.       |
| `npm run lint`               | Runs ESLint only on `js/**/*.js`.                                                                                                                                                                  |
| `npm run check:references`   | Checks ID references, duplicate IDs and the application module path against the `partials/disclosure-init.html` initializer in the built `dist/` pages; requires a prior build and writes nothing. |
| `npm run format`             | Runs `prettier --write .` and overwrites unformatted files within the formatting scope.                                                                                                            |
| `npm run format:check`       | Runs `prettier --check .`; reports formatting differences without changing files.                                                                                                                  |
| `npm run images:convert`     | Converts PNG/JPG/JPEG from `assets/src-images/` into WebP and AVIF in the generated `assets/images/` directory.                                                                                    |

Open pages through the Vite server using the address printed in the terminal. Opening files directly from disk does not provide the required module-script support.

### Production Build

Vite generates `dist/` containing all root-level HTML pages and processed assets. CSS imports are combined, Autoprefixer adds prefixes, and the resulting CSS and JavaScript are minified. Emitted assets receive hashed filenames. The `base: "./"` setting produces relative asset paths in the output.

`404.html` is the tenth MPA entry and reuses shared components with token-based styles in `css/pages/404.css`. Its page-local `<base href="/404.html" />` resolves relative Vite assets, the logo, fonts and links from the site root even at `/missing/nested/page/`; the `#main` skip link then leads to `/404.html#main`, including without JavaScript. This assumes hosting at the domain root. `dist/404.html` is intended for Netlify’s standard error handling without additional redirect rules. After manual deployment, verify the content, assets and actual HTTP 404 status of an unknown route; direct access to `/404.html` or local preview does not establish this.

`dist/` is excluded from Git and should not be edited manually. Production preview serves this directory. The repository contains no hosting or automated deployment configuration.

Image conversion is a separate step and is not invoked by the build. The hero photographs come from six PNG sources in `assets/src-images/`. `npm run images:convert` turns them into AVIF and WebP files in `assets/images/`, which are committed to the repository and used by six pages: `index.html`, `about.html`, `services.html`, `pricing.html`, `guide.html` and `contact.html` (a `<picture>` element with AVIF and a WebP fallback). Because the build does not regenerate these files, the conversion must be run again after a source PNG changes. The script writes to a flat output directory, so source image basenames should be unique across subdirectories. New images must be referenced in HTML or CSS to enter Vite's asset processing workflow.

The script also generates 768 and 1152 px variants for `hero`, and 480 and 960 px variants for `hero-services` and `hero-pricing`, in both formats, e.g. `hero-768.avif` and `hero-services-480.webp`. It preserves aspect ratios, skips widths equal to or larger than the source, and keeps full-size versions under their existing names. `npm run images:convert -- --responsive-only` generates only these smaller variants without overwriting full-size versions or other photographs. The three pages use width descriptors in `srcset` and `sizes` values derived from the 1120 px container, CSS gaps and breakpoints; the home page and the tablet pricing crop also account for scaling by `object-fit: cover`. From 760 px, the home page uses an upper bound on image width derived from the maximum frame height, also accommodating height imposed by the text. The browser selects a file with the display's pixel density in mind; full-size images remain the largest candidates and WebP remains the fallback format.

### Testing and Validation

`npm run lint` uses ESLint 8.57.x and automatically discovers Flat Config in `eslint.config.js`, without manually setting environment variables. It preserves the `eslint:recommended` rules through `@eslint/js`, browser and ES2021 globals through `globals`, `ecmaVersion: "latest"`, `sourceType: "module"` and `no-unused-vars` at warning severity. The scope remains limited to `js/**/*.js`, preserving the exclusion of hidden files and directories; it does not cover HTML, CSS or the scripts in `scripts/`. The repository contains no automated unit tests.

`npm run test:smoke` first creates a production build, then runs exactly thirteen independent tests from `tests/smoke.spec.js`: mobile navigation (the button name, closing via the button, Escape and outside click, focus and background isolation, and reopening after a mobile-to-desktop-to-mobile resize at the 1152 px breakpoint), the stored theme applied before the application module (a stored dark theme under a light system scheme with the module request blocked), switching light and dark themes with versioned preference storage, persistence after reload and restoration of automatic mode that follows system preference changes, expanding and collapsing a guide FAQ answer, pricing filtering with result-count announcements, independently expanding and collapsing package details (labels, `aria-expanded` and visibility of panels referenced by `aria-controls`), empty-form validation with focus on the first invalid field, a successful form submission (Netlify attributes, a single URL-encoded POST despite a repeated submit while pending, a focused success message and field reset), failed submissions after a network error and an HTTP 500 status (a focused error message and preserved values), the custom invalid e-mail message instead of native validation (`novalidate` once `main.js` runs, a hidden fallback notice, no request) and native submission with JavaScript disabled and with the module request blocked (a visible fallback notice, blocked empty fields and invalid e-mail address, a single POST to `/contact.html` carrying the fields, `form-name` and an empty `bot-field` in its body, no data in the URL). The additional 404 test checks structure, assets, navigation and the skip link, including without JavaScript, serving the actual built `dist/404.html` with a simulated 404 status at a nested URL; it does not verify Netlify configuration. Tests assert visibility and related ARIA states. Submission tests enter only fictional test data, and `page.route` intercepts the requests so they never reach Netlify.

`playwright.config.js` defines `chromium`, `firefox` and `webkit` projects, with one worker, no retries and the existing timeouts, viewport and reduced-motion setting. `npm run test:smoke` selects Chromium only (13 tests), while `npm run test:cross-browser` selects Firefox and WebKit only (13 tests each). After `npm run build`, `npx playwright test` runs all three engines (39 executions), and `npx playwright test --list` lists the selection without launching browsers. Playwright starts and stops Vite Preview at `http://127.0.0.1:8182`; an occupied port fails instead of reusing an existing server or switching ports. A failed build or test returns a non-zero exit code. Browser tests run against local `dist/` both on a developer's machine and in GitHub Actions; they do not test public Netlify.

The menu test runs shared checks for opening and closing, visibility, ARIA, focus, Tab looping, `inert` isolation, restoration of previous values and mobile–desktop–mobile transitions in every engine. It focuses the button before opening to establish the focus-restoration origin and checks that background links reject focus. Chromium additionally inspects the native accessibility tree through CDP (`Accessibility.getFullAXTree`); Firefox and WebKit do not use CDP. DOM and focus checks are not equivalent to that tree inspection. Playwright WebKit does not replace full Safari testing on physical Apple devices.

Local CB-01 verification (2026-10-26, Windows, after installing all browsers): `npm run test:smoke` — PASS, 13/13 Chromium; `npm run test:cross-browser` — FAIL, 24/26 (Firefox 13/13, WebKit 11/13, exit code 1). WebKit still fails the menu and 404 assertions for reaching links with Tab; skipping ordinary `<a href>` links was also reproduced in a control document without the application, including after bringing the page to the front. These assertions were not replaced with forced focus or DOM changes. The earlier Firefox click and reload timeouts did not recur in the full run without tracing; their original cause remains unconfirmed. A separate diagnostic run with tracing had 6 failures, also including page-setup timeouts before the application ran. Local Windows verification remains PARTIAL.

CB-01 verification in GitHub Actions (2026-10-26, `Quality Checks` workflow, [run #69](https://github.com/KPKrol85/DS-ceremonial-pr01-EternalRest/actions/runs/40355906120), commit `c04f0ef`, `ubuntu-latest`, `Build and Quality Checks` job) — SUCCESS: `npx playwright test` — PASS, 39/39 (Chromium 13/13, Firefox 13/13, WebKit 13/13, 40.3 s). The lint, production build, `check:references` and browser installation steps also succeeded. The Linux result does not invalidate the Windows WebKit failures described above, which remain a documented limitation of that environment. The smoke tests confirm only the scenarios they cover in Playwright browser engines; they do not prove full browser and device compatibility, WCAG conformance or Safari behavior on physical Apple devices.

The `Quality Checks` workflow (`.github/workflows/quality.yml`) runs on pushes to `main`, on pull requests targeting `main` (when opened, reopened and on each new commit) and on manual dispatch. Pushes to other branches do not trigger it on their own, and its result is not a required merge condition. Its existing job, with read-only permissions, Node.js 22 and npm caching, runs `npm ci`, `npm run lint`, `npm run build` and `npm run check:references` in order, then installs Chromium, Firefox and WebKit with their required system dependencies using `npx playwright install --with-deps chromium firefox webkit` and runs all three projects with `npx playwright test`. Tests reuse the existing production build without rebuilding; a failed test fails the job. Production deployment to Netlify remains manual.

`npm run test:a11y` creates a production build once, then runs a separate suite of automated accessibility scans from `tests/accessibility.spec.js` through `playwright.a11y.config.js`. That configuration inherits the Vite Preview server at `http://127.0.0.1:8182`, one worker, no retries, the timeouts, the 1280 × 800 viewport and reduced motion from `playwright.config.js`, but selects only its own test file and only Chromium. It requires an installed Chromium (`npx playwright install chromium`). The default configuration, `test:smoke`, `test:cross-browser`, the 39 smoke-test executions and the `Quality Checks` workflow do not run these scans; they are not a CI requirement.

The suite uses `@axe-core/playwright` (axe-core 4.14.0) and contains 30 tests with one scan each: ten pages (`index.html`, `about.html`, `services.html`, `pricing.html`, `guide.html`, `contact.html`, `terms.html`, `privacy.html`, `cookies.html`, `404.html`) and five interactive states, all in the light and the dark theme. Pages are scanned in full. The states are: the open mobile menu at a width of 390 px (scope `[data-site-header]`; the background and the logo are then `inert`, so axe checks the menu button and panel), the four guide FAQ answers expanded with their buttons (`[data-accordion]`), the details of the three pricing packages expanded with their buttons (`[data-pricing-card]`), the contact form after an empty submission with five required-field errors (`[data-validate-form]`; every POST request is aborted, and the test asserts that none occurred), and the whole 404 page at a nested unknown URL with a simulated 404 status and keyboard focus on the skip link.

The rules are selected explicitly by the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa` tags. axe-core 4.14.0 has no rules tagged `wcag22a`, and its WCAG 2.2 AA coverage is the `target-size` rule. 64 of the 70 rules with these tags run: following axe-core's default behavior, 4 experimental rules (`css-orientation-lock`, `p-as-heading`, `table-fake-caption`, `td-has-header`) and 2 deprecated rules (`aria-roledescription`, `audio-caption`) are skipped. Best-practice and AAA rules are not part of this baseline; the suite disables no rule and does not filter results by impact. Each test runs in a new browser context in which both the emulated system scheme and the stored `eternalRestTheme` preference (version 1, mode `light` or `dark`) select the theme. Before scanning, the test waits, without fixed delays, until `main.js` has set the `js` class, `html[data-theme]` and the theme toggle state, and until `document.fonts.ready` resolves; interactive states are reached through the actual controls.

Any violation fails the test. The message names the scanned URL and scope and, for each rule, its ID, impact, description, a link to remediation guidance, and the selector and failure summary of every affected element. The complete results of each scan (`violations` and `incomplete`, the results that need manual review) are written to `reports/accessibility/<test>/axe-results.json`; the directory is ignored by Git and cleared on every run. Such a message indicates a detected violation, whereas a timeout, a navigation error or a failed state-setup assertion indicates a failure before the scan, with no results file.

A11Y-01 baseline run (2026-10-26, Windows, Chromium from Playwright 1.64.1, axe-core 4.14.0, local `dist/`): `npm run test:a11y` — PASS, 30/30 scans executed, 0 WCAG A/AA rule violations (1.9 min). axe flagged 100 `color-contrast` results for manual review, only in page scans, 50 per theme: 40 for the decorative `↑` arrow (`span[aria-hidden="true"]`) in the `.legal-section__back` links of the legal pages (17 in `terms.html`, 14 in `privacy.html`, 9 in `cookies.html`), whose content axe treats as non-text characters; 5 for `.page-closing__label` on `index.html`, `about.html`, `services.html`, `pricing.html` and `guide.html`; and 5 for `.hero__eyebrow`, `h1`, `.hero__lead` and the two hero `.button` links on `index.html`, where axe could not determine the background because of overlapping elements. The contrast of these elements was assessed neither as passing nor as failing and requires manual review. A negative control of the same suite against a copy of the build outside the repository, with the `lang` attribute and the logo's `alt` removed from `index.html`, failed both scans of that page with the `html-has-lang` and `image-alt` rules.

Zero violations in an automated scan do not establish WCAG conformance. axe-core checks only a subset of the criteria, and the result covers only Chromium, the described viewports and states, and reduced motion. The scans do not replace manual testing, testing with screen readers and other assistive technologies, or verification on real devices.

`npm run check:references` checks ID references in the root-level HTML pages of `dist/`, after Vite has inserted the `partials/` content. It therefore requires a prior `npm run build` and does not run one itself. On every page it reports duplicate `id` values and references without a target in `aria-controls`, `aria-describedby` and `aria-labelledby` (each ID of a whitespace-separated list separately), in `label[for]`, in same-page `href="#id"` links and in fragment links to other project pages, such as `services.html#id`, which are checked on the target page. The same `id` on different pages is not a duplicate. External URLs, `mailto:`, `tel:` and `href="#"` placeholders are skipped. Each error names the page, line, attribute and the missing or duplicated ID, and the command then exits with a non-zero code; on success it reports how many pages and references it checked. A missing `dist/` also fails, with an instruction to build first. The script uses only built-in Node.js modules, writes nothing and is not part of `npm run build`. It checks only that reference targets exist, not ARIA semantics or interactive behavior in a browser.

The same command guards the module-path contract of `partials/disclosure-init.html`: the initializer removes `js-pending` only after a load or parse error from a script whose path matches its `appModule` expression. The script reads that expression directly from the partial as a literal (without executing any code), so it keeps no second copy; if it cannot be found or compiled, the check fails. Pages with the initializer are identified in the built HTML, and the others are listed as skipped. Each such page must contain exactly one `<script type="module" src>`, whose `src` is resolved against the page to a URL pathname and tested against the expression. On success it prints each page and its matched path; an error names the page, line, `src`, resolved path and expression, and the command exits with a non-zero code. This catches, for example, a Vite output-naming change that would leave the header menu closed and FAQ answers and package details hidden after a failed module load. The check does not simulate a module failure in a browser.

`npm run format:check` compares files with Prettier 3 output using default options (the repository contains no Prettier configuration) and writes nothing; it fails when any in-scope file needs formatting. `npm run format` is its writing counterpart. The check covers code layout only and does not replace ESLint linting or runtime testing of the site in a browser. All in-scope files have received a baseline format, so the check passes in a clean working copy. Prettier expects LF line endings by default; `.gitattributes` (`* text=auto eol=lf`) keeps LF in every working copy, including on Windows with `core.autocrlf=true`, and a file saved with CRLF endings, for example by an editor, is reported.

Both commands skip files matched by `.gitignore` and `.prettierignore`. `.prettierignore` excludes the generated `dist/`, `node_modules/`, `package-lock.json`, `LICENSE.md`, the legal pages `terms.html`, `privacy.html` and `cookies.html`, and the report archive in `docs/archive/`, so formatting does not change these files. Excluded files are not checked either; the shared header and footers, including those used by the legal pages, live in `partials/` and are checked. `.prettierignore` applies only to Prettier and does not protect files from other tools or manual edits.

### Performance Audits

`npm run audit:performance` creates a production build once, then runs `scripts/audit-performance.js`. The script starts Vite Preview at `http://127.0.0.1:8183` with `--strictPort` (a different port from the 8182 used by Playwright; an occupied port fails the audit instead of reusing an existing server), waits up to 30 s for the homepage to respond, and runs Lighthouse CI (`@lhci/cli` 0.15.1 with Lighthouse 12.6.1) using the `lighthouserc.json` configuration. Four pages are measured: `index.html`, `pricing.html`, `guide.html` and `contact.html`, three times each in two separate phases: first with Lighthouse's default mobile profile, then with the desktop profile (`preset: desktop`). That is 24 measurements in total, covering the Performance category only. After completion, a failure or an interruption (Ctrl+C), the script stops Lighthouse and the server. The command is not part of the `Quality Checks` workflow or any other script, and it sends no results to external services: `lhci upload --target=filesystem` only writes the reports to disk. The script runs Lighthouse CI without `LHCI_*` environment variables, which could otherwise override `lighthouserc.json` and the script's flags, including the report target; it lists any ignored variables in its output.

The script passes Lighthouse the path of the Chromium installed for Playwright (`npx playwright install chromium`, the same installation as the tests use). A different Chrome or Chromium browser can be selected with the `CHROME_PATH` environment variable. A missing browser, a missing built page in `dist/` or a configured URL outside the local server fails the command before measuring, leaving earlier reports unchanged. No global Lighthouse installation is required.

Results are written to the Git-ignored `reports/performance/` directory, which is cleared after these prerequisites pass, before the server starts. The `mobile/` and `desktop/` directories contain the HTML and JSON report of every measurement, named after the page path and its UTC start time (e.g. `index_html-2026_10_27_15_15_23.report.html`), plus the Lighthouse CI `manifest.json`. For every page and profile pair, `summary.json` records the number of valid measurements, the medians of the Performance score (0–100), LCP, TBT and FCP (ms) and CLS (unitless), the values of the individual measurements with their report paths and Lighthouse's CPU benchmark (`benchmarkIndex`), Lighthouse warnings, the Lighthouse and browser versions, the actual emulation settings of both profiles, the `complete` or `incomplete` status and a list of errors. The script calculates each metric's median separately from the actual measurements, so the medians of one page may come from different runs. The Git-ignored `.lighthouseci/` directory holds Lighthouse CI's working copy of the last phase's results.

A measurement is rejected when Lighthouse reports a runtime error (`runtimeError`), or when the report has a different device profile, a different URL, a missing metric or a start time before the current phase, or has no HTML report. Lighthouse CI retries a failed Lighthouse run up to three attempts. The command exits with a non-zero code when the build, the server start, the browser or the collection fails, or when any of the eight page and profile pairs does not have exactly three valid measurements; the reports of completed measurements and a `summary.json` with the `incomplete` status are then kept for diagnosis. After an interruption, the reports of phases completed earlier are kept, without the results of the interrupted phase. A low Performance score is not an execution failure: the command has no score thresholds or assertions.

The results are lab measurements. Lighthouse loads the pages from local Vite Preview in a new browser profile and simulates network and CPU constraints (`throttlingMethod: simulate`): the mobile profile emulates a 412 × 823 px screen at DPR 1.75, a 150 ms RTT, 1.6 Mbps throughput and a 4× slower CPU, and the desktop profile a 1350 × 940 px screen at DPR 1, a 40 ms RTT, 10 Mbps and no CPU slowdown. The results do not describe Netlify hosting performance (CDN, compression, cache headers, HTTP version, network distance) or the experience of real users. Real-user Core Web Vitals come from field data (e.g. CrUX or RUM), which the project does not collect. A standard page-load audit does not measure INP, because that metric requires real interactions; TBT is a separate lab metric and is not an INP estimate. Results depend on the computer's performance and load, so only runs made under similar conditions should be compared; the median of three measurements reduces variability but does not remove it.

PERF-01 baseline run (2026-10-27, Windows 11, headless Chromium 156.0.8078.4 from Playwright 1.64.1, Lighthouse 12.6.1, local `dist/`): `npm run audit:performance` — complete, 24/24 measurements, exit code 0 (about 14 min including the build). Medians:

| Page           | Profile | Performance | LCP (ms) | CLS   | TBT (ms) | FCP (ms) |
| -------------- | ------- | ----------- | -------- | ----- | -------- | -------- |
| `index.html`   | mobile  | 91          | 2877     | 0     | 0        | 2427     |
| `pricing.html` | mobile  | 97          | 2202     | 0.001 | 0        | 1977     |
| `guide.html`   | mobile  | 97          | 2202     | 0     | 0        | 1977     |
| `contact.html` | mobile  | 97          | 2196     | 0.001 | 0        | 1964     |
| `index.html`   | desktop | 98          | 609      | 0.001 | 0        | 550      |
| `pricing.html` | desktop | 100         | 486      | 0     | 0        | 466      |
| `guide.html`   | desktop | 99          | 486      | 0     | 0        | 466      |
| `contact.html` | desktop | 97          | 714      | 0     | 16       | 660      |

In all 12 mobile measurements, Lighthouse warned that the CPU appeared slower than the profile assumes; `benchmarkIndex` ranged from 418 to 622 in the mobile measurements and from 351 to 789 across all 24 measurements, and the computer was loaded by other applications during the run. Individual mobile measurements deviated from the others (`index.html`: 65, 91 and 91; `pricing.html`: 97, 97 and 83), so this run is a reference point for this computer and these conditions rather than a set of absolute values.

### Accessibility

- Semantic `header`, `nav`, `main` and `footer` regions, a skip link and `:focus-visible` styles.
- Mobile navigation with synchronized `aria-expanded` and `aria-hidden`, focus transfer and restoration, Tab looping, Escape dismissal and scroll locking. The closed menu and the hidden back-to-top control cannot receive focus.
- The current page is marked with `aria-current="page"` in the main navigation and, on the legal pages, also in the footer links to the legal documents.
- Accordions and package details synchronizing `aria-expanded` with panel visibility.
- Form fields with labels and messages connected through `aria-describedby`; errors marked with `aria-invalid`; after submission, a success message with `role="status"` or an error message with `role="alert"` receives focus, while a pending request sets `aria-busy` on the form and `aria-disabled` on the button, which stays focusable.
- `prefers-reduced-motion` handling that disables CSS transition durations and smooth scrolling.

These are mechanisms present in the code, without a claim of WCAG compliance.

### SEO

All ten pages declare Polish as their document language and retain their own title and meta description, with consistent favicon declarations (ICO, 96 × 96 PNG, SVG and 180 × 180 Apple Touch Icon) and the manifest from `public/favicons/`. On the nine content pages, Open Graph metadata (`pl_PL`, type `website`) and Twitter/X `summary_large_image` cards reuse each page’s title and description and the shared `public/images/og.jpg` image (1200 × 630 JPEG) with Polish alternative text. Open Graph page URLs and the image URL are absolute production URLs under `https://ds-ceremonial-pr01-eternalrest.netlify.app/`.

Each of the ten pages includes one `<meta name="robots" content="noindex, follow" />` directive in its `<head>` to disable indexing of this fictional business demonstration while allowing links to be followed. The `public/robots.txt` file retains `User-agent: *` and `Allow: /` so crawlers can fetch the pages and read `noindex`. The website remains publicly accessible, and Open Graph and Twitter/X previews remain functional. The unchanged `public/sitemap.xml` remains available as a technical demonstration of the URL structure but is no longer advertised through a `Sitemap:` declaration in `robots.txt`; it lists the nine content pages, including legal documents, excludes `404.html`, represents the homepage as `/`, and includes no invented dates or update parameters. Search engines need to crawl the pages again to process the directive; immediate removal from their indexes is not guaranteed.

Vite copies `public/` into the root of `dist/`, preserving subdirectories; manifest icon paths are relative to `favicons/site.webmanifest`. No `link rel="canonical"` tags or structured data were added. Netlify deployment remains manual.

### Data and State Persistence

Content and prices are stored in HTML. The theme preference is saved in `localStorage` under `eternalRestTheme` as an object with version `1` and mode `auto`, `light` or `dark`. The entry is created only when the theme toggle or the system-mode button is used and has no expiry. The `<head>` initializer only reads it before the first paint and never writes to it; a missing, unreadable or other-version entry means the system scheme. The pricing filter, expanded panels and form have no persistent browser storage; the implementation has no backend or database of its own, and submitted form entries are stored by Netlify Forms. The application sets no cookies and uses no `sessionStorage`, IndexedDB, Cache Storage, Service Worker, analytics or marketing tools, so it includes no cookie banner or consent manager.

### License

The project is covered by the [KP_CODE Proprietary Project License](LICENSE.md), version 1.0, and is not open-source software. The license describes limited local use for private, non-commercial evaluation; public deployment, redistribution and commercial use require separate written permission. Third-party materials retain their own license terms and are listed in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
