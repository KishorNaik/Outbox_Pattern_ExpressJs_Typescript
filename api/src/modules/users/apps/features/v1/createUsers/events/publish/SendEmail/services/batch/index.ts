import {
	executeBatchArrayAsync,
	IServiceHandlerVoidAsync,
	RequestReplyProducerBullMq,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	tryCatchResultAsync,
	VOID_RESULT,
	VoidResult,
} from '@kishornaik/utils';
import { PublishWelcomeUserEmailEventService } from '../sendEmailEvent';
import { OutboxEntity, UpdateOutboxDbService,QueryRunner } from '@kishornaik/db';
import { logger } from '@/shared/utils/helpers/loggers';

export interface IOutboxBatchParameters {
	outboxList: OutboxEntity[];
	services: {
    publishEventService: PublishWelcomeUserEmailEventService;
    updateOutboxDbService: UpdateOutboxDbService;
  }
	producer: RequestReplyProducerBullMq;
  queryRunner: QueryRunner;
}

export interface IOutboxBatchService extends IServiceHandlerVoidAsync<IOutboxBatchParameters> {}

@sealed
@Service()
export class OutboxBatchService implements IOutboxBatchService {
	public handleAsync(params: IOutboxBatchParameters): Promise<Result<VoidResult, ResultError>> {
		return tryCatchResultAsync(async () => {

			const { outboxList, services, producer,queryRunner } = params;
      const { publishEventService, updateOutboxDbService } = services;

			const results = await executeBatchArrayAsync({
				items: outboxList,
				handler: async (outbox) => {

          var result = await publishEventService.handleAsync({
            producer:producer,
            outbox:outbox,
            updateOutboxDbService:updateOutboxDbService,
            queryRunner: queryRunner
          });
          if(result.isErr()){
            logger.error(`Batch:Failed to send email to ${outbox.identifier}, error: ${result.error.message}`);
          }
          else
          {
            logger.info(`Batch:Email sent to ${outbox.identifier}`);
          }
          return result;
          //return ResultFactory.success(VOID_RESULT);
        },
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
