export interface GeoOptions {
  latitude: number;
  longitude: number;
}

export function formatGeo(options: GeoOptions): string {
  return `geo:${options.latitude},${options.longitude}`;
}
