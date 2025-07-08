import { mergeRouters } from '@/config/trpc';
import { userModule } from './users/users.Module';
import { notificationModule } from './notifications/notification.Module';

// REST API
const restApiModulesFederation: Function[] = [...userModule,...notificationModule];

// TRPC
const trpcModulesFederation = mergeRouters();
type TRPCAppRouter = typeof trpcModulesFederation;

export { restApiModulesFederation, trpcModulesFederation, TRPCAppRouter };
