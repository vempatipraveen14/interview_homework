import { parse } from 'graphql';
import { executor } from '../exectuor';

const query = parse(`
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
`);

describe('NEO Query', () => {
  it('should fetch near earth objects', async () => {
    const result = await executor({
      document: query,
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          nearEarthObjects: expect.objectContaining({
            elementCount: expect.any(Number),
            objects: expect.any(Array),
          }),
        }),
      })
    );
  });
});
