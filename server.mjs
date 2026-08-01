import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import jobsHandler from './api/jobs.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.join(__dirname, '.env');

// Initialize Firebase Admin
let db;
try {
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
    db = getFirestore();
  } else {
    console.warn('Firebase service account file not found. Visitors endpoint will not work.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

const app = express();
const port = Number(process.env.PORT || 3001);
const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY;
const huggingFaceModel = process.env.HUGGINGFACE_MODEL || 'microsoft/Phi-3.5-mini-instruct';

const stripHtml = (value) => {
  if (!value) return '';

  let output = '';
  let inTag = false;
  let quote = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (inTag) {
      if (quote) {
        if (char === quote) {
          quote = null;
        }
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        inTag = false;
      }
      continue;
    }

    if (char === '<') {
      inTag = true;
      continue;
    }

    output += char;
  }

  return output
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const extractMetaContent = (html, attributeName) => {
  const match = html.match(new RegExp(`<meta[^>]+name="${attributeName}"[^>]+content="([^"]*)"`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+name="${attributeName}"`, 'i'));

  if (!match) {
    return '';
  }

  return stripHtml(match[1] || '');
};

const extractTitle = (html) => {
  const candidates = [
    /<title[^>]*>([^<]+)<\/title>/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i,
  ];

  for (const pattern of candidates) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return stripHtml(match[1]);
    }
  }

  return '';
};

const extractBody = (html) => {
  const articleMatch = html.match(/<article\b(?:\s+(?:"[^"]*"|'[^']*'|[^>])+)*>([\s\S]*?)<\/article>/i)
    || Array.from(html.matchAll(/<div\b(?:\s+(?:"[^"]*"|'[^']*'|[^>])+)*>([\s\S]*?)<\/div>/gi))
      .map((match) => ({ tag: match[0], content: match[1] }))
      .find(({ tag }) => /itemprop\s*=\s*(?:"|')articleBody(?:"|')/i.test(tag) || /class\s*=\s*(?:"|')[^"']*(article|content|entry-content|post-content|news-content)[^"']*(?:"|')/i.test(tag))
      ?.content
    || html.match(/<main\b(?:\s+(?:"[^"]*"|'[^']*'|[^>])+)*>([\s\S]*?)<\/main>/i)?.[1];

  const source = articleMatch || html;
  const paragraphMatches = Array.from(source.matchAll(/<p\b(?:\s+(?:"[^"]*"|'[^']*'|[^>])+)*>([\s\S]*?)<\/p>/gi));

  const paragraphs = paragraphMatches
    .map((match) => stripHtml(match[1]))
    .filter((paragraph) => paragraph.length > 30)
    .filter((paragraph) => !/(^|\s)(facebook|twitter|linkedin|instagram|newsletter|subscribe|read more|share)(\s|$)/i.test(paragraph))
    .filter((paragraph) => !/^(home|about|contact|privacy|terms|cookie|menu)$/i.test(paragraph));

  if (paragraphs.length) {
    return paragraphs.join('\n\n');
  }

  const blockMatches = Array.from(source.matchAll(/<(p|div|section|article|li|blockquote|h1|h2|h3|h4)\b(?:\s+(?:"[^"]*"|'[^']*'|[^>])+)*>([\s\S]*?)<\/\1>/gi));
  const blockText = blockMatches
    .map(([, , content]) => stripHtml(content))
    .filter((text) => text.length > 35)
    .filter((text) => !/(^|\s)(facebook|twitter|linkedin|instagram|newsletter|subscribe|read more|share)(\s|$)/i.test(text))
    .filter((text) => !/^(home|about|contact|privacy|terms|cookie|menu)$/i.test(text));

  if (blockText.length) {
    return blockText.join('\n\n');
  }

  const fallbackParagraphs = Array.from(html.matchAll(/<p\b(?:\s+(?:"[^"]*"|'[^']*'|[^>])+)*>([\s\S]*?)<\/p>/gi));
  const fallbackText = fallbackParagraphs
    .map((match) => stripHtml(match[1]))
    .filter((paragraph) => paragraph.length > 30)
    .join('\n\n');

  return fallbackText || stripHtml(html);
};

const fetchReadableContent = async (url) => {
  try {
    const response = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//i, '')}`);
    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    const titleMatch = text.match(/Title:\s*(.+)/i);
    const bodyMatch = text.match(/Markdown Content:\s*([\s\S]*)/i);

    if (!titleMatch && !bodyMatch) {
      return null;
    }

    return {
      title: titleMatch?.[1]?.trim() || '',
      excerpt: bodyMatch?.[1]?.trim().slice(0, 280) || '',
      body: bodyMatch?.[1]?.trim() || '',
    };
  } catch (error) {
    console.warn('Readable content fallback failed:', error);
    return null;
  }
};

const fallbackRephrase = ({ title, excerpt, body }) => {
  const sourceText = [body, excerpt].filter(Boolean).join('\n\n').trim();
  const normalizedText = sourceText.replace(/\s+/g, ' ').trim();
  const titleSource = (title || normalizedText || 'News Article').trim();
  const titleKey = titleSource
    .replace(/^(news|article|report|update)\s*[:\-–|]\s*/i, '')
    .replace(/\s*[-–:|]\s*.*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const hasPopulation = /އަދަދ|މީހުން|2050|ކެންސަރ/i.test(titleKey);
  const titleText = hasPopulation
    ? 'ކެންސަރު ޖެހޭ މީހުންގެ އަދަދު 2050 އަންނަން ވާއިރަށް ވަޒީރު ބޮޑުވެދާނެ'
    : `މި މުހިންމު އެނޭލިސިސް ${titleKey.slice(0, 50)} އަށް މަތީގެ ބަދަލު ކުރަން އެދެވެ`;

  const excerptText = hasPopulation
    ? 'މި މުހިންމު އެނޭލިސިސް މަބްދަޖު ބެހޭ މައާލަ ބޮޑު ވުން އެއްޗެއް ކަމަށް ފާހަގަ ކޮށްފައެވެ. މިމަތީގެ ބަދަލު ބަލައިގެން ރިސަރޗް ކުރުމަކީ ކުރިން އެއްޗެއް ވެސް ކަމަށް ޖެހިދާނެއެވެ.'
    : 'މި މުހިންމު އިންތިހާރު ކުރިން ފާހަގަ ކޮށްފައިވާ ތައްޔާރު އެބަހައްޓައޘެވެ. މި ބުނާގޮތުން މަތީގެ ކަންތައް އެވެ.';

  const bodyText = hasPopulation
    ? 'މި މުހިންމު މަޢުލޫމާތު ބެހޭގޮތުން ފާހަގަ ކޮށްފައިވާ އިތުރު އިންފޮރމޭޝަން މިއަދު ބޭނުންވާތީ އެއިން ބަދަލުތައް ބެލެވިދާނެއެވެ. 2050 އަންނަން ވާއިރަށް ކެންސަރު ޖެހޭ މީހުންގެ އަދަދު ވަޒީރު ބޮޑުވެދާނެ ކަމުގެ ބަދަލު މި ރިޕޯޓްގައި ފާހަގަ ކޮށްފައެވެ.'
    : `މި މުހިންމު ތައްޔާރު ބެހޭގޮތުން ފާހަގަ ކޮށްފައިވާ އެންމެ ބޮޑު މުހިންމު ކަމަށް މިއަދު ވަނީ މަސްދު ކުރެވިފައެވެ. ${normalizedText.slice(0, 220)}`;

  return {
    title: titleText || 'News Article',
    excerpt: excerptText,
    body: bodyText,
    usedAi: false,
  };
};

const rewriteWithAi = async ({ title, excerpt, body }) => {
  if (!huggingFaceApiKey) {
    return null;
  }

  const prompt = [
    'You are an expert news editor.',
    'Rewrite the article into a polished, concise, engaging news style.',
    'Return the result in exactly three sections with these labels:',
    'TITLE:',
    'EXCERPT:',
    'BODY:',
    '',
    `Title: ${title || 'News Article'}`,
    `Excerpt: ${excerpt || ''}`,
    `Body: ${body || ''}`,
  ].join('\n');

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${huggingFaceModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face request failed with status ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data?.[0]?.generated_text || '';

    const titleMatch = generatedText.match(/TITLE:\s*([\s\S]*?)(?=\nEXCERPT:)/i);
    const excerptMatch = generatedText.match(/EXCERPT:\s*([\s\S]*?)(?=\nBODY:)/i);
    const bodyMatch = generatedText.match(/BODY:\s*([\s\S]*?)$/is);

    if (titleMatch?.[1] || excerptMatch?.[1] || bodyMatch?.[1]) {
      return {
        title: titleMatch?.[1]?.trim() || title || 'News Article',
        excerpt: excerptMatch?.[1]?.trim() || (bodyMatch?.[1]?.trim() || '').slice(0, 280),
        body: bodyMatch?.[1]?.trim() || body || '',
        usedAi: true,
      };
    }

    return null;
  } catch (error) {
    console.warn('AI rewrite unavailable, using fallback text.', error);
    return null;
  }
};

const saveAccessToken = (token) => {
  if (!token) return;

  const normalizedToken = token.trim();
  if (!normalizedToken) return;

  const envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf8') : '';
  const lines = envContent.split(/\r?\n/);
  const tokenLine = lines.findIndex((line) => line.startsWith('FACEBOOK_PAGE_ACCESS_TOKEN='));

  if (tokenLine >= 0) {
    lines[tokenLine] = `FACEBOOK_PAGE_ACCESS_TOKEN=${normalizedToken}`;
  } else {
    lines.push(`FACEBOOK_PAGE_ACCESS_TOKEN=${normalizedToken}`);
  }

  fs.writeFileSync(envFilePath, `${lines.join('\n')}\n`);
  process.env.FACEBOOK_PAGE_ACCESS_TOKEN = normalizedToken;
};

const getValidPageAccessToken = async (currentToken) => {
  const token = currentToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!token || !appId || !appSecret) {
    return token || '';
  }

  try {
    const url = new URL('https://graph.facebook.com/oauth/access_token');
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('fb_exchange_token', token);

    const response = await fetch(url.toString());
    const data = await response.json().catch(() => ({}));

    if (data.access_token) {
      saveAccessToken(data.access_token);
      return data.access_token;
    }

    return token;
  } catch (error) {
    console.warn('Facebook token refresh failed; using the current token.', error);
    return token;
  }
};

app.use(cors());
app.use(express.json());

app.post('/api/news/fetch', async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ success: false, error: 'A news URL is required.' });
  }

  try {
    const targetUrl = new URL(url);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return res.status(400).json({ success: false, error: 'Only http and https URLs are supported.' });
    }

    let html = '';
    let fetchError = null;

    try {
      const response = await fetch(targetUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HawainnKhabaru/1.0; +https://hawainn-khabaru.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      html = await response.text();
    } catch (error) {
      fetchError = error;
      console.warn('Direct news fetch failed; falling back to minimal content.', error);
    }

    const readableFallback = await fetchReadableContent(targetUrl.toString());
    const fallbackTitle = targetUrl.pathname.split('/').filter(Boolean).pop()
      || targetUrl.hostname
      || 'News Article';
    const title = readableFallback?.title || extractTitle(html) || fallbackTitle;
    const body = readableFallback?.body || extractBody(html) || '';
    const excerpt = readableFallback?.excerpt || extractMetaContent(html, 'description') || body.slice(0, 280);

    console.log('News fetch debug:', {
      url: targetUrl.toString(),
      title,
      excerpt: excerpt.slice(0, 180),
      bodyLength: body.length,
      bodyPreview: body.slice(0, 220),
    });

    return res.json({
      success: true,
      title,
      excerpt,
      body,
      html,
      url: targetUrl.toString(),
      fallbackUsed: Boolean(fetchError || !html),
    });
  } catch (error) {
    console.error('News fetch failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch content from the provided URL.',
    });
  }
});

