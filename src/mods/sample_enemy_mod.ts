// Sample Enemy Mod Data
// Converted from JSON to TypeScript for better Vite compatibility

export const sampleEnemyMod = {
  "id": "sample_enemy_mod",
  "name": "Sample Enemy Mod",
  "enemies": [
    {
      "id": "slime",
      "name": "Green Slime",
      "sprite": "slime.png",
      "maxHealth": 20,
      "attack": 3,
      "damage": 5,
      "defense": 0,
      "speed": 40,
      "aiType": "patrol",
      "drops": [
        { "itemId": "gel", "chance": 0.5, "min": 1, "max": 2 }
      ]
    }
  ],
  "attacks": [
    {
      "id": "slime_bounce",
      "name": "Slime Bounce",
      "type": "melee",
      "damage": 3,
      "range": 20,
      "cooldown": 1.5
    }
  ]
} as const;

export default sampleEnemyMod;
