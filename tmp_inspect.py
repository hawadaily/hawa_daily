import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto('https://jobcenter.mv/en/jobs', wait_until='domcontentloaded', timeout=60000)
        await page.wait_for_timeout(8000)
        print('TITLE:', await page.title())
        body = await page.locator('body').inner_text()
        print(body[:5000])
        print('---HTML SNIPPET---')
        html = await page.locator('body').inner_html()
        print(html[:4000])
        await browser.close()

asyncio.run(main())
