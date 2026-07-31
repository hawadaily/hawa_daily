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
    const jinaResponse = await fetch('https://r.jina.ai/http://www.job-maldives.com/');
    
    if (!jinaResponse.ok) {
      throw new Error(`Jina.ai request failed with status ${jinaResponse.status}`);
    }

    const markdown = await jinaResponse.text();
    const jobs = [];
    
    const jobRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/\d{4}\/\d{2}\/[^)]+)\)/gi;
    let match;

    while ((match = jobRegex.exec(markdown)) !== null) {
      const title = match[1].trim();
      let url = match[2];
      
      const companyMatch = title.match(/at\s+(.+?)\s*(?:Job|Vacancy|Jul|Jan|Feb|Mar|Apr|May|Jun|Aug|Sep|Oct|Nov|Dec|$)/i);
      const company = companyMatch ? companyMatch[1].trim() : 'Unknown';
      
      const dateMatch = title.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})/i);
      let postedDate = '';
      if (dateMatch) {
        const monthNames = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 
                           'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
        const month = monthNames[dateMatch[1]] || '01';
        const day = dateMatch[2].padStart(2, '0');
        const year = dateMatch[3];
        const dateString = `${year}-${month}-${day}`;
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj.getTime())) {
          postedDate = dateObj.toISOString();
        }
      }
      
      if (!postedDate) {
        const urlDateMatch = url.match(/\/(\d{4})\/(\d{2})\//);
        if (urlDateMatch) {
          const year = urlDateMatch[1];
          const month = urlDateMatch[2];
          const dateString = `${year}-${month}-01`;
          const dateObj = new Date(dateString);
          if (!isNaN(dateObj.getTime())) {
            postedDate = dateObj.toISOString();
          }
        }
      }
      
      const cleanTitle = title.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i, '').trim();
      
      jobs.push({
        id: url.split('/').pop()?.replace('.html', '') || Math.random().toString(36).substr(2, 9),
        title: cleanTitle,
        company,
        url: url.startsWith('http') ? url : `https://www.job-maldives.com${url}`,
        postedTime: postedDate,
        postedDate: postedDate,
        source: 'job-maldives.com',
        fetchedAt: new Date().toISOString()
      });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({ 
      success: true, 
      jobs,
      count: jobs.length 
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
    return res.status(500).json({ 
      success: false,
      error: message 
    });
  }
}
