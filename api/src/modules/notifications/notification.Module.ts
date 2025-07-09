import { WorkerBullMq } from "@kishornaik/utils";
import { welcomeUserEmailSubscribeIntegrationEvent } from "./apps/features/v1/welcomeEmail";


export const notificationModule: Function[] = [];
export const notificationBullMqModule:WorkerBullMq[] = [welcomeUserEmailSubscribeIntegrationEvent];
