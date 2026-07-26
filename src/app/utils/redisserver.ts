import Redis from 'ioredis';
import config from '../config';

const redisClient = new Redis(config.redis.url as string);

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redisClient;
