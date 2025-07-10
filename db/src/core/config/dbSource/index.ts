import { DataSource, QueryRunner, SelectQueryBuilder } from '@kishornaik/utils';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME } from '../env';
import { userModuleDbDataSourceRegisterEntity } from '../../modules/users/users.Module';
import { outboxModuleDbDataSourceRegisterEntity } from '../../modules/app.Module';

export const dbDataSource = new DataSource({
	type: 'postgres',
	host: DB_HOST,
	port: parseInt(DB_PORT!),
	username: DB_USERNAME,
	password: DB_PASSWORD,
	database: DB_DATABASE,
	synchronize: false,
	logging: true,
	entities: [...userModuleDbDataSourceRegisterEntity, ...outboxModuleDbDataSourceRegisterEntity],
	subscribers: [],
	migrations: ['src/migration/**/*.ts'],
  extra:{
    max: 10
  }
});

async function initializeDatabase() {
	await dbDataSource.initialize();
}

function getQueryRunner(): QueryRunner {
	return dbDataSource.createQueryRunner();
}

async function destroyDatabase() {
	await dbDataSource.destroy();
}

export { initializeDatabase, getQueryRunner, QueryRunner, destroyDatabase, SelectQueryBuilder };
