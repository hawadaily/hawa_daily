const handleCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

export default async function handler(req, res) {
  handleCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://www.job-maldives.com/');
    const html = await response.text();

    // Parse job listings from the HTML
    const jobs = [];
    const jobRegex = /<h3 class="post-title entry-title">\s*<a href="([^"]+)">([^<]+)<\/a>\s*<\/h3>/g;
    let match;

    while ((match = jobRegex.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].trim();
      
      // Extract company name from title if possible
      const companyMatch = title.match(/at\s+(.+?)\s*$/i);
      const company = companyMatch ? companyMatch[1].trim() : 'Unknown';

      // Extract posted date from the HTML near the job title
      const dateMatch = html.substring(match.index, match.index + 500).match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
      const postedTime = dateMatch ? dateMatch[1] : '';

      jobs.push({
        id: url.split('/').pop()?.replace('.html', '') || Math.random().toString(36).substr(2, 9),
        title,
        company,
        url: `https://www.job-maldives.com${url}`,
        postedTime,
        source: 'job-maldives.com',
        fetchedAt: new Date().toISOString()
      });
    }

    return res.status(200).json({ 
      success: true, 
      jobs,
      count: jobs.length 
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
    return res.status(500).json({ error: message });
  }
}
