import { mergeRouters } from '@/config/trpc';
import { restApiDemoModule } from './restApiDemo/restApiDemo.Module';
import { trpcDemoModule } from './trpcDemo/trpcDemo.Module';

// REST API
const restApiModulesFederation: Function[] = [...restApiDemoModule];

// TRPC
const trpcModulesFederation = mergeRouters(trpcDemoModule);
type TRPCAppRouter = typeof trpcModulesFederation;

export { restApiModulesFederation, trpcModulesFederation, TRPCAppRouter };
