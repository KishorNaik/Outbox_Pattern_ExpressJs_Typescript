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
import { GetOutboxListService as OutboxListService } from './services/getOutBoxList';
import { PublishWelcomeUserEmailEventService } from './services/sendEmailEvent';
import { OutboxBatchService } from './services/batch';

const requestQueue = 'welcome-user-email-queue';
const producer = new RequestReplyProducerBullMq(bullMqRedisConnection);
producer.setQueues(requestQueue).setQueueEvents();

export interface IWelcomeUserEmailPublishIntegrationEventService extends IServiceHandlerNoParamsVoidAsync{}


@sealed
@Service()
export class WelcomeUserEmailPublishIntegrationEventService implements IWelcomeUserEmailPublishIntegrationEventService{

  private readonly _getOutboxListService:OutboxListService;
  private readonly _sendEmailEventService:PublishWelcomeUserEmailEventService;
  private readonly _outboxBatchService:OutboxBatchService;

  public constructor(){
    this._getOutboxListService = Container.get(OutboxListService);
    this._sendEmailEventService=Container.get(PublishWelcomeUserEmailEventService);
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
