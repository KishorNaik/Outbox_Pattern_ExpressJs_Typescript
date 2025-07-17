import {
	GetOutboxDbDto,
	GetOutboxDbService,
	getQueryRunner,
	OutboxEntity,
	QueryRunner,
} from '@kishornaik/db';
import {
	Container,
	IServiceHandlerAsync,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	tryCatchResultAsync,
} from '@kishornaik/utils';

Container.set<GetOutboxDbService>(GetOutboxDbService, new GetOutboxDbService());

export interface IOutboxListServiceParameters {
	eventType: string;
	queryRunner: QueryRunner;
}

export interface IOutboxListService
	extends IServiceHandlerAsync<IOutboxListServiceParameters, OutboxEntity[]> {}

@sealed
@Service()
export class GetOutboxListService implements IOutboxListService {
	private readonly _getOutboxDbService: GetOutboxDbService;

	public constructor() {
		this._getOutboxDbService = Container.get(GetOutboxDbService);
	}

	public async handleAsync(
		params: IOutboxListServiceParameters
	): Promise<Result<OutboxEntity[], ResultError>> {
		try {
			if (!params) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Value is required');

			if (!params.eventType)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'eventType is required');

			if (!params.queryRunner)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'queryRunner is required');

			const { eventType, queryRunner } = params;

			// Map Dto
			const getOutboxDto = new GetOutboxDbDto();
			getOutboxDto.eventType = eventType;
			getOutboxDto.take = 12;
      getOutboxDto.instanceId=`CRON_JOB_INSTANCE_1`; // Take from .env file

			// Db Service
			const result = await this._getOutboxDbService.handleAsync({
				queryRunner: queryRunner,
				request: getOutboxDto,
			});

			if (result.isErr()) {
				return ResultFactory.error(StatusCodes.NOT_FOUND, result.error.message);
			}

			return ResultFactory.success(result.value);
		} catch (ex) {
			const error = ex as Error;
			return ResultFactory.error(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error.message,
				error.stack
			);
		}
	}
}
