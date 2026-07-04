import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const ogDir = path.join(publicDir, "og");

const logoDark = path.join(publicDir, "logo-mark.png");
const logoLight = path.join(publicDir, "logo-mark-white.png");
const businessImage = path.join(publicDir, "busimg.png");
const creatorImage = path.join(publicDir, "creatorimg.png");
const campaignImage = path.join(publicDir, "campaign-spring-skincare.png");

const W = 1200;
const H = 630;

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function imageDataUri(file) {
  const data = await fs.readFile(file);
  return `data:image/png;base64,${data.toString("base64")}`;
}

function pngToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const directorySize = 16 * count;
  const header = Buffer.alloc(headerSize + directorySize);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = headerSize + directorySize;
  pngBuffers.forEach(({ size, data }, index) => {
    const entryOffset = headerSize + index * 16;
    header.writeUInt8(size === 256 ? 0 : size, entryOffset);
    header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(data.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += data.length;
  });

  return Buffer.concat([header, ...pngBuffers.map(({ data }) => data)]);
}

async function transparentLogo(size) {
  return sharp(logoDark)
    .resize(size, size, { fit: "contain" })
    .png()
    .toBuffer();
}

async function appIcon(size, output, theme = "dark") {
  const markSize = Math.round(size * 0.62);
  const mark = await sharp(theme === "dark" ? logoLight : logoDark)
    .resize(markSize, markSize, { fit: "contain" })
    .png()
    .toBuffer();
  const bg =
    theme === "dark"
      ? `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g" cx="50%" cy="42%" r="70%">
              <stop offset="0%" stop-color="#D946EF"/>
              <stop offset="58%" stop-color="#0F172A"/>
              <stop offset="100%" stop-color="#020617"/>
            </radialGradient>
          </defs>
          <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#g)"/>
        </svg>`
      : `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FAF5FF"/>
              <stop offset="52%" stop-color="#FDF2F8"/>
              <stop offset="100%" stop-color="#EAECED"/>
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#g)"/>
        </svg>`;

  await sharp(Buffer.from(bg))
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(output);
}

function logoLockup(markUri, color = "#FFFFFF") {
  return `
    <image href="${markUri}" x="70" y="58" width="54" height="54"/>
    <text x="140" y="96" fill="${color}" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="34" font-weight="800">Scout</text>
  `;
}

function pill(x, y, text, fill, color = "#FFFFFF") {
  return `
    <rect x="${x}" y="${y}" width="${text.length * 11 + 42}" height="42" rx="21" fill="${fill}"/>
    <text x="${x + 21}" y="${y + 27}" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(text)}</text>
  `;
}

async function renderOg(filename, svg) {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(ogDir, filename));
}

async function ogMarketplace() {
  const mark = await imageDataUri(logoLight);
  const bus = await imageDataUri(businessImage);
  const creator = await imageDataUri(creatorImage);
  const svg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="45%" stop-color="#0F172A"/>
          <stop offset="100%" stop-color="#161628"/>
        </linearGradient>
        <radialGradient id="pink" cx="46%" cy="38%" r="58%">
          <stop offset="0%" stop-color="#D946EF" stop-opacity="0.62"/>
          <stop offset="100%" stop-color="#D946EF" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="cyan" cx="89%" cy="88%" r="46%">
          <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.44"/>
          <stop offset="100%" stop-color="#22D3EE" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="busClip"><rect x="750" y="82" width="300" height="205" rx="28"/></clipPath>
        <clipPath id="creatorClip"><rect x="833" y="312" width="250" height="236" rx="30"/></clipPath>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#000000" flood-opacity="0.38"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#pink)"/>
      <rect width="${W}" height="${H}" fill="url(#cyan)"/>
      <path d="M0 92H1200M0 188H1200M0 284H1200M0 380H1200M0 476H1200M0 572H1200M96 0V630M192 0V630M288 0V630M384 0V630M480 0V630M576 0V630M672 0V630M768 0V630M864 0V630M960 0V630M1056 0V630" stroke="#FFFFFF" stroke-opacity="0.045"/>
      ${logoLockup(mark)}
      <text x="70" y="238" fill="#FFFFFF" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="82" font-weight="800">Creators for</text>
      <text x="70" y="326" fill="#FFFFFF" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="82" font-weight="800">small brands.</text>
      <text x="74" y="390" fill="#FFFFFF" fill-opacity="0.74" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">Launch paid and in-kind collaborations</text>
      <text x="74" y="428" fill="#FFFFFF" fill-opacity="0.74" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">with micro-influencer creators.</text>
      ${pill(74, 480, "Local campaigns", "rgba(255,255,255,0.13)")}
      ${pill(286, 480, "Creator matches", "rgba(255,255,255,0.13)")}
      ${pill(492, 480, "Live chat", "rgba(255,255,255,0.13)")}
      <g filter="url(#shadow)">
        <rect x="720" y="54" width="360" height="264" rx="36" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.22)"/>
        <image href="${bus}" x="750" y="82" width="300" height="205" preserveAspectRatio="xMidYMid slice" clip-path="url(#busClip)"/>
        <rect x="804" y="284" width="310" height="294" rx="40" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.22)"/>
        <image href="${creator}" x="833" y="312" width="250" height="236" preserveAspectRatio="xMidYMid slice" clip-path="url(#creatorClip)"/>
      </g>
    </svg>`;
  await renderOg("scout-og-marketplace.png", svg);
}

async function ogWaitlist() {
  const mark = await imageDataUri(logoDark);
  const creator = await imageDataUri(creatorImage);
  const svg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FAF5FF"/>
          <stop offset="50%" stop-color="#FDF2F8"/>
          <stop offset="100%" stop-color="#EAECED"/>
        </linearGradient>
        <radialGradient id="pink" cx="48%" cy="38%" r="55%">
          <stop offset="0%" stop-color="#E879F9" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#E879F9" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="photoClip"><rect x="760" y="98" width="322" height="430" rx="42"/></clipPath>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="28" stdDeviation="24" flood-color="#000000" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#pink)"/>
      <path d="M0 96H1200M0 192H1200M0 288H1200M0 384H1200M0 480H1200M0 576H1200M96 0V630M192 0V630M288 0V630M384 0V630M480 0V630M576 0V630M672 0V630M768 0V630M864 0V630M960 0V630M1056 0V630" stroke="#000000" stroke-opacity="0.04"/>
      ${logoLockup(mark, "#000000")}
      <text x="72" y="248" fill="#000000" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="78" font-weight="800">Join the</text>
      <text x="72" y="332" fill="#000000" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="78" font-weight="800">Scout waitlist.</text>
      <text x="76" y="396" fill="#000000" fill-opacity="0.64" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">Early access for creators and</text>
      <text x="76" y="434" fill="#000000" fill-opacity="0.64" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">small businesses.</text>
      ${pill(76, 486, "For creators", "rgba(0,0,0,0.08)", "#000000")}
      ${pill(246, 486, "For businesses", "rgba(0,0,0,0.08)", "#000000")}
      <g filter="url(#shadow)">
        <rect x="732" y="72" width="378" height="486" rx="50" fill="rgba(255,255,255,0.52)" stroke="rgba(255,255,255,0.7)"/>
        <image href="${creator}" x="760" y="98" width="322" height="430" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>
      </g>
    </svg>`;
  await renderOg("scout-og-waitlist.png", svg);
}

