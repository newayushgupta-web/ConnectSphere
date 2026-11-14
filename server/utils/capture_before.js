const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/neway/.gemini/antigravity/brain/0b2a52ff-9f4f-4163-b4b1-98c3c7253446');
const SHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots_before');

if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Desktop viewport
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Login Desktop
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_desktop.png') });
  console.log('Saved login_desktop.png');

  // 2. Login Mobile
  await page.setViewport({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_mobile.png') });
  console.log('Saved login_mobile.png');

  // 3. Register Desktop
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'register_desktop.png') });
  console.log('Saved register_desktop.png');

  // Login as alex_tech
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  // Click demo button or fill
  const demoBtn = await page.$('button[type="button"]');
  if (demoBtn) {
    await demoBtn.click();
    await new Promise(r => setTimeout(r, 300));
  } else {
    await page.type('input[type="text"]', 'alex_tech');
    await page.type('input[type="password"]', 'password123');
  }
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  // 4. Feed Desktop
  await page.screenshot({ path: path.join(SHOTS_DIR, 'feed_desktop.png') });
  console.log('Saved feed_desktop.png');

  // 5. Feed Mobile
  await page.setViewport({ width: 375, height: 667 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'feed_mobile.png') });
  console.log('Saved feed_mobile.png');

  // 6. Profile Desktop
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/profile/alex_tech', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'profile_desktop.png') });
  console.log('Saved profile_desktop.png');

  await browser.close();
  console.log('All before screenshots captured successfully!');
}

run().catch(console.error);
