import { logger } from '@/shared/utils/helpers/loggers';
import { GetOutboxDbService, getQueryRunner, UpdateOutboxDbService } from '@kishornaik/db';
import {
	WorkerCronJob,
	CronJob,
	RequestReplyProducerBullMq,
	bullMqRedisConnection,
	Container,
	sealed,
	Service,
	IServiceHandlerNoParamsVoid,
	Result,
	ResultError,
	VoidResult,
	tryCatchResultAsync,
	ResultFactory,
	VOID_RESULT,
	IServiceHandlerNoParamsVoidAsync,
	StatusCodes,
} from '@kishornaik/utils';
import { GetOutboxListService as OutboxListService } from './services/getOutBoxList';
import { PublishWelcomeUserEmailEventService } from './services/sendEmailEvent';
import { OutboxBatchService } from './services/batch';

// Define Queue
const requestQueue = 'welcome-user-email-queue';
const producer = new RequestReplyProducerBullMq(bullMqRedisConnection);
producer.setQueues(requestQueue).setQueueEvents();

// Define Outbox Db Service
Container.set<UpdateOutboxDbService>(UpdateOutboxDbService, new UpdateOutboxDbService());

export interface IWelcomeUserEmailPublishIntegrationEventService
	extends IServiceHandlerNoParamsVoidAsync {}

@sealed
@Service()
export class WelcomeUserEmailPublishIntegrationEventService
	implements IWelcomeUserEmailPublishIntegrationEventService
{
	private readonly _getOutboxListService: OutboxListService;
	private readonly _publishEmailEventService: PublishWelcomeUserEmailEventService;
	private readonly _outboxBatchService: OutboxBatchService;
	private readonly _updateOutboxDbService: UpdateOutboxDbService;

	public constructor() {
		this._getOutboxListService = Container.get(OutboxListService);
		this._publishEmailEventService = Container.get(PublishWelcomeUserEmailEventService);
		this._outboxBatchService = Container.get(OutboxBatchService);
		this._updateOutboxDbService = Container.get(UpdateOutboxDbService);
	}

	public async handleAsync(): Promise<Result<VoidResult, ResultError>> {
		const queryRunner = getQueryRunner();
		await queryRunner.connect();
		try {
			await queryRunner.startTransaction();

			// Get Outbox List
			const outboxListResult = await this._getOutboxListService.handleAsync({
				eventType: 'UserEmailSendEvent',
				queryRunner: queryRunner,
			});

			if (outboxListResult.isErr()) {
				if (outboxListResult.error.statusCode !== StatusCodes.NOT_FOUND) {
					await queryRunner.rollbackTransaction();
					return ResultFactory.error(
						outboxListResult.error.statusCode,
						outboxListResult.error.message
					);
				}
				logger.info('No outbox list found');
				return ResultFactory.success(VOID_RESULT);
			}

			const outboxList = outboxListResult.value;
			logger.info(`outbox list length ${outboxList.length}`);

			// Batch Wise Outbox Execution with update db
			await this._outboxBatchService.handleAsync({
				outboxList: outboxList,
				services: {
					publishEventService: this._publishEmailEventService,
					updateOutboxDbService: this._updateOutboxDbService,
				},
				producer: producer,
				queryRunner: queryRunner,
			});

			await queryRunner.commitTransaction();

			return ResultFactory.success(VOID_RESULT);
		} catch (ex) {
			const error = ex as Error;
			await queryRunner.rollbackTransaction();
			return ResultFactory.error(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error.message,
				error.stack
			);
		} finally {
			await queryRunner.release();
		}
	}
}
