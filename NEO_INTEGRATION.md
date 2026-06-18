# NASA NEO API GraphQL Integration

## Overview

This implementation integrates the NASA Near Earth Objects (NEO) Feed API into the existing GraphQL Yoga server using GraphQL Mesh v0.

## Architecture

### Components

1. **NEO Schema** (`src/schema/neo/`)
   - `neo.graphql` - GraphQL type definitions for NearEarthObject and NearEarthObjectFeed
   - `types.ts` - TypeScript interfaces for type safety
   - `neo.ts` - Resolver implementation
   - `resolvers.ts` - Resolver exports for schema merging

2. **Configuration**
   - `.meshrc.yml` - GraphQL Mesh configuration for NASA API

3. **Server Updates**
   - `src/server.ts` - Updated to provide NASA API wrapper through context

4. **Schema Updates**
   - `src/schema/schema.graphql` - Added `nearEarthObjects` query

5. **Tests**
   - `tests/queries/nearEarthObjects.test.ts` - Test for NEO query

## How It Works

### GraphQL Query

```graphql
query {
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
```

### Data Flow

1. GraphQL query comes into the Yoga server
2. Resolver calls the NASA API through the context-provided wrapper
3. NASA response is transformed:
   - `near_earth_objects` (date-keyed object) is flattened into a single array
   - Response fields are mapped to schema field names:
     - `is_potentially_hazardous_asteroid` → `isPotentiallyHazardousAsteroid`
     - `estimated_diameter.kilometers` fields → `estimatedDiameterMinKm/MaxKm`
     - First close approach date fields are extracted
4. Transformed data is returned to the client

### Field Filtering

Only the following fields are exposed in the GraphQL schema:
- `elementCount` - Total number of near-earth objects in the response
- `objects` - Array of flattened near-earth objects with:
  - `id` - NEO unique identifier
  - `name` - NEO name
  - `isPotentiallyHazardousAsteroid` - Boolean flag
  - `estimatedDiameterMinKm` - Minimum estimated diameter in kilometers
  - `estimatedDiameterMaxKm` - Maximum estimated diameter in kilometers
  - `closeApproachDate` - Date of closest approach
  - `relativeVelocityKph` - Relative velocity in km/h
  - `missDistanceKm` - Miss distance in kilometers

## Configuration

### .meshrc.yml

The Mesh configuration specifies:
- NASA NEO API endpoint
- HTTP GET method
- Custom headers for API requests
- Flatten transform for easier data handling

## API Key

The implementation uses `DEMO_KEY` as the NASA API key as specified. This is embedded in the server context during NASA API calls.

## Running the Server

```bash
npm run dev
```

The server listens at `http://localhost:4000/graphql`

## Running Tests

```bash
npm test -- nearEarthObjects.test.ts
```

## Dependencies

- `@graphql-mesh/cli` - GraphQL Mesh CLI
- `@graphql-mesh/json-schema` - JSON Schema handler for API integration

## Error Handling

- Missing API wrapper in context is caught and thrown
- NASA API errors are logged and propagated
- All errors are handled with try-catch blocks

## Future Enhancements

1. Implement response caching to avoid rate-limiting issues with DEMO_KEY
2. Add proper Mesh SDK initialization for automated schema generation
3. Add field-level authorization if needed
4. Implement pagination for large result sets
5. Add error handling and retry logic for API timeouts
