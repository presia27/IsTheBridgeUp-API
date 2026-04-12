# IsTheBridgeUp API Specification

## Base URL
`[TO BE CONFIGURED]`

## Authentication
No authentication required.

## Rate Limiting
- **Limit**: 3 requests per 500 milliseconds
- Exceeding this limit will result in a `503 Service Unavailable` response

---

## Endpoints

### 1. List All Bridges (Metadata Only)

Retrieves metadata for all bridges without detailed status information.

**Endpoint**: `GET /api/v1/bridges/list`

#### Query Parameters
None

#### Success Response

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "count": 2,
  "bridges": [
    {
      "id": 4,
      "name": "South Park",
      "region": "Duwamish"
    },
    {
      "id": 7,
      "name": "University",
      "region": "Ship Canal"
    }
  ]
}
```

**Response Fields**:
- `count` (integer) - Total number of bridges
- `bridges` (array) - Array of bridge metadata objects
  - `id` (number) - Unique identifier for the bridge
  - `name` (string) - Full name of the bridge
  - `region` (string) - Geographic area or waterway description

#### Error Responses

**Status Code**: `500 Internal Server Error`
- Server encountered an unexpected error

**Status Code**: `503 Service Unavailable`
- Server is busy processing other requests or rate limit exceeded

---

### 2. Get Bridge by ID

Retrieves complete information for a specific bridge, including current up/down status.

**Endpoint**: `GET /api/v1/bridges/{id}`

#### Path Parameters
- `id` (number, required) - The unique identifier of the bridge

#### Query Parameters
- `timetags` (boolean, optional) - When set to `true`, appends the last 4 digits of the current Unix timestamp (in milliseconds) to the `liveimg` URL. This forces browsers to refresh cached images.
  - Default: `false`
  - Example: `?timetags=true`

#### Success Response

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "LastUpdate": 1765599161982,
  "count": 1,
  "bridges": [
    {
      "id": 4,
      "name": "South Park",
      "region": "Duwamish",
      "latitude": 47.529234689935,
      "longitude": -122.314119434031,
      "staticimg": null,
      "liveimg": "https://www.seattle.gov/trafficcams/images/14_S_Cloverdale_SEC.jpg",
      "bridge_type": "Bascule",
      "short_name": "South Park",
      "status": "Down"
    }
  ]
}
```

**Response Fields**:
- `LastUpdate` (integer) - Unix timestamp in milliseconds of the last data refresh from transportation agencies
- `bridges` (array) - Array containing a single bridge object
  - `id` (number) - Unique identifier for the bridge
  - `name` (string) - Full name of the bridge
  - `region` (string) - Geographic area or waterway description
  - `latitude` (float) - Latitude coordinate of the bridge location
  - `longitude` (float) - Longitude coordinate of the bridge location
  - `staticimg` (string|null) - URL of a static photograph of the bridge for reference
  - `liveimg` (string|null) - URL of a live traffic camera image (updated frequently)
  - `bridge_type` (string) - Type of bridge mechanism (e.g., "Bascule", "Vertical Lift")
  - `short_name` (string) - Abbreviated name of the bridge
  - `status` (string) - Current bridge status: `"Up"` (raised/open) or `"Down"` (lowered/closed to vessel traffic) or `"Unknown"`

#### Error Responses

**Status Code**: `400 Bad Request`
- Invalid query parameters provided

**Status Code**: `404 Not Found`
- Bridge with the specified ID does not exist

**Status Code**: `500 Internal Server Error`
- Server encountered an unexpected error

**Status Code**: `503 Service Unavailable`
- Server is busy processing other requests or rate limit exceeded

---

### 3. Get All Bridges (Complete Data)

Retrieves complete information for all bridges, including current status for each.

**Endpoint**: `GET /api/v1/bridges/all`

#### Query Parameters
- `timetags` (boolean, optional) - When set to `true`, appends the last 4 digits of the current Unix timestamp (in milliseconds) to all `liveimg` URLs. This forces browsers to refresh cached images.
  - Default: `false`
  - Example: `?timetags=true`

#### Success Response

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "LastUpdate": 1765599059945,
  "count": 2,
  "bridges": [
    {
      "id": 4,
      "name": "South Park",
      "region": "Duwamish",
      "latitude": 47.529234689935,
      "longitude": -122.314119434031,
      "staticimg": null,
      "liveimg": "https://www.seattle.gov/trafficcams/images/14_S_Cloverdale_SEC.jpg",
      "bridge_type": "Bascule",
      "short_name": "South Park",
      "status": "Down"
    },
    {
      "id": 7,
      "name": "University",
      "region": "Ship Canal",
      "latitude": 47.6526527598382,
      "longitude": -122.320430181206,
      "staticimg": null,
      "liveimg": "https://www.seattle.gov/trafficcams/images/Eastlake_Fuhrman_PTZ.jpg",
      "bridge_type": "Bascule",
      "short_name": "University",
      "status": "Down"
    }
  ]
}
```

**Response Fields**:
- `LastUpdate` (integer) - Unix timestamp in milliseconds of the last data refresh from transportation agencies
- `count` (integer) - Total number of bridges returned
- `bridges` (array) - Array of complete bridge objects (see bridge object fields under "Get Bridge by ID")

#### Error Responses

**Status Code**: `400 Bad Request`
- Invalid query parameters provided

**Status Code**: `500 Internal Server Error`
- Server encountered an unexpected error

**Status Code**: `503 Service Unavailable`
- Server is busy processing other requests or rate limit exceeded

---

## Bridge Status Values

- `"Up"` - Bridge is raised/open to allow vessel traffic to pass underneath
- `"Down"` - Bridge is lowered/closed, allowing vehicle and pedestrian traffic to cross
-  `"Unknown"` - Data is unavailable

---

## Notes

- All timestamps are Unix timestamps in milliseconds
- The `timetags` parameter helps prevent browser image caching by appending a timestamp fragment to image URLs
- Image URLs (`staticimg` and `liveimg`) may be `null` if no image is available
- The `bridges` array in the single bridge endpoint (`/api/v1/bridges/{id}`) always contains exactly one element