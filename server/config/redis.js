const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => {
  console.error('Redis error: ', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.connect().then(() => {
  console.log('Redis client connected');
});

module.exports = client;
