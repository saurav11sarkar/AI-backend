import { Worker } from 'bullmq';
import sendResendMailer from '../resendMailer';
import { bullmqConnection } from './bullmq.connection';

export const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { to, subject, html } = job.data;

    if (!to || !subject || !html) {
      throw new Error('Missing email fields: to, subject, or html');
    }

    await sendResendMailer(to, subject, html);
    return { success: true, to };
  },
  {
    connection: bullmqConnection,
  },
);
