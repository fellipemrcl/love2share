import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

// Create an SVG for the main favicon (heart + share theme)
const mainFaviconSVG = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ee5a24;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="16" cy="16" r="15" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
  
  <!-- Heart shape -->
  <path d="M16 26c-0.5 0-1-0.2-1.4-0.6L9.8 20.6C7.6 18.4 7.6 14.8 9.8 12.6c2.2-2.2 5.8-2.2 8 0l0.2 0.2 0.2-0.2c2.2-2.2 5.8-2.2 8 0 2.2 2.2 2.2 5.8 0 8L21.4 25.4C21 25.8 20.5 26 16 26z" fill="url(#heartGradient)"/>
  
  <!-- Share arrows -->
  <g transform="translate(22, 8) scale(0.6)">
    <path d="M12 2L8 6h3v6h2V6h3l-4-4z" fill="#4a90e2"/>
    <path d="M2 12L6 8v3h6v2H6v3l-4-4z" fill="#4a90e2"/>
  </g>
</svg>
`;

// Create an SVG for the admin favicon (shield + admin theme)
const adminFaviconSVG = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6c5ce7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5f3dc4;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="16" cy="16" r="15" fill="#2d3748" stroke="#4a5568" stroke-width="1"/>
  
  <!-- Shield shape -->
  <path d="M16 4L10 7v6c0 6 6 11 6 11s6-5 6-11V7l-6-3z" fill="url(#shieldGradient)" stroke="#ffffff" stroke-width="0.5"/>
  
  <!-- Crown/Admin symbol -->
  <g transform="translate(12, 9) scale(0.8)">
    <path d="M2 8h8l-1-3-1.5 1.5L6 5l-1.5 1.5L3 5l-1 3z" fill="#ffd700"/>
    <rect x="2" y="8" width="8" height="2" fill="#ffd700"/>
  </g>
  
  <!-- "A" for Admin -->
  <text x="16" y="22" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" font-weight="bold">A</text>
</svg>
`;

async function generateFavicons() {
  try {
    console.log('Generating favicons...');
    
    const appDir = path.join(process.cwd(), 'src', 'app');
    const adminDir = path.join(appDir, 'admin');
    
    // Ensure directories exist
    await fs.mkdir(adminDir, { recursive: true });
    
    // Generate main favicon files
    console.log('Creating main favicon files...');
    const mainSvgBuffer = Buffer.from(mainFaviconSVG);
    
    // Generate main icon.svg
    console.log('Creating main icon.svg...');
    await fs.writeFile(path.join(appDir, 'icon.svg'), mainFaviconSVG);
    
    // Generate admin favicon files
    console.log('Creating admin favicon files...');
    const adminSvgBuffer = Buffer.from(adminFaviconSVG);
    
    // Generate admin icon.svg
    console.log('Creating admin icon.svg...');
    await fs.writeFile(path.join(adminDir, 'icon.svg'), adminFaviconSVG);
    
    // Generate apple-touch-icon for main site
    console.log('Creating apple-touch-icon.png...');
    await sharp(mainSvgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(appDir, 'apple-touch-icon.png'));
    
    // Generate apple-touch-icon for admin
    console.log('Creating admin apple-touch-icon.png...');
    await sharp(adminSvgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(adminDir, 'apple-touch-icon.png'));
    
    console.log('✅ All favicons generated successfully!');
    console.log('Generated files:');
    console.log('  - src/app/icon.svg');
    console.log('  - src/app/apple-touch-icon.png');
    console.log('  - src/app/admin/icon.svg');
    console.log('  - src/app/admin/apple-touch-icon.png');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