async function ogDiscover() {
  const mark = await imageDataUri(logoLight);
  const campaign = await imageDataUri(campaignImage);
  const svg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07070E"/>
          <stop offset="55%" stop-color="#0F0F1A"/>
          <stop offset="100%" stop-color="#161628"/>
        </linearGradient>
        <radialGradient id="pink" cx="42%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#D946EF" stop-opacity="0.52"/>
          <stop offset="100%" stop-color="#D946EF" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="teal" cx="88%" cy="80%" r="45%">
          <stop offset="0%" stop-color="#2DD4BF" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#2DD4BF" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="campaignClip"><rect x="730" y="238" width="336" height="178" rx="28"/></clipPath>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="26" stdDeviation="23" flood-color="#000000" flood-opacity="0.42"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#pink)"/>
      <rect width="${W}" height="${H}" fill="url(#teal)"/>
      ${logoLockup(mark)}
      <text x="70" y="230" fill="#FFFFFF" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="76" font-weight="800">Discover live</text>
      <text x="70" y="314" fill="#FFFFFF" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="76" font-weight="800">campaigns.</text>
      <text x="74" y="378" fill="#FFFFFF" fill-opacity="0.74" font-family="Inter, Arial, sans-serif" font-size="29" font-weight="500">Browse live briefs from small businesses</text>
      <text x="74" y="414" fill="#FFFFFF" fill-opacity="0.74" font-family="Inter, Arial, sans-serif" font-size="29" font-weight="500">ready to partner with creators.</text>
      ${pill(74, 450, "Paid", "rgba(255,255,255,0.13)")}
      ${pill(178, 450, "Product", "rgba(255,255,255,0.13)")}
      ${pill(318, 450, "Affiliate", "rgba(255,255,255,0.13)")}
      <g filter="url(#shadow)">
        <rect x="690" y="126" width="420" height="382" rx="42" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)"/>
        <rect x="730" y="238" width="336" height="178" rx="28" fill="rgba(255,255,255,0.18)"/>
        <image href="${campaign}" x="730" y="238" width="336" height="178" preserveAspectRatio="xMidYMid slice" clip-path="url(#campaignClip)"/>
        <text x="732" y="194" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">Spring Skincare Drop</text>
        <text x="734" y="224" fill="#FFFFFF" fill-opacity="0.68" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Short-form Video + Story</text>
        <rect x="730" y="442" width="154" height="40" rx="20" fill="rgba(255,255,255,0.13)"/>
        <text x="752" y="468" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="700">5 days left</text>
        <rect x="896" y="442" width="170" height="40" rx="20" fill="rgba(255,255,255,0.13)"/>
        <text x="918" y="468" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="700">Creators needed</text>
      </g>
    </svg>`;
  await renderOg("scout-og-discover.png", svg);
}

async function main() {
  await fs.mkdir(ogDir, { recursive: true });

  await sharp(await transparentLogo(16)).toFile(path.join(publicDir, "favicon-16x16.png"));
  await sharp(await transparentLogo(32)).toFile(path.join(publicDir, "favicon-32x32.png"));
  await appIcon(180, path.join(publicDir, "apple-touch-icon.png"), "light");
  await appIcon(192, path.join(publicDir, "android-chrome-192x192.png"), "dark");
  await appIcon(512, path.join(publicDir, "android-chrome-512x512.png"), "dark");
  await appIcon(150, path.join(publicDir, "mstile-150x150.png"), "dark");

  const faviconBuffers = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      data: await transparentLogo(size),
    })),
  );
  await fs.writeFile(path.join(publicDir, "favicon.ico"), pngToIco(faviconBuffers));

  await ogMarketplace();
  await ogWaitlist();
  await ogDiscover();

  const defaultOg = await fs.readFile(path.join(ogDir, "scout-og-marketplace.png"));
  await fs.writeFile(path.join(publicDir, "opengraph-image.png"), defaultOg);
  await fs.writeFile(path.join(publicDir, "twitter-image.png"), defaultOg);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
