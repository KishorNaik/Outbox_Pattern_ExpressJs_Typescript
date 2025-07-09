import { GetOutboxDbDto, GetOutboxDbService, getQueryRunner, OutboxEntity } from "@kishornaik/db";
import { Container, IServiceHandlerAsync, Result, ResultError, ResultFactory, sealed, Service, StatusCodes, tryCatchResultAsync } from "@kishornaik/utils";

Container.set<GetOutboxDbService>(GetOutboxDbService, new GetOutboxDbService());

export interface IGetOutboxListServiceParameters {
  eventType:string;
}


export interface IGetOutboxListService extends IServiceHandlerAsync<IGetOutboxListServiceParameters,OutboxEntity[]>{

}

@sealed
@Service()
export class GetOutboxListService implements IGetOutboxListService {

  private readonly _getOutboxDbService:GetOutboxDbService;

  public constructor(){
    this._getOutboxDbService = Container.get(GetOutboxDbService);
  }

  public async handleAsync(params: IGetOutboxListServiceParameters): Promise<Result<OutboxEntity[], ResultError>> {
    const queryRunner = getQueryRunner();
		await queryRunner.connect();
    try
    {
      if(!params)
        return ResultFactory.error(StatusCodes.BAD_REQUEST,'Value is required');

      const {eventType}=params;

      await queryRunner.startTransaction();

      const getOutboxDto=new GetOutboxDbDto();
      getOutboxDto.eventType=eventType;
      getOutboxDto.take=12;


      const result=await this._getOutboxDbService.handleAsync({
        queryRunner:queryRunner,
        request:getOutboxDto
      });

      if(result.isErr()){
        return ResultFactory.error(StatusCodes.NOT_FOUND,result.error.message);
      }

      return ResultFactory.success(result.value);

    }
    catch(ex){
      const error = ex as Error;
      return ResultFactory.error(StatusCodes.INTERNAL_SERVER_ERROR,error.message,error.stack);
    }
    finally{
      await queryRunner.release();
    }
  }

}
