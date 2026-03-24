import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

export type ClipJob = {
  channel: string;
  clipId: string;
  score: number;
};

export class QueueManager {
  private queue?: Queue<ClipJob>;

  constructor(redisUrl?: string) {
    if (redisUrl) {
      const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
      this.queue = new Queue<ClipJob>("clip-analysis", { connection });

      new Worker<ClipJob>(
        "clip-analysis",
        async (job: { data: ClipJob }) => {
          console.log(`[worker] processando clip ${job.data.clipId} (${job.data.channel}) score=${job.data.score}`);
        },
        { connection }
      );
    }
  }

  get enabled(): boolean {
    return Boolean(this.queue);
  }

  async enqueueClipAnalysis(job: ClipJob): Promise<void> {
    if (!this.queue) {
      console.log(`[queue:fallback] clip ${job.clipId} do canal ${job.channel} sem Redis configurado.`);
      return;
    }

    await this.queue.add("analyze-clip", job, {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: 50
    });
  }
}
