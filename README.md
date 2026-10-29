# adsb-i-ais

Projekt to aplikacja Full-Stack do śledzenia statków powietrznych na żywo wykorzystująca dane ADS-B. Backend został napisany w Pythonie przy użyciu frameworka FastAPI. Udostępnia on API, a także serwuje frontend oparty na HTML, CSS, Vanilla JS oraz bibliotece Leaflet.js.

## Jak uruchomić projekt

### Wymagania wstępne
* Python 3.8 lub nowszy
* Menedżer pakietów pip

### Krok po kroku

1. **Przejdź do katalogu projektu:**
   Upewnij się, że znajdujesz się w głównym katalogu projektu `adsb-i-ais`.

2. **(Opcjonalnie, ale zalecane) Utwórz i aktywuj wirtualne środowisko:**
   ```bash
   python -m venv venv

   # Aktywacja w systemie Windows:
   venv\Scripts\activate

   # Aktywacja w systemie Linux/macOS:
   source venv/bin/activate
   ```

3. **Zainstaluj wymagane zależności:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Uruchom aplikację:**
   Aplikację można uruchomić na dwa sposoby:

   **Opcja A (rekomendowana - przez plik main.py):**
   ```bash
   python main.py
   ```

   **Opcja B (bezpośrednio przez uvicorn):**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

5. **Otwórz aplikację w przeglądarce:**
   Po pomyślnym uruchomieniu, interfejs mapy oraz serwer będą dostępne pod adresem:
   [http://localhost:8000](http://localhost:8000)

## Dokumentacja
Szczegóły dotyczące założeń, celów oraz wybranych rozwiązań architektonicznych znajdują się w dokumencie ADR (Architecture Decision Record) zlokalizowanym w katalogu `docs/`.
