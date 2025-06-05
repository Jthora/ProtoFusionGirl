import './style.css'
import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import { StartScene } from './scenes/StartScene';
import { showWeb3Demo } from "./web3Demo";

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) appDiv.innerHTML = '';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 500 },
      debug: true, // Enable for development
    },
  },
  scene: [StartScene, GameScene],
  backgroundColor: '#222',
};

new Phaser.Game(config);
showWeb3Demo();
