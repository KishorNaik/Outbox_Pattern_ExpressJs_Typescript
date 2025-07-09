import { logger } from '@/shared/utils/helpers/loggers';
import { GetOutboxDbService, UpdateOutboxDbService } from '@kishornaik/db';
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
} from '@kishornaik/utils';
import { GetOutboxListService } from './services/getOutBoxList';
import { SendEmailEventService } from './services/sendEmailEvent';
import { OutboxBatchService } from './services/batch';

const requestQueue = 'send-email-queue';
const producer = new RequestReplyProducerBullMq(bullMqRedisConnection);
producer.setQueues(requestQueue).setQueueEvents();

export const sendEmailEventCronJob: WorkerCronJob = async () => {
	const job = new CronJob(
		`*/20 * * * * *`,
		async () => {
			logger.info(`SendEmailEventCronJob started....`);
			await Container.get(PublishSendEmailIntegrationEvent).handleAsync();
      logger.info(`SendEmailEventCronJob ended....`);
		},
		null,
		false
	);
	job.start();
};

interface IPublishSendEmailIntegrationEvent extends IServiceHandlerNoParamsVoidAsync{}


@sealed
@Service()
class PublishSendEmailIntegrationEvent implements IPublishSendEmailIntegrationEvent{

  private readonly _getOutboxListService:GetOutboxListService;
  private readonly _sendEmailEventService:SendEmailEventService;
  private readonly _outboxBatchService:OutboxBatchService;

  public constructor(){
    this._getOutboxListService = Container.get(GetOutboxListService);
    this._sendEmailEventService=Container.get(SendEmailEventService);
    this._outboxBatchService=Container.get(OutboxBatchService);
  }

  public handleAsync(): Promise<Result<VoidResult, ResultError>> {
    return tryCatchResultAsync(async ()=>{

      // Get Outbox List
      const outboxListResult=await this._getOutboxListService.handleAsync({
        eventType:'UserEmailSendEvent'
      });

      if(outboxListResult.isErr()){
        return ResultFactory.success(VOID_RESULT);
      }

      const outboxList=outboxListResult.value;

      // Batch Wise Execution
      await this._outboxBatchService.handleAsync({
        outboxList:outboxList,
        service:this._sendEmailEventService,
        producer:producer
      })

      return ResultFactory.success(VOID_RESULT);
    })
  }
}
