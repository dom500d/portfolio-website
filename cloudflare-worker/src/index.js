/**
 * Strava Stats Cloudflare Worker
 *
 * Handles OAuth token refresh and returns athlete stats.
 * All secrets stored in Cloudflare environment variables.
 */

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

// Cache keys
const TOKEN_CACHE_KEY = 'strava_access_token';
const STATS_CACHE_KEY = 'strava_athlete_stats';

export default {
  async fetch(request, env, ctx) {
    // Allowed origins
    const allowedOrigins = [
      'https://dorlando.tech',
      'https://dorlando-portfolio.pages.dev',
    ];

    // Also allow any subdomain of pages.dev for preview deployments
    const origin = request.headers.get('Origin') || '';
    const isAllowed = allowedOrigins.includes(origin) ||
                      origin.endsWith('.dorlando-portfolio.pages.dev');

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      // Route handling
      if (url.pathname === '/stats') {
        return await handleStats(env, corsHeaders);
      } else if (url.pathname === '/activities') {
        return await handleActivities(env, corsHeaders);
      } else if (url.pathname === '/koms') {
        return await handleKOMs(env, corsHeaders);
      } else if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), { headers: corsHeaders });
      } else {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: corsHeaders,
        });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};

/**
 * Get a valid access token, refreshing if necessary
 */
async function getAccessToken(env) {
  // Check cache first
  const cached = await env.STRAVA_CACHE.get(TOKEN_CACHE_KEY, { type: 'json' });

  if (cached && cached.expires_at > Date.now() / 1000) {
    return cached.access_token;
  }

  // Refresh the token
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      refresh_token: env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();

  // Cache the new token (expires_at is in seconds)
  await env.STRAVA_CACHE.put(
    TOKEN_CACHE_KEY,
    JSON.stringify({
      access_token: data.access_token,
      expires_at: data.expires_at,
    }),
    { expirationTtl: data.expires_in }
  );

  return data.access_token;
}

/**
 * Get athlete stats
 */
async function handleStats(env, corsHeaders) {
  // Check cache (refresh every 30 minutes)
  const cached = await env.STRAVA_CACHE.get(STATS_CACHE_KEY, { type: 'json' });

  if (cached) {
    return new Response(JSON.stringify(cached), { headers: corsHeaders });
  }

  const accessToken = await getAccessToken(env);

  // Fetch athlete stats
  const response = await fetch(
    `${STRAVA_API_BASE}/athletes/${env.ATHLETE_ID}/stats`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status}`);
  }

  const stats = await response.json();

  // Count current KOMs/QOMs (segment efforts where the athlete holds the crown).
  // Strava's stats endpoint doesn't include this, so fetch the koms list and count.
  let komsCount = 0;
  try {
    const komsResp = await fetch(
      `${STRAVA_API_BASE}/athletes/${env.ATHLETE_ID}/koms?per_page=200`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (komsResp.ok) {
      const komsList = await komsResp.json();
      komsCount = Array.isArray(komsList) ? komsList.length : 0;
    }
  } catch (e) {
    komsCount = 0;
  }

  // Transform to only what we need
  const transformed = {
    koms_count: komsCount,
    ytd_ride: {
      count: stats.ytd_ride_totals?.count || 0,
      distance_miles: Math.round((stats.ytd_ride_totals?.distance || 0) / 1609.34),
      elevation_feet: Math.round((stats.ytd_ride_totals?.elevation_gain || 0) * 3.28084),
      moving_time_hours: Math.round((stats.ytd_ride_totals?.moving_time || 0) / 3600),
    },
    all_ride: {
      count: stats.all_ride_totals?.count || 0,
      distance_miles: Math.round((stats.all_ride_totals?.distance || 0) / 1609.34),
      elevation_feet: Math.round((stats.all_ride_totals?.elevation_gain || 0) * 3.28084),
      moving_time_hours: Math.round((stats.all_ride_totals?.moving_time || 0) / 3600),
    },
    updated_at: new Date().toISOString(),
  };

  // Cache for 30 minutes
  await env.STRAVA_CACHE.put(STATS_CACHE_KEY, JSON.stringify(transformed), {
    expirationTtl: 1800,
  });

  return new Response(JSON.stringify(transformed), { headers: corsHeaders });
}

/**
 * Get athlete's KOMs
 */
async function handleKOMs(env, corsHeaders) {
  const cacheKey = 'strava_koms';
  const cached = await env.STRAVA_CACHE.get(cacheKey, { type: 'json' });

  if (cached) {
    return new Response(JSON.stringify(cached), { headers: corsHeaders });
  }

  const accessToken = await getAccessToken(env);

  // Fetch KOMs (segment efforts where athlete is KOM holder)
  const response = await fetch(
    `${STRAVA_API_BASE}/athletes/${env.ATHLETE_ID}/koms?per_page=5`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status}`);
  }

  const koms = await response.json();

  // Transform to display-friendly data
  const transformed = koms.map((effort) => {
    const minutes = Math.floor(effort.elapsed_time / 60);
    const seconds = effort.elapsed_time % 60;
    const timeStr = minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : `${seconds}s`;

    const distanceMeters = effort.segment?.distance || effort.distance || 0;
    const distanceMiles = distanceMeters / 1609.34;

    const speedMph = effort.elapsed_time > 0
      ? distanceMiles / (effort.elapsed_time / 3600)
      : 0;

    return {
      segment_name: effort.segment?.name || effort.name,
      time: timeStr,
      elapsed_time: effort.elapsed_time,
      distance: distanceMiles >= 0.1
        ? `${(distanceMiles).toFixed(2)} mi`
        : `${Math.round(distanceMeters)} m`,
      speed: speedMph > 0 ? `${speedMph.toFixed(1)} mph` : null,
      average_grade: effort.segment?.average_grade != null
        ? `${effort.segment.average_grade.toFixed(1)}%`
        : null,
      average_watts: effort.average_watts || null,
      date: effort.start_date_local?.split('T')[0] || null,
      city: effort.segment?.city || null,
      state: effort.segment?.state || null,
    };
  });

  // Cache for 30 minutes to match the /stats cadence, so the KOM count
  // (served by /stats) and this Recent KOMs list refresh together.
  await env.STRAVA_CACHE.put(cacheKey, JSON.stringify(transformed), {
    expirationTtl: 1800,
  });

  return new Response(JSON.stringify(transformed), { headers: corsHeaders });
}

/**
 * Get recent activities
 */
async function handleActivities(env, corsHeaders) {
  const cacheKey = 'strava_recent_activities';
  const cached = await env.STRAVA_CACHE.get(cacheKey, { type: 'json' });

  if (cached) {
    return new Response(JSON.stringify(cached), { headers: corsHeaders });
  }

  const accessToken = await getAccessToken(env);

  // Fetch last 5 activities
  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?per_page=5`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status}`);
  }

  const activities = await response.json();

  // Transform to only public-safe data
  const transformed = activities.map((a) => ({
    name: a.name,
    type: a.type,
    distance_miles: Math.round((a.distance / 1609.34) * 10) / 10,
    elevation_feet: Math.round(a.total_elevation_gain * 3.28084),
    moving_time_minutes: Math.round(a.moving_time / 60),
    date: a.start_date_local.split('T')[0],
    average_speed_mph: Math.round((a.average_speed * 2.237) * 10) / 10,
  }));

  // Cache for 15 minutes
  await env.STRAVA_CACHE.put(cacheKey, JSON.stringify(transformed), {
    expirationTtl: 900,
  });

  return new Response(JSON.stringify(transformed), { headers: corsHeaders });
}
