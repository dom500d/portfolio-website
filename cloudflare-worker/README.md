# Strava Stats Cloudflare Worker

Handles OAuth token refresh and serves your Strava stats without exposing API keys.

## Setup

### 1. Create Strava API Application

1. Go to https://www.strava.com/settings/api
2. Create an application
3. Note your Client ID and Client Secret
4. Set the Authorization Callback Domain to `localhost` for initial setup

### 2. Get Initial Refresh Token

Run this one-time OAuth flow to get your refresh token:

```bash
# Open in browser to authorize:
# https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&scope=read,activity:read

# After authorizing, you'll be redirected to localhost with a code parameter
# Exchange it for tokens:
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=AUTHORIZATION_CODE_FROM_URL \
  -d grant_type=authorization_code
```

Save the `refresh_token` from the response.

### 3. Create KV Namespace

```bash
wrangler kv:namespace create STRAVA_CACHE
```

Update `wrangler.toml` with the returned namespace ID.

### 4. Set Secrets

```bash
wrangler secret put STRAVA_CLIENT_ID
wrangler secret put STRAVA_CLIENT_SECRET
wrangler secret put STRAVA_REFRESH_TOKEN
```

### 5. Update Config

Edit `wrangler.toml`:
- Set `ATHLETE_ID` to your Strava athlete ID
- Set `ALLOWED_ORIGIN` to your domain

### 6. Deploy

```bash
wrangler deploy
```

## Endpoints

- `GET /stats` - Returns YTD and all-time ride totals
- `GET /activities` - Returns last 5 activities
- `GET /health` - Health check

## Response Examples

### /stats
```json
{
  "ytd_ride": {
    "count": 42,
    "distance_miles": 1234,
    "elevation_feet": 56789,
    "moving_time_hours": 100
  },
  "all_ride": {
    "count": 500,
    "distance_miles": 15000,
    "elevation_feet": 500000,
    "moving_time_hours": 1200
  },
  "updated_at": "2026-06-02T12:00:00.000Z"
}
```

### /activities
```json
[
  {
    "name": "Morning Ride",
    "type": "Ride",
    "distance_miles": 25.4,
    "elevation_feet": 1200,
    "moving_time_minutes": 90,
    "date": "2026-06-01",
    "average_speed_mph": 17.2
  }
]
```
