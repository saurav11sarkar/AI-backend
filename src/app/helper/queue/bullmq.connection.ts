import IORedis, { RedisOptions } from 'ioredis';
import config from '../../config';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const bullmqConnection = new IORedis(
  config.redis.url as string,
  redisOptions,
);

bullmqConnection.on('connect', () => {
  console.log('[BullMQ] Redis connection established');
});

bullmqConnection.on('error', (err) => {
  console.error('[BullMQ] Redis connection error:', err);
});