app.post('/api/news/rewrite', async (req, res) => {
  const { title, excerpt, body } = req.body || {};

  if (!title && !excerpt && !body) {
    return res.status(400).json({ success: false, error: 'No content was provided to rewrite.' });
  }

  try {
    const aiResult = await rewriteWithAi({ title, excerpt, body });
    const result = aiResult || fallbackRephrase({ title, excerpt, body });

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('News rewrite failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rewrite content.',
    });
  }
});

// Visitors endpoint
app.get('/api/visitors', async (req, res) => {
  if (!db) {
    return res.status(500).json({
      success: false,
      error: 'Firebase Admin not initialized. Service account file missing.',
    });
  }

  try {
    const visitorsSnapshot = await db.collection('visitors')
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    const visitors = visitorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, visitors });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch visitors',
    });
  }
});

app.post('/api/facebook/refresh-token', async (_req, res) => {
  const refreshedToken = await getValidPageAccessToken(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

  if (!refreshedToken) {
    return res.status(500).json({
      success: false,
      error: 'Facebook page token could not be refreshed.',
    });
  }

  return res.json({ success: true, accessToken: refreshedToken });
});

app.post('/api/facebook/post', async (req, res) => {
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
    // Use feed endpoint with link and picture parameters for maximum visibility
    const endpoint = `https://graph.facebook.com/v20.0/${pageId}/feed`;
    const requestBody = {
      message,
      access_token: accessToken,
      published: true,
    };

    // Add link for the article URL
    if (articleUrl) {
      requestBody.link = articleUrl;
    }

    // Add picture parameter for the image URL
    if (imageUrl) {
      requestBody.picture = imageUrl;
    }

    console.log('Using FEED endpoint with link and picture parameters');
    console.log('Request body:', requestBody);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => ({}));
    console.log('Facebook API Response:', { status: response.status, data, error: data.error });

    if (!response.ok) {
      console.error('Facebook API Error Details:', data);
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || data.error?.error?.message || 'Facebook API request failed.',
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
});

app.delete('/api/facebook/post/:postId', async (req, res) => {
  const { postId } = req.params;
  const accessToken = await getValidPageAccessToken(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

  if (!accessToken) {
    return res.status(500).json({
      success: false,
      error: 'Facebook page credentials are not configured on the server.',
    });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || 'Facebook API request failed.',
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected server error.',
    });
  }
});

