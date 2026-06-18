import { NearEarthObjectFeed, NearEarthObjectsArgs } from './types';

export const nearEarthObjectsResolver = async (
  parent: any,
  args: NearEarthObjectsArgs,
  context: any
): Promise<NearEarthObjectFeed> => {
  try {
    // Use NASA API wrapper from context
    const nasaApi = context.nasaApi;
    
    if (!nasaApi) {
      throw new Error('NASA API wrapper not available in context');
    }

    // Call the NASA NEO API
    const nasaResponse = await nasaApi(args.startDate, args.endDate);

    // Transform the NASA response to our schema shape
    const objects: any[] = [];
    const nearEarthObjectsByDate = nasaResponse.near_earth_objects || {};

    // Flatten the near_earth_objects structure (which is keyed by date)
    for (const dateKey in nearEarthObjectsByDate) {
      const objectsForDate = nearEarthObjectsByDate[dateKey];
      if (Array.isArray(objectsForDate)) {
        for (const obj of objectsForDate) {
          // Get the first close approach date from the array
          const closeApproachDate = obj.close_approach_data?.[0]?.close_approach_date || '';
          const relativeVelocity = obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || '';
          const missDistance = obj.close_approach_data?.[0]?.miss_distance?.kilometers || '';

          objects.push({
            id: obj.id || '',
            name: obj.name || '',
            isPotentiallyHazardousAsteroid: obj.is_potentially_hazardous_asteroid || false,
            estimatedDiameterMinKm: obj.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
            estimatedDiameterMaxKm: obj.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
            closeApproachDate,
            relativeVelocityKph: relativeVelocity,
            missDistanceKm: missDistance,
          });
        }
      }
    }

    return {
      elementCount: nasaResponse.element_count || 0,
      objects,
    };
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    throw error;
  }
};
