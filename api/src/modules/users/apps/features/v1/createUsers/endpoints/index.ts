import { Response } from 'express';
import {
	Body,
	HttpCode,
	JsonController,
	OnUndefined,
	Post,
	Res,
	UseBefore,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { ValidationMiddleware } from '@/middlewares/security/validations';
import {
	RequestData,
	sealed,
	StatusCodes,
	DataResponse as ApiDataResponse,
	requestHandler,
	RequestHandler,
	DataResponseFactory,
	PipelineWorkflowException,
	PipelineWorkflow,
	Container,
} from '@kishornaik/utils';
import { mediator } from '@/shared/utils/helpers/medaitR';
import { getQueryRunner, UserEntity } from '@kishornaik/db';
import { logger } from '@/shared/utils/helpers/loggers';
import { CreateUsersRequestDto, CreateUsersResponseDto } from '../contracts';
import { CreateUserMapEntityService } from './services/mapEntity';
import { CreateUserDbService } from './services/db/createUsers';
import { CreateOutboxDbService } from './services/db/createOutbox';
import { CreateUserMapResponseService } from './services/mapResponse';

@JsonController(`/api/v1/users`)
@OpenAPI({ tags: [`users`] })
export class CreateUserEndpoint {
	@Post()
	@OpenAPI({
		summary: `Create User`,
		tags: [`users`],
		description: `Create a new user in the system.`,
	})
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(CreateUsersRequestDto))
	public async postAsync(@Body() request: CreateUsersRequestDto, @Res() res: Response) {
		const response = await mediator.send(new CreateUserCommand(request));
		return res.status(response.StatusCode).json(response);
	}
}

@sealed
class CreateUserCommand extends RequestData<ApiDataResponse<CreateUsersResponseDto>> {
	private readonly _request: CreateUsersRequestDto;

	public constructor(request: CreateUsersRequestDto) {
		super();
		this._request = request;
	}

	public get request(): CreateUsersRequestDto {
		return this._request;
	}
}

enum CreateUserPipelineSteps{
  MAP_ENTITY="MAP_ENTITY",
  ADD_USER_DB_SERVICE="ADD_USER_DB_SERVICE",
  ADD_OUTBOX_DB_SERVICE="ADD_OUTBOX_DB_SERVICE",
  MAP_RESPONSE="MAP_RESPONSE"
}

@sealed
@requestHandler(CreateUserCommand)
class CreateUserCommandHandler implements RequestHandler<CreateUserCommand, ApiDataResponse<CreateUsersResponseDto>>{

  private pipeline = new PipelineWorkflow(logger);
  private readonly _createUserMapEntityService:CreateUserMapEntityService;
  private readonly _createUserDbService:CreateUserDbService;
  private readonly _createOutboxDbService:CreateOutboxDbService;
  private readonly _createUserMapResponseService:CreateUserMapResponseService;

  public constructor(){
    this._createUserMapEntityService=Container.get(CreateUserMapEntityService);
    this._createUserDbService=Container.get(CreateUserDbService);
    this._createOutboxDbService=Container.get(CreateOutboxDbService);
    this._createUserMapResponseService=Container.get(CreateUserMapResponseService);
  }

  public async handle(value: CreateUserCommand): Promise<ApiDataResponse<CreateUsersResponseDto>> {
    const queryRunner = getQueryRunner();
		await queryRunner.connect();
    try
    {
      // Guard
      if(!value)
        return DataResponseFactory.error(StatusCodes.BAD_REQUEST, 'Value is required');

      if(!value.request)
        return DataResponseFactory.error(StatusCodes.BAD_REQUEST, 'Request is required');

      const { request } = value;

      // Start Transaction
      await queryRunner.startTransaction();

      // Map Entity
      await this.pipeline.step(CreateUserPipelineSteps.MAP_ENTITY,()=>{
        return this._createUserMapEntityService.handleAsync(request);
      });

      // Add User Db Service Pipeline
      await this.pipeline.step(CreateUserPipelineSteps.ADD_USER_DB_SERVICE,async ()=>{
        // Get Map Result;
        const mapResult=this.pipeline.getResult<UserEntity>(CreateUserPipelineSteps.MAP_ENTITY);

        // Add User
        return this._createUserDbService.handleAsync({user:mapResult,queryRunner});
      });

      // Add Outbox Db Service Pipeline
      await this.pipeline.step(CreateUserPipelineSteps.ADD_OUTBOX_DB_SERVICE,async ()=>{

        // Get Map Result;
        const mapResult=this.pipeline.getResult<UserEntity>(CreateUserPipelineSteps.ADD_USER_DB_SERVICE);

        // Add Outbox
        return this._createOutboxDbService.handleAsync({user:mapResult,queryRunner});
      });

      // Map Response
      await this.pipeline.step(CreateUserPipelineSteps.MAP_RESPONSE,async ()=>{
        // Get Map Result;
        const mapResult=this.pipeline.getResult<UserEntity>(CreateUserPipelineSteps.ADD_USER_DB_SERVICE);

        // Map
        return this._createUserMapResponseService.handleAsync(mapResult);
      })

      // Commit Transaction
      await queryRunner.commitTransaction();

      // Return
      const response=this.pipeline.getResult<CreateUsersResponseDto>(CreateUserPipelineSteps.MAP_RESPONSE);
      return DataResponseFactory.success(StatusCodes.CREATED, response,`User Created`);
    }
    catch(ex){
      return await DataResponseFactory.pipelineError(ex, queryRunner);
    }
    finally{
      await queryRunner.release();
    }
  }

}
