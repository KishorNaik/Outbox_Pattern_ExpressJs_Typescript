import { Column, Entity, Index, IsSafeString } from '@kishornaik/utils';
import { BaseEntity } from '../../../../../shared/entity/base';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@Entity({ schema: `user`, name: 'users' })
export class UserEntity extends BaseEntity {
	@Column(`varchar`, { length: 100, nullable: false })
	@IsNotEmpty()
	@IsString()
	@IsSafeString()
	public fullName?: string;

	@Column(`varchar`, { length: 100, nullable: false })
	@Index({ unique: true })
	@IsNotEmpty()
	@IsEmail()
	public email?: string;
}
