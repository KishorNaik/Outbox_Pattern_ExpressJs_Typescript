import { BoolEnum, Column, Entity, Index, IsSafeString } from '@kishornaik/utils';
import { BaseEntity } from '../../../../shared/entity/base';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@Entity({ schema: `outboxp`, name: 'outbox' })
export class OutboxEntity extends BaseEntity {
	@Column(`varchar`, { length: 100, nullable: false })
	@IsNotEmpty()
	@IsString()
	@IsSafeString()
	public eventType?: string;

	@Column(`jsonb`, { nullable: false })
	@IsNotEmpty()
	public payload?: string;

	@Column('enum', { enum: BoolEnum, default: BoolEnum.NO })
	public isPublished?: BoolEnum;
}
