import {
	Enumerable,
	err,
	executeBatchArrayAsync,
	IServiceHandlerVoidAsync,
	RequestReplyProducerBullMq,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	tryCatchResultAsync,
	tryCatchSagaAsync,
	VOID_RESULT,
	VoidResult,
} from '@kishornaik/utils';
import { PublishWelcomeUserEmailEventService } from '../sendEmailEvent';
import { OutboxEntity } from '@kishornaik/db';
import { logger } from '@/shared/utils/helpers/loggers';

export interface IOutboxBatchParameters {
	outboxList: OutboxEntity[];
	service: PublishWelcomeUserEmailEventService;
	producer: RequestReplyProducerBullMq;
}

export interface IOutboxBatchService extends IServiceHandlerVoidAsync<IOutboxBatchParameters> {}

@sealed
@Service()
export class OutboxBatchService implements IOutboxBatchService {
	public handleAsync(params: IOutboxBatchParameters): Promise<Result<VoidResult, ResultError>> {
		return tryCatchResultAsync(async () => {
			/*
      const taskPromises:Promise<Result<VoidResult, ResultError>[]>[]=[];
      let batchSize:number=3;

      const {outboxList,service, producer}=params;

      const numberOfBatches:number=Math.ceil(outboxList.length / batchSize);

      for (let i = 0; i < numberOfBatches; i++) {
        const tempBoxList=Enumerable.from(outboxList).skip(i*batchSize).take(batchSize).toArray();
        const tasks=tempBoxList.map(x => service.handleAsync({
            outbox:x,
            producer:producer
          })
        );

        taskPromises.push(Promise.all(tasks));

      }

      (await Promise.all(taskPromises)).flat();

      return ResultFactory.success(VOID_RESULT);
      */
			const { outboxList, service, producer } = params;
			const results = await executeBatchArrayAsync({
				items: outboxList,
				handler: (outbox) => service.handleAsync({ outbox: outbox, producer: producer }),
				batchSize: 3,
				concurrency: 3, // Optional throttle
				runMode: 'parallel',
			});

			if (results.error.length >= 1) {
				logger.error(`Failed to send emails to ${results.error.length} users`);
				for (const error of results.error) {
					if (error.isErr()) {
						logger.error(`batch error: ${error.error.message}`);
					}
				}
			}

			return ResultFactory.success(VOID_RESULT);
		});
	}
}
