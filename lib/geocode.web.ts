
type GeocodeResult = {
  lat: string;
  lon: string;
  display_name?: string;
};

export async function geocodeAddress(address: string) {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: address,
      format: "jsonv2",
      limit: "1",
    }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Address lookup failed: HTTP ${response.status}`,
    );
  }

  const results =
    (await response.json()) as GeocodeResult[];

  console.log("Geocoding results:", results);

  if (results.length === 0) {
    return null;
  }

  const latitude = Number(results[0].lat);
  const longitude = Number(results[0].lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Geocoding returned invalid coordinates.");
  }

  return {
    latitude,
    longitude,
  };
}
