import asyncio
import json
import sys
from playwright.async_api import async_playwright

async def scrape_jobcenter():
    """Scrape jobs from jobcenter.mv using Playwright"""
    url = "https://jobcenter.mv/en/jobs"
    
    async with async_playwright() as p:
        # Launch browser in headless mode
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            # Navigate to the URL
            await page.goto(url, wait_until="networkidle")
            
            # Wait for job cards to load
            await page.wait_for_selector("a[href*='/en/jobs/']", timeout=10000)
            
            # Extract job data
            jobs = await page.evaluate("""
                () => {
                    const jobs = [];
                    const links = document.querySelectorAll('a[href*="/en/jobs/"]');
                    
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        const title = link.innerText.trim();
                        
                        // Skip if it's an employer link or apply button
                        if (!href || href.includes('/employers/') || title === 'Apply Now' || title === '') {
                            return;
                        }
                        
                        // Find the parent card to get company info
                        const card = link.closest('.card, .job-card, [class*="card"]');
                        if (!card) return;
                        
                        // Extract company from employer link
                        const employerLink = card.querySelector('a[href*="/en/employers/"]');
                        const company = employerLink ? employerLink.innerText.trim() : 'Unknown';
                        
                        // Extract posting time
                        const timeText = card.innerText;
                        const timeMatch = timeText.match(/(\\d+)\\s+(day|days|week|weeks|hour|hours)\\s+ago/i);
                        let postedDate = '';
                        if (timeMatch) {
                            const value = parseInt(timeMatch[1]);
                            const unit = timeMatch[2].toLowerCase();
                            const date = new Date();
                            
                            if (unit.includes('day')) {
                                date.setDate(date.getDate() - value);
                            } else if (unit.includes('week')) {
                                date.setDate(date.getDate() - (value * 7));
                            } else if (unit.includes('hour')) {
                                date.setHours(date.getHours() - value);
                            }
                            
                            postedDate = date.toISOString();
                        }
                        
                        jobs.push({
                            title: title.replace(/\\s*-\\s*JobCenter\\.MV/i, '').trim(),
                            url: href.startsWith('http') ? href : `https://jobcenter.mv${href}`,
                            company: company,
                            postedDate: postedDate,
                            source: 'jobcenter.mv'
                        });
                    });
                    
                    return jobs;
                }
            """)
            
            # Remove duplicates based on URL
            seen_urls = set()
            unique_jobs = []
            for job in jobs:
                if job['url'] not in seen_urls:
                    seen_urls.add(job['url'])
                    unique_jobs.append(job)
            
            return unique_jobs
            
        except Exception as e:
            print(f"Error scraping jobcenter.mv: {e}", file=sys.stderr)
            return []
        finally:
            await browser.close()

if __name__ == "__main__":
    jobs = asyncio.run(scrape_jobcenter())
    print(json.dumps({"success": True, "jobs": jobs, "count": len(jobs)}))
