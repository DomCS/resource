import * as Location from "expo-location";

export async function geocodeAddress(address: string) {
  const results = await Location.geocodeAsync(address);

  if (!results.length) {
    return null;
  }

  return {
    latitude: results[0].latitude,
    longitude: results[0].longitude,
  };
}
