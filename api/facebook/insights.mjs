// Token cache to avoid refreshing on every request
let tokenCache = {
  token: null,
  timestamp: 0,
  ttl: 3600000, // 1 hour in milliseconds
};

// Helper to get or refresh Facebook access token (with caching)
const getValidPageAccessToken = async (currentToken) => {
  const token = currentToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!token || !appId || !appSecret) {
    return token || '';
  }

  // Check cache first - only refresh if cache expired
  const now = Date.now();
  if (tokenCache.token && (now - tokenCache.timestamp) < tokenCache.ttl) {
    return tokenCache.token;
  }

  try {
    const url = new URL('https://graph.facebook.com/oauth/access_token');
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('fb_exchange_token', token);

    const response = await fetch(url.toString());
    const data = await response.json().catch(() => ({}));

    const refreshedToken = data.access_token || token;
    
    // Update cache
    tokenCache.token = refreshedToken;
    tokenCache.timestamp = now;
    
    return refreshedToken;
  } catch (error) {
    console.warn('Facebook token refresh failed; using the current token.', error);
    return token;
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = await getValidPageAccessToken(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

  if (!pageId || !accessToken) {
    return res.status(500).json({
      success: false,
      error: 'Facebook page credentials are not configured on the server.',
    });
  }

  try {
    // Fetch page insights for page views, likes, and followers
    const metrics = 'page_views,page_fan_adds,page_fan_removes,page_fans';
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${pageId}/insights?metric=${metrics}&period=day&access_token=${accessToken}`
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || 'Facebook API request failed.',
      });
    }

    // Also fetch page info for current likes/followers count
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v20.0/${pageId}?fields=fan_count,followers_count&access_token=${accessToken}`
    );

    const pageInfoData = await pageInfoResponse.json().catch(() => ({}));

    const insights = {
      page_views: data.data?.find((m) => m.name === 'page_views')?.values[0]?.value || 0,
      page_likes: pageInfoData.fan_count || 0,
      page_followers: pageInfoData.followers_count || 0,
    };

    return res.json({ success: true, insights });
  } catch (error) {
    console.error('Facebook Insights API Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected server error.',
    });
  }
}
