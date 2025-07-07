import test, { afterEach, beforeEach, describe } from 'node:test';
import { Guid, QueryRunner, StatusEnum } from '@kishornaik/utils';
import expect from 'expect';
import {
	destroyDatabase,
	getQueryRunner,
	initializeDatabase,
} from '../../../../../../config/dbSource';
import {
	GetUserByEmailDbService,
	GetUserByEmailIdDbDto,
} from '../../../../apps/features/v1/getUserByEmail';

// Debug Mode:All Test Case Run
//node --trace-deprecation --test --require ts-node/register -r tsconfig-paths/register ./src/core/modules/users/tests/features/v1/getUserByEmail/index.test.ts

// Debug Mode:Specific Test Case Run
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/users/tests/features/v1/getUserByEmail/index.test.ts

// If Debug not Worked then use
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register --inspect=4321 -r tsconfig-paths/register ./src/core/modules/users/tests/features/v1/getUserByEmail/index.test.ts

describe(`Get-User-By-Email-Unit-Tests`, () => {
	let queryRunner: QueryRunner;

	beforeEach(async () => {
		await initializeDatabase();
		queryRunner = getQueryRunner();
	});

	afterEach(async () => {
		await queryRunner.release();
		await destroyDatabase();
	});

	// node --trace-deprecation --test --test-name-pattern='should_return_false_when_email_is_not_provided' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/users/tests/features/v1/getUserByEmail/index.test.ts
	test(`should_return_false_when_email_is_not_provided`, async () => {
		const user: GetUserByEmailIdDbDto = new GetUserByEmailIdDbDto();
		user.email = '';

		await queryRunner.startTransaction();

		const result = await new GetUserByEmailDbService().handleAsync({
			queryRunner,
			user,
		});
		const isError = result.isErr();
		if (isError) {
			await queryRunner.rollbackTransaction();
			console.log(`Error: ${result.error.message}`);
			expect(isError).toBe(true);
			return;
		}

		await queryRunner.commitTransaction();
		expect(result.isOk()).toBe(false);
	});

	// node --trace-deprecation --test --test-name-pattern='should_return_false_when_email_is_wrong' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/users/tests/features/v1/getUserByEmail/index.test.ts
	test(`should_return_false_when_email_is_wrong`, async () => {
		const user: GetUserByEmailIdDbDto = new GetUserByEmailIdDbDto();
		user.email = 'k1@example.com';

		await queryRunner.startTransaction();

		const result = await new GetUserByEmailDbService().handleAsync({
			queryRunner,
			user,
		});
		const isError = result.isErr();
		if (isError) {
			await queryRunner.rollbackTransaction();
			console.log(`Error: ${result.error.message}`);
			expect(isError).toBe(true);
			return;
		}

		await queryRunner.commitTransaction();
		expect(result.isOk()).toBe(false);
	});

	// node --trace-deprecation --test --test-name-pattern='should_return_true_when_email_is_correct' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/users/tests/features/v1/getUserByEmail/index.test.ts
	test(`should_return_true_when_email_is_correct`, async () => {
		const user: GetUserByEmailIdDbDto = new GetUserByEmailIdDbDto();
		user.email = 'john.doe@example.com';

		await queryRunner.startTransaction();

		const result = await new GetUserByEmailDbService().handleAsync({
			queryRunner,
			user,
		});
		const isError = result.isErr();
		if (isError) {
			await queryRunner.rollbackTransaction();
			console.log(`Error: ${result.error.message}`);
			expect(isError).toBe(false);
			return;
		}

		await queryRunner.commitTransaction();
		expect(result.isOk()).toBe(true);
	});
});
