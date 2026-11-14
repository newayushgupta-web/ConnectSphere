const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/neway/.gemini/antigravity/brain/0b2a52ff-9f4f-4163-b4b1-98c3c7253446');
const SHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots_after');

if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, theme);
  await new Promise(r => setTimeout(r, 200));
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log('Capturing Auth Pages...');

  // 1. LOGIN
  // Desktop Light & Dark
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_desktop_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_desktop_dark.png') });

  // Mobile Light & Dark
  await page.setViewport({ width: 375, height: 667 });
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_mobile_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_mobile_dark.png') });

  // 2. REGISTER
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'register_desktop_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'register_desktop_dark.png') });

  await page.setViewport({ width: 375, height: 667 });
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'register_mobile_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'register_mobile_dark.png') });

  // SIGN IN
  console.log('Signing in as alex_tech...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Click on alex_tech demo chip
  const demoButtons = await page.$$('button[type="button"]');
  let clicked = false;
  for (const btn of demoButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('alex_tech')) {
      await btn.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    await page.type('#identifier', 'alex_tech');
    await page.type('#password', 'password123');
  }

  await new Promise(r => setTimeout(r, 300));
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  // 3. FEED / HOME
  console.log('Capturing Home Feed...');
  await page.setViewport({ width: 1280, height: 800 });
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'feed_desktop_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'feed_desktop_dark.png') });

  await page.setViewport({ width: 375, height: 667 });
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'feed_mobile_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'feed_mobile_dark.png') });

  // 4. PROFILE
  console.log('Capturing Profile...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/profile/alex_tech', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'profile_desktop_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'profile_desktop_dark.png') });

  await page.setViewport({ width: 375, height: 667 });
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'profile_mobile_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'profile_mobile_dark.png') });

  // 5. SEARCH / EXPLORE
  console.log('Capturing Explore / Search...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'search_desktop_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'search_desktop_dark.png') });

  // 6. NOTIFICATIONS
  console.log('Capturing Notifications...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/notifications', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'notifications_desktop_light.png') });
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SHOTS_DIR, 'notifications_desktop_dark.png') });

  await browser.close();
  console.log('All after screenshots successfully captured!');
}

run().catch(console.error);
