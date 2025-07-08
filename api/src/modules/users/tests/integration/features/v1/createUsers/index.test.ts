import { describe, it } from 'node:test';
import request from 'supertest';
import expect from 'expect';
import { App } from '@/app';
import { destroyDatabase, initializeDatabase } from '@kishornaik/db';
import { ValidateEnv } from '@kishornaik/utils';
import { restApiModulesFederation } from '@/modules/app.Module';
import { CreateUsersRequestDto } from '@/modules/users/apps/features/v1/createUsers';

process.env.NODE_ENV = 'development';
ValidateEnv();

const appInstance=new App();
const app=appInstance
  .initializeRestApiRoutes([...restApiModulesFederation])
  .initializeErrorHandling()
  .getServer();

describe(`Create-User-Integration-Test`, () => {
	//node --trace-deprecation --test --test-name-pattern='should_return_false_when_validation_service_failed' --require ts-node/register -r tsconfig-paths/register ./src/modules/users/tests/integration/features/v1/createUsers/index.test.ts
	it(`should_return_false_when_validation_service_failed`, async () => {
		await initializeDatabase();

		const requestBody = new CreateUsersRequestDto();
		requestBody.fullName = '';
		requestBody.email = '';

		const response = await request(app).post('/api/v1/users').send(requestBody);
		expect(response.body.Success).toBe(false);
		expect(response.statusCode).toBe(400);

		await destroyDatabase();
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_when_user_already_exists' --require ts-node/register -r tsconfig-paths/register ./src/modules/users/tests/integration/features/v1/createUsers/index.test.ts
	it(`should_return_false_when_user_already_exists`, async () => {
		await initializeDatabase();

		const requestBody = new CreateUsersRequestDto();
		requestBody.fullName = `John Doe`;
		requestBody.email = 'john.doe@example.com';

		const response = await request(app).post('/api/v1/users').send(requestBody);
		expect(response.body.Success).toBe(false);
		expect(response.statusCode).toBe(409);

		await destroyDatabase();
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_user_created_successfully' --require ts-node/register -r tsconfig-paths/register ./src/modules/users/tests/integration/features/v1/createUsers/index.test.ts
	it(`should_return_true_when_user_created_successfully`, async () => {
		await initializeDatabase();

		const requestBody = new CreateUsersRequestDto();
		requestBody.fullName = `Joseph Doe`;
		requestBody.email = 'joseph.doe@example.com';

		const response = await request(app).post('/api/v1/users').send(requestBody);
		expect(response.body.Success).toBe(true);
		expect(response.statusCode).toBe(201);

		await destroyDatabase();
	});
});
