import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { emailWorker } from './worker';

@Module({})
export class QueueModule implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    // Setup worker event listeners
    emailWorker.on('completed', (job) => {
      console.log(`✅ Email sent - Job ${job.id}`);
    });

    emailWorker.on('failed', (job, err) => {
      console.error(`❌ Email failed - Job ${job?.id}: ${err?.message}`);
    });

    console.log('📧 Email worker started');
  }

  async onModuleDestroy() {
    await emailWorker.close();
  }
}
