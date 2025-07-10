import { bullMqRedisConnection, RequestReplyConsumerBullMq, WorkerBullMq } from '@kishornaik/utils';

const requestQueue = 'welcome-user-email-queue';
const consumer = new RequestReplyConsumerBullMq(bullMqRedisConnection);

export const welcomeUserEmailSubscribeIntegrationEvent: WorkerBullMq = async () => {};
