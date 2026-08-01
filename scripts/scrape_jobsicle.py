import asyncio
import json
from playwright.async_api import async_playwright

async def scrape_jobsicle():
    """Scrape jobs from jobsicle.mv using Playwright with correct selectors"""
    url = "https://jobsicle.mv/"
    
    async with async_playwright() as p:
        # Launch browser in headless mode
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            # Navigate to the URL
            await page.goto(url, wait_until="networkidle")
            
            # Wait for page to load
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(3000)
            
            # Extract job data using JavaScript to avoid CSS selector issues
            jobs = await page.evaluate("""
                () => {
                    const jobs = [];
                    
                    // Find all buttons that contain job information
                    const allButtons = document.querySelectorAll('button');
                    
                    allButtons.forEach(button => {
                        const text = button.innerText;
                        
                        // Check if this button contains job-related content
                        if (!text || text.length < 20) return;
                        if (!text.includes('Full-time') && !text.includes('Part-time') && !text.includes('ago')) return;
                        
                        // Find the job title and company using better parsing
                        const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
                        let title = '';
                        let company = 'Unknown';
                        
                        // Job title keywords to help identify titles
                        const jobKeywords = ['Manager', 'Officer', 'Executive', 'Assistant', 'Representative', 
                                           'Specialist', 'Coordinator', 'Director', 'Admin', 'Sales', 'Marketing',
                                           'Human', 'Resource', 'HR', 'Customer', 'Service', 'Accounting', 'Revenue'];
                        
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            
                            // Skip location and salary info
                            if (line.includes('Male') || line.includes('Hulhumale') || 
                                line.includes('MVR') || line.includes('Not Stated') ||
                                line.includes('Full-time') || line.includes('Part-time') ||
                                line.includes('ago')) continue;
                            
                            // Check if this line looks like a job title
                            const hasJobKeyword = jobKeywords.some(keyword => 
                                line.toLowerCase().includes(keyword.toLowerCase())
                            );
                            
                            // Title is usually the first line with job keywords or a long line
                            if (!title && (hasJobKeyword || line.length > 20)) {
                                title = line;
                            }
                            // Company name is usually shorter and appears after title
                            else if (title && company === 'Unknown' && line.length > 5 && line.length < 60) {
                                // Don't set company if it looks like a job title
                                if (!hasJobKeyword) {
                                    company = line;
                                }
                            }
                        }
                        
                        if (!title || title.length < 5) return;
                        
                        jobs.push({
                            title: title,
                            company: company,
                            url: '', // Jobsicle uses JavaScript navigation
                            postedDate: '',
                            source: 'jobsicle.mv'
                        });
                    });
                    
                    return jobs;
                }
            """)
            
            # Remove duplicates based on title since URLs are empty
            seen_titles = set()
            unique_jobs = []
            for job in jobs:
                if job['title'] not in seen_titles:
                    seen_titles.add(job['title'])
                    unique_jobs.append(job)
            
            return unique_jobs
            
        except Exception as e:
            print(f"Error scraping jobsicle.mv: {e}")
            return []
        finally:
            await browser.close()

if __name__ == "__main__":
    jobs = asyncio.run(scrape_jobsicle())
    print(json.dumps({"success": True, "jobs": jobs, "count": len(jobs)}))
