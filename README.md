# Strava MCP

MCP server for the Strava API. Read and explore your Strava data from Claude.

## Prerequisites

- [Bun](https://bun.sh) runtime
- Strava API application ([create one here](https://www.strava.com/settings/api))

## Setup

```bash
git clone <repo-url>
cd strava-mcp
bun install
```

## Configuration

Set these environment variables:

| Variable              | Description              | Required |
| --------------------- | ------------------------ | -------- |
| `STRAVA_CLIENT_ID`    | Strava API client ID     | Yes      |
| `STRAVA_CLIENT_SECRET`| Strava API client secret | Yes      |

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "strava": {
      "command": "bun",
      "args": ["run", "/path/to/strava-mcp/src/index.ts"],
      "env": {
        "STRAVA_CLIENT_ID": "your-client-id",
        "STRAVA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Claude Code

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "strava": {
      "command": "bun",
      "args": ["run", "/path/to/strava-mcp/src/index.ts"],
      "env": {
        "STRAVA_CLIENT_ID": "your-client-id",
        "STRAVA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Available Tools

| Tool                   | Description                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- |
| `connect_strava`       | Authenticate with Strava via OAuth. Opens a browser window for authorization.     |
| `get_activities`       | List recent Strava activities with pagination and date filtering.                 |
| `get_activity_details` | Get full details of a Strava activity including gear, description, and metrics.   |
| `get_activity_streams` | Get time-series stream data for an activity (heart rate, power, cadence, etc).    |
| `get_activity_laps`    | Get lap data for a Strava activity.                                               |
| `get_athlete_profile`  | Get the authenticated athlete's profile information.                              |
| `get_athlete_stats`    | Get activity statistics for an athlete grouped by sport and time period.          |
| `get_athlete_zones`    | Get the authenticated athlete's heart rate and power zones.                       |
| `get_gear`             | Get details about a piece of gear (shoe or bike) by ID.                           |
| `get_segment`          | Get detailed information about a Strava segment.                                  |
| `explore_segments`     | Search for Strava segments within a geographic bounding box.                      |
| `get_segment_effort`   | Get details about a specific segment effort.                                      |
| `list_segment_efforts` | List all efforts on a specific segment.                                           |
| `get_route`            | Get details about a Strava route.                                                 |
| `list_athlete_routes`  | List routes created by the authenticated athlete.                                 |
| `export_route_gpx`     | Export a Strava route as GPX XML.                                                 |
| `export_route_tcx`     | Export a Strava route as TCX XML.                                                 |

## Usage Examples

```
"Connect to Strava"
"Show my recent activities"
"Get details for my last run"
"Show heart rate and power data for my last ride"
"What are my year-to-date running stats?"
"Show my heart rate zones"
"Find popular cycling segments near downtown"
"List my saved routes"
"Export my route as a GPX file"
```

## Notes

- **OAuth**: `connect_strava` starts a local server and opens the browser for Strava authorization. Required before using other tools.
- **Activity types**: runs, rides, swims, hikes, and all other Strava-supported sport types
- **Streams**: time-series data includes heart rate, power, cadence, altitude, velocity, temperature, and more
- **Segments**: geographic sections of road or trail where athletes can compare efforts
- **Routes**: planned courses that can be exported as GPX or TCX for device import

## Inspiration

- [strava-mcp](https://github.com/r-huijts/strava-mcp) — Strava MCP server
- [joshgretz](https://github.com/jgretz/joshgretz) — Author
