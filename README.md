# Eternal Rest — multi-page website

Profesjonalny, wielostronicowy serwis dla domu pogrzebowego Eternal Rest. Projekt jest oparty o HTML, CSS i Vanilla JS, z naciskiem na dostępność, czytelne informacje oraz motyw jasny/ciemny.

## Podgląd
- `index.html` — strona główna
- `o-nas.html` — o firmie
- `uslugi.html` — opis usług
- `cennik.html` — pakiety cenowe
- `formularz.html` — kontakt i formularz
- `poradnik.html` — poradnik i FAQ

## Struktura folderów
```
DS-ceremonial-pr01-EternalRest/
├── assets/
│   ├── icons/
│   └── illustrations/
├── css/
│   ├── pages/
│   ├── base.css
│   ├── components.css
│   ├── layout.css
│   ├── main.css
│   ├── tokens.css
│   └── utilities.css
├── js/
│   └── main.js
├── scripts/
│   └── convert-images.js
├── cennik.html
├── formularz.html
├── index.html
├── o-nas.html
├── poradnik.html
├── uslugi.html
├── package.json
├── postcss.config.cjs
└── vite.config.js
```

## Uruchomienie lokalne
1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Start serwera developerskiego Vite (dostępnego także w sieci lokalnej dzięki fladze `--host`):
   ```bash
   npm run dev
   ```

Strony uruchamiaj przez serwer (`npm run dev` lub `npm run preview`) — skrypt ładowany jako `type="module"` nie działa po otwarciu pliku HTML bezpośrednio z dysku (`file://`).

## Build produkcyjny
```bash
npm run build
```
Wygenerowane pliki pojawią się w katalogu `dist/`. Vite buduje wszystkie sześć stron zdefiniowanych jako wejścia w `vite.config.js`:
- `dist/*.html` — strony z niezmienionymi nazwami plików,
- `dist/assets/` — zminifikowany CSS i JS z hashem w nazwach plików.

CSS powstaje z `css/main.css`: Vite scala importy (`@import`), PostCSS dodaje prefiksy (Autoprefixer, `postcss.config.cjs`), a Vite minifikuje wynik. JS powstaje z `js/main.js`, dołączanego na stronach jako `<script type="module">`. Ścieżki do zasobów są względne (`base: "./"`), więc `dist/` można wdrożyć również w podkatalogu serwera. Katalog `dist/` jest generowany — nie edytuj go ręcznie.

## Podgląd wersji produkcyjnej
```bash
npm run preview
```
Polecenie uruchamia `vite preview` i serwuje zawartość `dist/` (domyślnie http://localhost:4173), dlatego najpierw wykonaj `npm run build`.

## Pipeline obrazów
W projekcie nie ma binarnych obrazów. Gdy pojawią się nowe zdjęcia, umieść pliki źródłowe w `assets/src-images/` (PNG/JPG/JPEG) i uruchom:
```bash
npm run images:convert
```
Skrypt zapisze wersje `.webp` i `.avif` w `assets/images/`. Vite dołącza do `dist/` tylko obrazy wskazane w HTML lub CSS, nadając im nazwy z hashem.

## Dostępność
- Strony używają semantycznych landmarków (`header`, `nav`, `main`, `footer`).
- Menu mobilne obsługuje fokus, klawisz ESC i blokadę przewijania.
- Formularz ma walidację po stronie klienta, komunikaty błędów i komunikat sukcesu.
- Motyw jasny/ciemny respektuje preferencje systemowe i `prefers-reduced-motion`.

