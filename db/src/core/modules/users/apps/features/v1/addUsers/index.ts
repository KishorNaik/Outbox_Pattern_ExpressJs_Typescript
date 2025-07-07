import { Service } from '@kishornaik/utils';
import { AddService } from '../../../../../../shared/services/db/add';
import { UserEntity } from '../../../../infrastructure/entity/users';

@Service()
export class AddUserDbService extends AddService<UserEntity> {
	public constructor() {
		super(UserEntity);
	}
}
