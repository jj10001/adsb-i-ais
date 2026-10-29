# ADR 001: Założenia, cele i wybrane rozwiązania technologiczne

## Kontekst
Projekt ma na celu stworzenie aplikacji Full-Stack do śledzenia statków powietrznych na żywo, z wykorzystaniem otwartych danych ADS-B.
Aplikacja ma być wydajna, prosta w instalacji oraz użyciu. Należy zminimalizować ryzyko awarii zewnętrznych źródeł danych.

## Cele
* **Lekkość i szybkość:** Serwowanie statycznych plików oraz API z jednego źródła.
* **Niezawodność:** Obsługa błędów zewnętrznych API ADS-B (często darmowe API mają limity lub ulegają awariom).
* **Brak opłat:** Wykorzystanie darmowych i otwartych narzędzi oraz źródeł danych.
* **Prostota uruchomienia:** Projekt ma pozwalać na szybkie odpalenie komendą bez skomplikowanej konfiguracji.

## Wybrane rozwiązania architektoniczne i technologiczne

### 1. Backend: Python + FastAPI
* **Dlaczego:** FastAPI jest szybkim i nowoczesnym frameworkiem webowym do budowy API. Pozwala na asynchroniczne zapytania (async/await), co jest kluczowe przy komunikacji z zewnętrznymi API.
* **Serwowanie plików:** FastAPI wykorzystuje `StaticFiles`, aby serwować pliki frontendu z katalogu `public/`, co ułatwia zarządzanie i usuwa potrzebę stosowania oddzielnego serwera www (np. Nginx) w środowisku lokalnym/deweloperskim.

### 2. Frontend: Vanilla JS + HTML + CSS + Leaflet.js
* **Dlaczego:** Wykorzystanie "czystego" JavaScriptu zapewnia minimalny narzut i maksymalną wydajność przy prostych interfejsach.
* **Leaflet.js:** Wybrano tę bibliotekę do obsługi map, ponieważ jest lekka, otwarta i świetnie sprawdza się w aplikacjach renderujących dużą ilość punktów na mapie.

### 3. Zewnętrzne źródła danych (ADS-B) z mechanizmem Failover
* **Dlaczego:** Aby uniknąć "Single Point of Failure" (pojedynczego punktu awarii), wykorzystano kilka endpointów (api.airplanes.live, api.adsb.lol, api.adsb.one). W przypadku błędu jednego API, aplikacja automatycznie odpytuje kolejne.
* **User-Agent:** Zastosowano niestandardowy nagłówek "User-Agent", ponieważ wiele publicznych API ADS-B blokuje anonimowe żądania i zwraca błędy typu 403 Forbidden.

### 4. Cachowanie zapytań (In-Memory Cache)
* **Dlaczego:** W celu zminimalizowania liczby wychodzących zapytań do zewnętrznych API (aby uniknąć "Rate Limiting") oraz przyspieszenia odpowiedzi dla użytkownika.
* **Implementacja:** Zastosowano prosty słownik (dictionary) w pamięci RAM aplikacji, przechowujący wyniki dla danych koordynatów (po kwantyzacji) na krótki okres (3-5 sekund). Do obliczania odległości (aby odfiltrować wyniki do wymaganego promienia) użyto wzoru Haversine'a.

## Podsumowanie
Powyższe decyzje pozwoliły na stworzenie lekkiej i responsywnej aplikacji, minimalizującej problemy związane ze stabilnością darmowych dostawców danych ADS-B. Architektura ta pozwala na łatwą implementację nowych funkcji i bezproblemowe uruchamianie środowiska.
