import { UserEntity, QueryRunner, AddOutboxDbService, OutboxEntity } from '@kishornaik/db';
import {
	IServiceHandlerVoidAsync,
	Result,
	ResultError,
	sealed,
	Service,
	VoidResult,
	tryCatchResultAsync,
	ResultFactory,
	VOID_RESULT,
	StatusCodes,
	Container,
	StatusEnum,
	BoolEnum,
} from '@kishornaik/utils';
import { randomUUID } from 'crypto';

Container.set<AddOutboxDbService>(AddOutboxDbService, new AddOutboxDbService());

export interface ICreateOutboxDbServiceParameters {
	user: UserEntity;
	queryRunner: QueryRunner;
}

export interface ICreateOutboxDbService
	extends IServiceHandlerVoidAsync<ICreateOutboxDbServiceParameters> {}

@sealed
@Service()
export class CreateOutboxDbService implements ICreateOutboxDbService {
	private readonly _addOutboxDbService: AddOutboxDbService;

	public constructor() {
		this._addOutboxDbService = Container.get(AddOutboxDbService);
	}

	public handleAsync(
		params: ICreateOutboxDbServiceParameters
	): Promise<Result<VoidResult, ResultError>> {
		return tryCatchResultAsync(async () => {
			// Guard
			if (!params)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Parameters are required');

			if (!params.user)
				return ResultFactory.error(StatusCodes.BAD_GATEWAY, 'User is required');

			if (!params.queryRunner)
				return ResultFactory.error(StatusCodes.BAD_GATEWAY, 'Query Runner is required');

			const { user, queryRunner } = params;

			// Generate Payload
			const payload: string = JSON.stringify(user);

			// Map
			const outbox: OutboxEntity = new OutboxEntity();
			outbox.identifier = randomUUID().toString();
			outbox.eventType = 'UserEmailSendEvent';
			outbox.status = StatusEnum.ACTIVE;
			outbox.isPublished = BoolEnum.NO;
			outbox.payload = payload;
			outbox.created_date = new Date();
			outbox.modified_date = new Date();

			// Add
			const result = await this._addOutboxDbService.handleAsync(outbox, queryRunner);
			if (result.isErr()) return ResultFactory.errorInstance(result.error);

			return ResultFactory.success(VOID_RESULT);
		});
	}
}
