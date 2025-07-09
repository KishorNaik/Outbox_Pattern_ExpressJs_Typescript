import { logger } from "@/shared/utils/helpers/loggers";
import { OutboxEntity, UpdateOutboxDbService } from "@kishornaik/db";
import { BoolEnum, Container, IServiceHandlerVoidAsync, JsonString, ReplyMessageBullMq, RequestReplyMessageBullMq, RequestReplyProducerBullMq, Result, ResultError, ResultFactory, sealed, Service, StatusCodes, tryCatchResultAsync, VOID_RESULT, VoidResult } from "@kishornaik/utils";
import { randomUUID } from "crypto";

Container.set<UpdateOutboxDbService>(UpdateOutboxDbService, new UpdateOutboxDbService());

export interface IPublishWelcomeUserEmailEventServiceParameters{
  producer:RequestReplyProducerBullMq;
  outbox:OutboxEntity;
}

export interface IPublishWelcomeUserEmailEventService extends IServiceHandlerVoidAsync<IPublishWelcomeUserEmailEventServiceParameters>{

}

@sealed
@Service()
export class PublishWelcomeUserEmailEventService implements IPublishWelcomeUserEmailEventService{

  private readonly _updateOutboxDbService:UpdateOutboxDbService
  public constructor(){
    this._updateOutboxDbService = Container.get(UpdateOutboxDbService);
  }

  public async handleAsync(params: IPublishWelcomeUserEmailEventServiceParameters): Promise<Result<VoidResult, ResultError>> {

    return tryCatchResultAsync(async ()=>{

      // Guard
      if(!params)
        return ResultFactory.error(StatusCodes.BAD_REQUEST,'Value is required');

      if(!params.outbox)
        return ResultFactory.error(StatusCodes.BAD_REQUEST,`Outbox is required`);

      if(!params.producer)
        return ResultFactory.error(StatusCodes.BAD_REQUEST,`Producer is required`);

      const {producer,outbox}=params;

      // Parse User Data
      const userData=JSON.parse(outbox.payload);

      // Generate Message
      const message: RequestReplyMessageBullMq<JsonString> = {
				correlationId: randomUUID().toString(),
				data: JSON.stringify(userData) as JsonString,
			};

      // Send Message Queue
      const messageResult:ReplyMessageBullMq<JsonString>= await producer.sendAsync<JsonString,JsonString>(`JOB-send-email-queue`, message);

      if(messageResult.success){
        // OutBox Update
        outbox.isPublished=BoolEnum.YES;
        await this._updateOutboxDbService.handleAsync(outbox);
        logger.info(`SendEmailEventService: ${messageResult.correlationId} is send`);
      }
      else
      {
        logger.error(`SendEmailEventService: ${messageResult.error}`);
      }

      return ResultFactory.success(VOID_RESULT);
    });

  }

}
