import { AddUserDbService, UserEntity,QueryRunner } from "@kishornaik/db";
import { sealed, Service,Container, IServiceHandlerAsync, Result, ResultError, tryCatchResultAsync, ResultFactory, StatusCodes } from "@kishornaik/utils";

Container.set<AddUserDbService>(AddUserDbService, new AddUserDbService());

export interface ICreateUserDbServiceParameters{
  user:UserEntity;
  queryRunner:QueryRunner;
}

export interface ICreateUserDbService extends IServiceHandlerAsync<ICreateUserDbServiceParameters,UserEntity> {}

@sealed
@Service()
export class CreateUserDbService implements ICreateUserDbService {

  private readonly _addUserDbService: AddUserDbService;

  public constructor() {
    this._addUserDbService = Container.get<AddUserDbService>(AddUserDbService);
  }

  public handleAsync(params: ICreateUserDbServiceParameters): Promise<Result<UserEntity, ResultError>> {
    return tryCatchResultAsync(async ()=>{
      // Guard
      if(!params)
        return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Parameters are required');

      if(!params.user)
        return ResultFactory.error(StatusCodes.BAD_GATEWAY, 'User is required');

      if(!params.queryRunner)
        return ResultFactory.error(StatusCodes.BAD_GATEWAY, 'QueryRunner is required');

      const { user,queryRunner }=params;

      // Add Db Service
      const result=await this._addUserDbService.handleAsync(user,queryRunner);
      if(result.isErr())
      {
        const error=result.error.message;
        if(error.includes(`duplicate key value violates unique constraint`)){
          return ResultFactory.error(StatusCodes.CONFLICT, 'User already exist');
        }
        return ResultFactory.error(result.error.statusCode, result.error.message);
      }

      return ResultFactory.success(result.value);
    });
  }

}
