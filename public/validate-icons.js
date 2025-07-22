// Icon validation script for ProtoFusionGirl
// Run this in browser console to verify icon setup

console.log('🎮 ProtoFusionGirl Icon Validation');
console.log('==================================');

// Check favicon elements
const favicon = document.querySelector('link[rel="icon"]');
const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
const manifest = document.querySelector('link[rel="manifest"]');

console.log('✅ Favicon:', favicon ? favicon.getAttribute('href') : '❌ Not found');
console.log('✅ Apple Touch Icon:', appleTouchIcon ? appleTouchIcon.getAttribute('href') : '❌ Not found');
console.log('✅ Manifest:', manifest ? manifest.getAttribute('href') : '❌ Not found');

// Check meta tags
const themeColor = document.querySelector('meta[name="theme-color"]');
const appName = document.querySelector('meta[name="application-name"]');

console.log('✅ Theme Color:', themeColor ? themeColor.getAttribute('content') : '❌ Not found');
console.log('✅ App Name:', appName ? appName.getAttribute('content') : '❌ Not found');

// Check title
console.log('✅ Page Title:', document.title);

// Test icon loading
const testIcon = new Image();
testIcon.onload = () => console.log('✅ FusionGirl icon loads successfully');
testIcon.onerror = () => console.log('❌ FusionGirl icon failed to load');
testIcon.src = '/favicon-512.png';

console.log('🔍 Icon validation complete!');
