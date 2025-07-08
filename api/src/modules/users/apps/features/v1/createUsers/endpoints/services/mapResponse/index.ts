import { UserEntity } from "@kishornaik/db";
import { IServiceHandlerAsync, Result, ResultError, ResultFactory, Service,StatusCodes,sealed, tryCatchResultAsync } from "@kishornaik/utils";
import { CreateUsersResponseDto } from "../../../contracts";

export interface ICreateUserMapResponseService extends IServiceHandlerAsync<UserEntity, CreateUsersResponseDto>
{}

@sealed
@Service()
export class CreateUserMapResponseService implements ICreateUserMapResponseService {
  public handleAsync(params: UserEntity): Promise<Result<CreateUsersResponseDto, ResultError>> {
    return tryCatchResultAsync(async ()=>{

      // Guard
      if(!params)
        return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Parameters are required');

      // Map Entity
      const response:CreateUsersResponseDto=new CreateUsersResponseDto();
      response.identifier=params.identifier;

      return ResultFactory.success(response);

    });
  }

}

