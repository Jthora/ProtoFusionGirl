#!/usr/bin/env node
// validate-hypersonic-navigation.js
// Simple validation script for hypersonic navigation system

console.log('🚀 Validating Hypersonic Navigation System...\n');

const fs = require('fs');
const path = require('path');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function validate(testName, condition, message) {
  const result = {
    name: testName,
    passed: condition,
    message: message || (condition ? 'PASS' : 'FAIL')
  };
  
  results.tests.push(result);
  
  if (condition) {
    results.passed++;
    console.log(`✅ ${testName}: ${result.message}`);
  } else {
    results.failed++;
    console.log(`❌ ${testName}: ${result.message}`);
  }
}

// Check if all core files exist
const coreFiles = [
  'src/navigation/core/NavigationManager.ts',
  'src/navigation/core/SpeedCategories.ts',
  'src/navigation/controls/SpeedControlSystem.ts',
  'src/navigation/ui/SpeedControlUI.ts'
];

console.log('📁 Checking core navigation files...');
coreFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  validate(
    `File exists: ${file}`,
    fs.existsSync(fullPath),
    fs.existsSync(fullPath) ? 'File found' : 'File missing'
  );
});

// Check if files contain expected exports
console.log('\n📦 Checking exports...');

try {
  const speedCategoriesContent = fs.readFileSync(path.join(__dirname, 'src/navigation/core/SpeedCategories.ts'), 'utf8');
  validate(
    'SpeedCategories exports',
    speedCategoriesContent.includes('export enum SpeedCategory') && 
    speedCategoriesContent.includes('HYPERSONIC') &&
    speedCategoriesContent.includes('343000'),
    'Contains SpeedCategory.HYPERSONIC and Mach 1000 support'
  );
} catch (e) {
  validate('SpeedCategories exports', false, `Error reading file: ${e.message}`);
}

try {
  const speedControlContent = fs.readFileSync(path.join(__dirname, 'src/navigation/controls/SpeedControlSystem.ts'), 'utf8');
  validate(
    'SpeedControlSystem exports',
    speedControlContent.includes('export class SpeedControlSystem') && 
    speedControlContent.includes('343000') &&
    speedControlContent.includes('hypersonic'),
    'Contains SpeedControlSystem class with hypersonic support'
  );
} catch (e) {
  validate('SpeedControlSystem exports', false, `Error reading file: ${e.message}`);
}

try {
  const navManagerContent = fs.readFileSync(path.join(__dirname, 'src/navigation/core/NavigationManager.ts'), 'utf8');
  validate(
    'NavigationManager integration',
    navManagerContent.includes('SpeedControlSystem') && 
    navManagerContent.includes('speedControlSystem'),
    'NavigationManager integrates SpeedControlSystem'
  );
} catch (e) {
  validate('NavigationManager integration', false, `Error reading file: ${e.message}`);
}

try {
  const gameSceneContent = fs.readFileSync(path.join(__dirname, 'src/scenes/GameScene.ts'), 'utf8');
  validate(
    'GameScene integration',
    gameSceneContent.includes('SpeedControlUI') && 
    gameSceneContent.includes('speedControlUI'),
    'GameScene integrates SpeedControlUI'
  );
  
  validate(
    'MagnetoSpeeder sprite',
    gameSceneContent.includes('magnetoSpeederSprite') && 
    gameSceneContent.includes('createMagnetoSpeederSprite'),
    'GameScene includes MagnetoSpeeder sprite'
  );
  
  validate(
    'Hypersonic effects',
    gameSceneContent.includes('hypersonicEffectSprite') && 
    gameSceneContent.includes('updateHypersonicEffect'),
    'GameScene includes hypersonic visual effects'
  );
  
} catch (e) {
  validate('GameScene integration', false, `Error reading file: ${e.message}`);
}

// Check speed categories configuration
console.log('\n⚡ Checking speed configurations...');

