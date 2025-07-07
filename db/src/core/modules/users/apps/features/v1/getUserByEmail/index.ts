import {
	Container,
	DtoValidation,
	Err,
	IDtoValidation,
	IServiceHandlerAsync,
	Ok,
	QueryRunner,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	StatusEnum,
} from '@kishornaik/utils';
import { UserEntity } from '../../../../users.Module';
import { dbDataSource } from '../../../../../../config/dbSource';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class GetUserByEmailIdDbDto {
	@IsNotEmpty()
	@IsEmail()
	public email?: string;
}

export interface IGetUserByEmailIdDbServiceParameters {
	user: GetUserByEmailIdDbDto;
	queryRunner: QueryRunner;
}

export interface IGetUserByEmailIdDbService
	extends IServiceHandlerAsync<IGetUserByEmailIdDbServiceParameters, UserEntity> {}

@sealed
@Service()
export class GetUserByEmailDbService implements IGetUserByEmailIdDbService {
	private readonly dtoValidation: IDtoValidation<UserEntity>;

	public constructor() {
		this.dtoValidation = Container.get(DtoValidation<UserEntity>);
	}

	public async handleAsync(
		params: IGetUserByEmailIdDbServiceParameters
	): Promise<Result<UserEntity, ResultError>> {
		try {
			// Guard
			if (!params)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Parameters are required');

			if (!params.queryRunner)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'QueryRunner is required');

			if (!params.user)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'User is required');

			const { queryRunner, user } = params;

			// Validate Entity
			const validationResult = await this.dtoValidation.handleAsync({
				dto: user,
				dtoClass: (user as any).constructor,
			});
			if (validationResult.isErr())
				return ResultFactory.error(StatusCodes.BAD_REQUEST, validationResult.error.message);

			// Run Query Runner
			const entityManager = params.queryRunner
				? params.queryRunner.manager
				: dbDataSource.manager;

			// Get User
			const userEntity = await entityManager
				.createQueryBuilder(UserEntity, 'u')
				.where(`u.email=:email`, { email: user.email })
				.andWhere(`u.status=:status`, { status: StatusEnum.ACTIVE })
				.getOne();

			if (!userEntity) {
				return ResultFactory.error(StatusCodes.NOT_FOUND, 'User not found');
			}

			return new Ok(userEntity);
		} catch (ex) {
			const error = ex as Error;
			return ResultFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
