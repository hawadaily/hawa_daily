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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, excerpt, imageUrl, articleUrl } = req.body || {};
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = await getValidPageAccessToken(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

  console.log('Facebook Post Request:', { title, excerpt, imageUrl, articleUrl, pageId, hasToken: !!accessToken });

  if (!pageId || !accessToken) {
    return res.status(500).json({
      success: false,
      error: 'Facebook page credentials are not configured on the server.',
    });
  }

  const message = [title, excerpt].filter(Boolean).join('\n\n').trim();

  try {
    let endpoint = `https://graph.facebook.com/v20.0/${pageId}/feed`;
    let requestBody = {
      message,
      access_token: accessToken,
    };

    const messageWithLink = articleUrl ? `${message}\n\nRead more: ${articleUrl}` : message;

    if (imageUrl) {
      endpoint = `https://graph.facebook.com/v20.0/${pageId}/photos`;
      requestBody = {
        url: imageUrl,
        caption: messageWithLink,
        access_token: accessToken,
      };
    } else if (articleUrl) {
      requestBody = {
        message: messageWithLink,
        access_token: accessToken,
        link: articleUrl,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => ({}));
    console.log('Facebook API Response:', { status: response.status, data });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || 'Facebook API request failed.',
      });
    }

    return res.json({
      success: true,
      postId: data.id,
      facebookUrl: `https://facebook.com/${data.id}`,
    });
  } catch (error) {
    console.error('Facebook API Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected server error.',
    });
  }
}