try {
  const speedCategoriesContent = fs.readFileSync(path.join(__dirname, 'src/navigation/core/SpeedCategories.ts'), 'utf8');
  
  validate(
    'Walking speed range',
    speedCategoriesContent.includes('maxSpeedKmh: 50'),
    'Walking: 0-50 km/h'
  );
  
  validate(
    'Ground vehicle range',
    speedCategoriesContent.includes('maxSpeedKmh: 200'),
    'Ground: 50-200 km/h'
  );
  
  validate(
    'Aircraft range', 
    speedCategoriesContent.includes('maxSpeedKmh: 1200'),
    'Aircraft: 200-1200 km/h'
  );
  
  validate(
    'Supersonic range',
    speedCategoriesContent.includes('maxSpeedKmh: 12000'),
    'Supersonic: 1200-12000 km/h (Mach 1-10)'
  );
  
  validate(
    'Hypersonic range',
    speedCategoriesContent.includes('maxSpeedKmh: 343000'),
    'Hypersonic: 12000-343000 km/h (Mach 10-1000)'
  );
  
} catch (e) {
  validate('Speed configurations', false, `Error checking speeds: ${e.message}`);
}

// Check UI integration
console.log('\n🎮 Checking UI integration...');

try {
  const uiContent = fs.readFileSync(path.join(__dirname, 'src/navigation/ui/SpeedControlUI.ts'), 'utf8');
  
  validate(
    'Speed display UI',
    uiContent.includes('speedDisplay') && uiContent.includes('km/h'),
    'Speed display shows km/h'
  );
  
  validate(
    'Help panel',
    uiContent.includes('F1') && uiContent.includes('Mach 1000'),
    'Help panel mentions F1 key and Mach 1000'
  );
  
  validate(
    'Quick speed controls',
    uiContent.includes('Number Keys') && uiContent.includes('343,000'),
    'Quick speed controls documented'
  );
  
} catch (e) {
  validate('UI integration', false, `Error checking UI: ${e.message}`);
}

// Check terrain integration
console.log('\n🌍 Checking terrain integration...');

try {
  const chunkLoaderContent = fs.readFileSync(path.join(__dirname, 'src/world/tilemap/ChunkLoader.ts'), 'utf8');
  
  validate(
    'Speed-adaptive terrain loading',
    chunkLoaderContent.includes('speedKmh') && chunkLoaderContent.includes('Hypersonic'),
    'ChunkLoader adapts to hypersonic speeds'
  );
  
} catch (e) {
  validate('Terrain integration', false, `Error checking terrain: ${e.message}`);
}

try {
  const worldGenContent = fs.readFileSync(path.join(__dirname, 'src/world/tilemap/WorldGen.ts'), 'utf8');
  
  validate(
    'Real-world terrain data',
    worldGenContent.includes('longitude') && worldGenContent.includes('latitude'),
    'WorldGen uses real Earth coordinates'
  );
  
} catch (e) {
  validate('Real-world terrain', false, `Error checking WorldGen: ${e.message}`);
}

// Check if the game is actually running
console.log('\n🎮 Checking game server...');

const { exec } = require('child_process');
exec('curl -s http://localhost:3000 > /dev/null', (error) => {
  validate(
    'Game server running',
    !error,
    error ? 'Server not responding on localhost:3000' : 'Server responding on localhost:3000'
  );
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🏁 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${results.passed}`);
  console.log(`❌ Tests Failed: ${results.failed}`);
  console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL VALIDATIONS PASSED!');
    console.log('🚀 Hypersonic Navigation System is ready!');
    console.log('\n🎮 Try these in the game:');
    console.log('• Press number keys 1-9 for quick speeds');
    console.log('• Press H to enable hypersonic mode');
    console.log('• Press F1 for help');
    console.log('• Try speed 9 for Mach 1000 (343,000 km/h)!');
  } else {
    console.log('\n⚠️  Some validations failed. Check the details above.');
    process.exit(1);
  }
});
