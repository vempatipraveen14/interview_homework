export interface NearEarthObject {
  id: string;
  name: string;
  isPotentiallyHazardousAsteroid: boolean;
  estimatedDiameterMinKm: number;
  estimatedDiameterMaxKm: number;
  closeApproachDate: string;
  relativeVelocityKph: string;
  missDistanceKm: string;
}

export interface NearEarthObjectFeed {
  elementCount: number;
  objects: NearEarthObject[];
}

export interface NearEarthObjectsArgs {
  startDate: string;
  endDate: string;
}