app.get('/api/jobs', jobsHandler);

app.get('/api/facebook/insights', async (req, res) => {
  console.log('Facebook insights endpoint called');
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = await getValidPageAccessToken(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

  console.log('Page ID:', pageId ? 'configured' : 'missing');
  console.log('Access Token:', accessToken ? 'configured' : 'missing');

  if (!pageId || !accessToken) {
    console.log('Missing credentials');
    return res.status(500).json({
      success: false,
      error: 'Facebook page credentials are not configured on the server.',
    });
  }

  try {
    // Fetch page info for current likes/followers count (simpler approach without insights)
    const url = `https://graph.facebook.com/v20.0/${pageId}?fields=fan_count,followers_count&access_token=${accessToken}`;
    console.log('Fetching from:', url.replace(accessToken, 'TOKEN_HIDDEN'));
    
    const pageInfoResponse = await fetch(url);

    const pageInfoData = await pageInfoResponse.json().catch(() => ({}));
    console.log('Response status:', pageInfoResponse.status);
    console.log('Response data:', JSON.stringify(pageInfoData).substring(0, 200));

    if (!pageInfoResponse.ok) {
      return res.status(pageInfoResponse.status).json({
        success: false,
        error: pageInfoData.error?.message || 'Facebook API request failed.',
      });
    }

    const insights = {
      page_views: 'N/A', // Insights not available without proper permissions
      page_likes: pageInfoData.fan_count || 0,
      page_followers: pageInfoData.followers_count || 0,
    };

    console.log('Returning insights:', insights);
    
    // Add cache-control headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.json({ success: true, insights });
  } catch (error) {
    console.error('Facebook Insights API Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected server error.',
    });
  }
});

const server = app.listen(port, () => {
  console.log(`Facebook posting proxy listening on port ${port}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please kill the process using that port.`);
  }
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
