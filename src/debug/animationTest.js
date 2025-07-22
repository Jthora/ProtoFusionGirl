// Animation Debug Test
// This file can be run in the browser console to test animations

function testPlayerAnimations() {
  console.log('🧪 Testing Player Animations...');
  
  // Get the current game scene
  const game = window.game || window.phaserGame;
  if (!game) {
    console.error('❌ Game not found!');
    return;
  }
  
  const gameScene = game.scene.getScene('GameScene');
  if (!gameScene) {
    console.error('❌ GameScene not found!');
    return;
  }
  
  // Get the player sprite
  const playerManager = gameScene.playerManager;
  if (!playerManager) {
    console.error('❌ PlayerManager not found!');
    return;
  }
  
  const janeSprite = playerManager.getJaneSprite();
  if (!janeSprite) {
    console.error('❌ Jane sprite not found!');
    return;
  }
  
  console.log('✅ Found Jane sprite:', janeSprite);
  
  // Test each animation
  const animations = ['idle', 'run', 'jump', 'fall'];
  let currentAnimIndex = 0;
  
  function playNextAnimation() {
    if (currentAnimIndex >= animations.length) {
      console.log('🎉 All animations tested!');
      // Return to idle
      janeSprite.play('idle', true);
      return;
    }
    
    const animName = animations[currentAnimIndex];
    console.log(`🎬 Testing animation: ${animName}`);
    
    if (gameScene.anims.exists(animName)) {
      janeSprite.play(animName, true);
      console.log(`✅ Playing ${animName}`);
    } else {
      console.error(`❌ Animation ${animName} does not exist!`);
    }
    
    currentAnimIndex++;
    setTimeout(playNextAnimation, 2000); // Wait 2 seconds between animations
  }
  
  playNextAnimation();
}

// Make function available globally
window.testPlayerAnimations = testPlayerAnimations;

console.log('🎮 Animation test loaded! Run testPlayerAnimations() in console to test.');
