import { Enumerable, IServiceHandlerVoidAsync, RequestReplyProducerBullMq, Result, ResultError, ResultFactory, sealed, Service, tryCatchResultAsync, tryCatchSagaAsync, VOID_RESULT, VoidResult } from "@kishornaik/utils";
import { PublishWelcomeUserEmailEventService } from "../sendEmailEvent";
import { OutboxEntity } from "@kishornaik/db";

export interface IOutboxBatchParameters{
  outboxList:OutboxEntity[];
  service:PublishWelcomeUserEmailEventService;
  producer:RequestReplyProducerBullMq;
}

export interface IOutboxBatchService extends IServiceHandlerVoidAsync<IOutboxBatchParameters>{}

@sealed
@Service()
export class OutboxBatchService implements IOutboxBatchService {
  public handleAsync(params: IOutboxBatchParameters): Promise<Result<VoidResult, ResultError>> {
    return tryCatchResultAsync(async ()=>{
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
    })
  }
}
