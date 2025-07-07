import { UserEntity } from './infrastructure/entity/users';

// Entity Db Datasource Register
export const userModuleDbDataSourceRegisterEntity: Function[] = [UserEntity];

// Export User Module
export * from './infrastructure/entity/users/index';
export * from './apps/features/v1/addUsers/index';
export * from './apps/features/v1/getUserByEmail/index';
