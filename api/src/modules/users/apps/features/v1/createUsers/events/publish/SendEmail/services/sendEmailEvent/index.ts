import { logger } from '@/shared/utils/helpers/loggers';
import { OutboxEntity, UpdateOutboxDbService, QueryRunner} from '@kishornaik/db';
import {
	BoolEnum,
	Container,
	IServiceHandlerVoidAsync,
	JsonString,
	ReplyMessageBullMq,
	RequestReplyMessageBullMq,
	RequestReplyProducerBullMq,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	tryCatchResultAsync,
	VOID_RESULT,
	VoidResult,
} from '@kishornaik/utils';
import { randomUUID } from 'crypto';



export interface IPublishWelcomeUserEmailEventServiceParameters {
	producer: RequestReplyProducerBullMq;
  updateOutboxDbService: UpdateOutboxDbService;
	outbox: OutboxEntity;
  queryRunner: QueryRunner;
}

export interface IPublishWelcomeUserEmailEventService
	extends IServiceHandlerVoidAsync<IPublishWelcomeUserEmailEventServiceParameters> {}

@sealed
@Service()
export class PublishWelcomeUserEmailEventService implements IPublishWelcomeUserEmailEventService {


	public async handleAsync(
		params: IPublishWelcomeUserEmailEventServiceParameters
	): Promise<Result<VoidResult, ResultError>> {
		return tryCatchResultAsync(async () => {


			// Guard
			if (!params) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Value is required');

			if (!params.outbox)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, `Outbox is required`);

			if (!params.producer)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, `Producer is required`);

      if (!params.updateOutboxDbService)
        return ResultFactory.error(StatusCodes.BAD_REQUEST, `UpdateOutboxDbService is required`);

      if (!params.queryRunner)
        return ResultFactory.error(StatusCodes.BAD_REQUEST, `QueryRunner is required`);

			const { producer, outbox, updateOutboxDbService,queryRunner } = params;

			// Parse User Data
			const userData = JSON.parse(outbox.payload);

			// Generate Message
			const message: RequestReplyMessageBullMq<JsonString> = {
				correlationId: randomUUID().toString(),
				data: JSON.stringify(userData) as JsonString,
			};

			// Send Message Queue
			const messageResult: ReplyMessageBullMq<JsonString> = await producer.sendAsync<
				JsonString,
				JsonString
			>(`JOB-send-email-queue`, message);

      if(!messageResult.success){
        return ResultFactory.error(messageResult.statusCode, messageResult.message);
      }

      // OutBox Update
      outbox.isPublished = BoolEnum.YES;
      const updateDbResult=await updateOutboxDbService.handleAsync(outbox,queryRunner);
      if(updateDbResult.isErr()){
        return ResultFactory.error(messageResult.statusCode, messageResult.message);
      }
      logger.info(`SendEmailEventService: ${messageResult.correlationId} is send`);

			return ResultFactory.success(VOID_RESULT);
		});
	}
}
