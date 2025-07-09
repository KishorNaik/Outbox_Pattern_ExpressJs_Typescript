import { mergeRouters } from '@/config/trpc';
import { userCronJobModule, userModule } from './users/users.Module';
import { notificationBullMqModule, notificationModule } from './notifications/notification.Module';
import {
	WorkerBullMq,
	WorkerCronJob,
	WorkerKafka,
	WorkerPusher,
	WorkerRabbitMq,
} from '@kishornaik/utils';

// REST API
const restApiModulesFederation: Function[] = [...userModule, ...notificationModule];

// TRPC
const trpcModulesFederation = mergeRouters();
type TRPCAppRouter = typeof trpcModulesFederation;

// Workers
const cronJobWorkerModules: WorkerCronJob[] = [...userCronJobModule];
const bullMqWorkerModules: WorkerBullMq[] = [...notificationBullMqModule];
const pusherWorkerModules: WorkerPusher[] = [];
const rabbitMqWorkerModules: WorkerRabbitMq[] = [];
const kafkaWorkerModules: WorkerKafka[] = [];

export {
	restApiModulesFederation,
	trpcModulesFederation,
	TRPCAppRouter,
	cronJobWorkerModules,
	bullMqWorkerModules,
	pusherWorkerModules,
	rabbitMqWorkerModules,
	kafkaWorkerModules,
};
