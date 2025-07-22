// debug-cache.js
const cache = new Map();

// Test Map behavior
cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);
console.log('Size after adding 3 unique keys:', cache.size);

cache.set('a', 4); // Replace existing key
console.log('Size after replacing existing key:', cache.size);

cache.set('d', 5); // Add new key
console.log('Size after adding new key:', cache.size);
