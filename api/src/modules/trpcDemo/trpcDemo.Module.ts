import { router } from '@/config/trpc';
import { createDemo } from './apps/features/v1/create/procedure';
import { getDemo } from './apps/features/v1/get';

export const trpcDemoModule = router({
	v1_demo: {
		create: createDemo,
		get: getDemo,
	},
});
