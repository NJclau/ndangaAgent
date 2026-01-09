import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export class InstagramScraper {
  private credentials: any;

  constructor(credentials: any) {
    this.credentials = credentials;
  }

  async scrapeHashtag(tag: string): Promise<any[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();

      // Set cookies from credentials
      await page.setCookie(...this.credentials.cookies);

      // Navigate to hashtag page
      const url = `https://www.instagram.com/explore/tags/${tag}/`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Extract posts (simplified - actual implementation more complex)
      const posts = await page.evaluate(() => {
        const articles = document.querySelectorAll('article');
        return Array.from(articles).slice(0, 20).map(article => {
          // Extract post data from DOM
          return {
            id: Math.random().toString(36), // Placeholder
            text: article.textContent?.slice(0, 500) || '',
            author: 'username', // Extract from DOM
            timestamp: new Date().toISOString(),
            url: window.location.href
          };
        });
      });

      return posts;

    } finally {
      await browser.close();
    }
  }
}