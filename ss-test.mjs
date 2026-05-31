const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Mobile (375px)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("http://localhost:3000");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Code/itender/ss-mobile.png", fullPage: false });

  // Tablet (768px)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Code/itender/ss-tablet.png", fullPage: false });

  // Desktop (1280px)
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.reload();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Code/itender/ss-desktop.png", fullPage: false });

  await browser.close();
  console.log("Screenshots done");
})();
