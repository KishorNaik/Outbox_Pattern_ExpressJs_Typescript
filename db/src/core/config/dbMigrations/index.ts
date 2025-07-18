import { DataSource, DataSourceOptions } from '@kishornaik/utils';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME } from '../env';
import { UserEntity } from '../../modules/users/infrastructure/entity/users';
import { OutboxEntity } from '../../modules/outbox/infrastructure/entity';

/*
    Generate:
    npm run typeorm:generate src/core/config/dbMigrations/migrations/init
    Run:
    npm run typeorm:migrate
*/
const connectionOptions: DataSourceOptions = {
	type: 'postgres',
	host: DB_HOST,
	port: parseInt(DB_PORT!),
	username: DB_USERNAME,
	password: DB_PASSWORD,
	database: DB_DATABASE,
	synchronize: false,
	logging: true,
	entities: [UserEntity, OutboxEntity],
	subscribers: [],
	migrations: ['src/core/config/dbMigrations/migrations/**/*.ts'],
	migrationsTableName: 'custom_migration_table',
	extra: {
		max: 10,
	},
};

export default new DataSource({
	...connectionOptions,
});
