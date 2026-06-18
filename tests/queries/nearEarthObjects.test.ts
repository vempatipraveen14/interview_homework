import executor from '../exectuor';

const query = `
  query NearEarthObjects {
    nearEarthObjects(startDate: "2015-09-07", endDate: "2015-09-08") {
      elementCount
      objects {
        id
        name
        isPotentiallyHazardousAsteroid
        estimatedDiameterMinKm
        estimatedDiameterMaxKm
        closeApproachDate
        relativeVelocityKph
        missDistanceKm
      }
    }
  }
`;

describe('NEO Query', () => {
  it('should fetch near earth objects', async () => {
    const result = await executor({
      source: query,
      contextValue: {
        client: 'test-client',
      },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.nearEarthObjects).toBeDefined();
    expect(result.data?.nearEarthObjects?.elementCount).toBeGreaterThan(0);
    expect(Array.isArray(result.data?.nearEarthObjects?.objects)).toBe(true);
  });
});
