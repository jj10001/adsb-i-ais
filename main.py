from fastapi import FastAPI, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import httpx
import math
import asyncio
from datetime import datetime

app = FastAPI()

# Cache for 3-5 seconds
cache = {}
CACHE_TTL = 4

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance

async def fetch_adsb_data(url: str):
    try:
        # Increase timeout or try multiple endpoints
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Setting a User-Agent is sometimes required by these free APIs
            headers = {"User-Agent": "MyADSBLiveTracker/1.0 (admin@example.com)"}
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

@app.get("/api/flights")
async def get_flights(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: float = Query(100.0, description="Radius in km")
):
    # Quantize coordinates for caching
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}_{radius}"
    current_time = datetime.now().timestamp()

    if cache_key in cache:
        cached_data, timestamp = cache[cache_key]
        if current_time - timestamp < CACHE_TTL:
            return cached_data

    # Convert radius from km to Nautical Miles
    radius_nm = radius * 0.539957

    # 1. api.airplanes.live requires email contact for user-agent or it errors
    # 2. api.adsb.lol
    # 3. api.adsb.one

    endpoints = [
        f"https://api.airplanes.live/v2/point/{lat}/{lon}/{radius_nm}",
        f"https://api.adsb.lol/v2/point/{lat}/{lon}/{radius_nm}",
        f"https://api.adsb.one/v2/point/{lat}/{lon}/{radius_nm}"
    ]

    data = None
    for endpoint in endpoints:
        data = await fetch_adsb_data(endpoint)
        if data and "ac" in data:
            break

    if not data or "ac" not in data:
        result = {
            "timestamp": int(current_time),
            "user_location": {"lat": lat, "lon": lon},
            "radius_km": radius,
            "total": 0,
            "aircraft": []
        }
        return result

    aircraft_list = []
    seen_hex = set()

    for ac in data["ac"]:
        if "hex" not in ac or "lat" not in ac or "lon" not in ac:
            continue

        hex_code = ac["hex"]
        if hex_code in seen_hex:
            continue

        ac_lat = ac["lat"]
        ac_lon = ac["lon"]

        # Verify distance is within strict boundary
        distance_km = haversine_distance(lat, lon, ac_lat, ac_lon)
        if distance_km > radius:
            continue

        seen_hex.add(hex_code)

        aircraft_list.append({
            "hex": hex_code,
            "flight": ac.get("flight", "").strip() or "UNKNOWN",
            "lat": ac_lat,
            "lon": ac_lon,
            "altitude_ft": ac.get("alt_baro", 0) or ac.get("alt_geom", 0),
            "track_deg": ac.get("track", 0),
            "speed_kts": ac.get("gs", 0),
            "type": ac.get("t", "UNKNOWN"),
            "distance_km": round(distance_km, 2)
        })

    result = {
        "timestamp": int(current_time),
        "user_location": {"lat": lat, "lon": lon},
        "radius_km": radius,
        "total": len(aircraft_list),
        "aircraft": aircraft_list
    }

    cache[cache_key] = (result, current_time)

    return result

# Serve static files for the frontend
app.mount("/", StaticFiles(directory="public", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
