import {
	IServiceHandler,
	Result,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	StatusEnum,
	tryCatchResultAsync,
} from '@kishornaik/utils';
import { IServiceHandlerAsync } from '@kishornaik/utils/src/core/shared/utils/helpers/services';
import { CreateUsersRequestDto } from '../../../contracts';
import { UserEntity } from '@kishornaik/db';
import { ResultError } from '@kishornaik/utils/src/core/shared/utils/exceptions/results';
import { randomUUID } from 'crypto';

export interface ICreateMapUserEntityService
	extends IServiceHandlerAsync<CreateUsersRequestDto, UserEntity> {}

@sealed
@Service()
export class CreateUserMapEntityService implements ICreateMapUserEntityService {
	public handleAsync(params: CreateUsersRequestDto): Promise<Result<UserEntity, ResultError>> {
		return tryCatchResultAsync(async () => {
			// Guard
			if (!params)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Parameters are required');

			// Map Entity
			const user: UserEntity = new UserEntity();
			user.identifier = randomUUID().toString();
			user.status = StatusEnum.ACTIVE;
			user.fullName = params.fullName;
			user.email = params.email;

			return ResultFactory.success(user);
		});
	}
}
