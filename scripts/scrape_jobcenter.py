import argparse
import asyncio
import json
import re
import sys
from datetime import datetime, timedelta
from playwright.async_api import async_playwright

BASE_URL = "https://jobcenter.mv/en/jobs"
DEFAULT_PAGES = 8
DEFAULT_LIMIT = 100


def normalize_job_url(href: str) -> str:
    if not href:
        return ""
    if href.startswith(("http://", "https://")):
        return href
    if href.startswith("/"):
        return f"https://jobcenter.mv{href}"
    return f"https://jobcenter.mv/{href}"


def parse_relative_time(text: str) -> str:
    if not text:
        return ""

    match = re.search(r"(\d+)\s+(second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months)\s+ago", text, re.I)
    if not match:
        return ""

    value = int(match.group(1))
    unit = match.group(2).lower()

    if unit.startswith("second"):
        delta = timedelta(seconds=value)
    elif unit.startswith("minute"):
        delta = timedelta(minutes=value)
    elif unit.startswith("hour"):
        delta = timedelta(hours=value)
    elif unit.startswith("day"):
        delta = timedelta(days=value)
    elif unit.startswith("week"):
        delta = timedelta(weeks=value)
    elif unit.startswith("month"):
        delta = timedelta(days=value * 30)
    else:
        return ""

    return (datetime.utcnow() - delta).replace(microsecond=0).isoformat() + "Z"


async def extract_jobs_from_page(page):
    return await page.evaluate(
        """
        () => {
            const jobs = [];
            const seen = new Set();
            const links = Array.from(document.querySelectorAll('a[href*="/en/jobs/"]'));

            links.forEach((link) => {
                const href = link.getAttribute('href') || '';
                const title = (link.textContent || '').trim().replace(/\\s+/g, ' ');

                if (!href || !href.includes('/en/jobs/') || href.includes('/employers/') || href.includes('/jobs?') || href.includes('/jobs#')) {
                    return;
                }

                if (!title || title === 'Apply Now' || title === 'View more' || seen.has(href)) {
                    return;
                }

                seen.add(href);

                const card = link.closest('div, li, article, section');
                const cardText = (card ? card.textContent : '') || '';
                const compactText = cardText.replace(/\\s+/g, ' ').trim();

                let company = 'Unknown';
                const employerLink = card ? card.querySelector('a[href*="/en/employers/"]') : null;
                if (employerLink) {
                    company = (employerLink.textContent || '').replace(/\\s+/g, ' ').trim() || 'Unknown';
                } else if (compactText) {
                    const parts = compactText.split(' ');
                    const meaningful = parts.filter((part) => part && part.length > 2 && !/(Apply Now|Vacancy|Vacancies|MVR|Male|days|day|week|weeks|ago|left|New|Active|Expired|^\\d+$)/i.test(part));
                    if (meaningful.length) {
                        company = meaningful[0];
                    }
                }

                jobs.push({
                    title: title.replace(/JobCenter\\.MV/ig, '').trim(),
                    href,
                    company,
                    timeText: compactText
                });
            });

            return jobs;
        }
        """
    )


async def scrape_jobcenter(max_pages=DEFAULT_PAGES, limit=DEFAULT_LIMIT):
    """Scrape the latest job listings from JobCenter across multiple pages."""
    async with async_playwright() as p:
        browser = None
        try:
            browser = await p.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])
            page = await browser.new_page()

            all_jobs = []
            seen_urls = set()

            for page_number in range(1, max_pages + 1):
                url = BASE_URL if page_number == 1 else f"{BASE_URL}?page={page_number}"

                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=90000)
                    await page.wait_for_timeout(2000)
                    await page.wait_for_selector("a[href*='/en/jobs/']", timeout=20000)
                    jobs = await extract_jobs_from_page(page)

                    for job in jobs:
                        normalized_url = normalize_job_url(job.get('href', ''))
                        if not normalized_url or normalized_url in seen_urls:
                            continue

                        seen_urls.add(normalized_url)
                        all_jobs.append({
                            "title": job.get('title', '').strip(),
                            "url": normalized_url,
                            "company": job.get('company', 'Unknown').strip() or 'Unknown',
                            "postedDate": parse_relative_time(job.get('timeText', '')),
                            "source": "jobcenter.mv"
                        })
                except Exception as exc:
                    print(f"Warning: could not scrape page {page_number}: {exc}", file=sys.stderr)
                    continue

            all_jobs.sort(key=lambda job: job.get("postedDate", ""), reverse=True)
            return all_jobs[:limit]
        except Exception as exc:
            print(f"Error scraping jobcenter.mv: {exc}", file=sys.stderr)
            return []
        finally:
            if browser is not None:
                try:
                    await browser.close()
                except Exception:
                    pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape the latest job listings from JobCenter")
    parser.add_argument("--pages", type=int, default=DEFAULT_PAGES, help="How many pages to scrape")
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT, help="How many jobs to return")
    args = parser.parse_args()

    jobs = asyncio.run(scrape_jobcenter(max_pages=args.pages, limit=args.limit))
    print(json.dumps({"success": True, "jobs": jobs, "count": len(jobs)}))
