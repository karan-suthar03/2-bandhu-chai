import redis from 'redis';

const redisUsername = process.env.REDIS_USERNAME || '';
const redisPassword = process.env.REDIS_PASSWORD || '';
const redisHost = process.env.REDIS_HOST || 'localhost:6379';

let redisUrl = 'redis://';
if (redisUsername && redisPassword) {
  redisUrl += `${redisUsername}:${redisPassword}@${redisHost}`;
} else if (redisPassword) {
  redisUrl += `:${redisPassword}@${redisHost}`;
} else {
  redisUrl += redisHost;
}

const redisClient = redis.createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Could not connect to Redis:', err);
  }
})();

export default redisClient;
