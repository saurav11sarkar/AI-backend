import { Queue } from 'bullmq';
import { bullmqConnection } from './bullmq.connection';

export const emailQueue = new Queue('emailQueue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  },
});
