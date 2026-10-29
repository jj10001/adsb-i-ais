# Live ADS-B Aircraft Tracker

This is a lightweight, production-ready full-stack web application that displays live aircraft positions around a specified location based on community ADS-B data.

The application uses a **FastAPI** backend to fetch, deduplicate, and cache flight data from upstream sources (`api.airplanes.live`, `api.adsb.lol`, `api.adsb.one`), and serves a **Vanilla JS + Leaflet.js** frontend from a single origin.

## Prerequisites

- **Python 3.7+**
- `pip` (Python package installer)

## Installation & Setup

1. **Clone the repository (or navigate to the project directory):**
   ```bash
   cd <project_directory>
   ```

2. **(Optional but recommended) Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install the required dependencies:**
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

## Running the Project

1. **Start the backend server:**
   You can start the application by running the `main.py` file directly:
4. **Uruchom aplikację:**
   Aplikację można uruchomić na dwa sposoby:

   **Opcja A (rekomendowana - przez plik main.py):**
   ```bash
   python main.py
   ```

   Alternatively, you can run it using Uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Access the application:**
   Open your web browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

## API Endpoint Reference

The backend exposes a single REST endpoint for fetching normalized flight data:

- **`GET /api/flights`**
  - `lat` (float): Latitude of the center point (required)
  - `lon` (float): Longitude of the center point (required)
  - `radius` (float): Radius in kilometers (optional, defaults to 100km)

Example:
```
http://localhost:8000/api/flights?lat=52.23&lon=21.01&radius=100
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
