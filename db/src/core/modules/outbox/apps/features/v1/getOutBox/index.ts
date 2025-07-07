import {
  BoolEnum,
	Container,
	DtoValidation,
	Err,
	IDtoValidation,
	IServiceHandlerAsync,
	IsSafeString,
	Ok,
	QueryRunner,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	StatusEnum,
	tryCatchResultAsync,
} from '@kishornaik/utils';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { OutboxEntity } from '../../../../outbox.Module';
import { dbDataSource } from '../../../../../../config/dbSource';

export class GetOutboxDbDto {
	@IsNotEmpty()
	@IsString()
	@IsSafeString()
	public eventType?: string;

	@IsNotEmpty()
	@IsNumber()
  @Min(1)
  @Max(12)
	public take?: number = 12;
}

export interface IGetOutboxDbServiceParameters {
	request: GetOutboxDbDto;
	queryRunner: QueryRunner;
}

export interface IGetOutboxDbService
	extends IServiceHandlerAsync<IGetOutboxDbServiceParameters, Array<OutboxEntity>> {}

@sealed
@Service()
export class GetOutboxDbService implements IGetOutboxDbService {

  private readonly dtoValidation: IDtoValidation<GetOutboxDbDto>;

  public constructor() {
    this.dtoValidation = Container.get(DtoValidation<GetOutboxDbDto>);
  }


	public handleAsync(
		params: IGetOutboxDbServiceParameters
	): Promise<Result<OutboxEntity[], ResultError>> {
		return tryCatchResultAsync(async () => {
			// Guard
			if (!params)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Parameters are required');

			if (!params.queryRunner)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'QueryRunner is required');

			if (!params.request)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Request is required');

      // Validate Entity
			const validationResult = await this.dtoValidation.handleAsync({
				dto: params.request,
				dtoClass: (params.request as any).constructor,
			});
			if (validationResult.isErr())
        return ResultFactory.error(StatusCodes.BAD_REQUEST, validationResult.error.message);

			const { queryRunner, request } = params;
			const { eventType, take } = request;

			// Run Query Runner or Entity Manager
			const entityManger = queryRunner ? queryRunner.manager : dbDataSource.manager;

			// Query
			let results = await entityManger
				.createQueryBuilder(OutboxEntity, 'outbox')
				.where('outbox.eventType = :eventType', { eventType })
				.andWhere('outbox.isPublished = :isPublished', { isPublished: BoolEnum.NO })
				.andWhere('outbox.status = :status', { status: StatusEnum.ACTIVE })
				.orderBy('outbox.created_date', 'ASC')
				.take(take ?? 12)
				.getMany();

			if (!results || results.length === 0)
				return ResultFactory.error(StatusCodes.NOT_FOUND, 'No outbox found');

			return ResultFactory.success(results);
		});
	}
}
