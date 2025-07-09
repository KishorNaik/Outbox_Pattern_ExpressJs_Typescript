import { CreateUserEndpoint, sendEmailEventCronJob } from './apps/features/v1/createUsers';
import { WorkerCronJob } from '@kishornaik/utils';

export const userModule: Function[] = [CreateUserEndpoint];
export const userCronJobModule: WorkerCronJob[] = [sendEmailEventCronJob];
