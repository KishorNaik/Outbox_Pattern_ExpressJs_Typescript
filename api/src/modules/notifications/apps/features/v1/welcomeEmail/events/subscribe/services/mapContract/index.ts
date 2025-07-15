import {
	IServiceHandlerAsync,
	JsonString,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	tryCatchResultAsync,
} from '@kishornaik/utils';
import { WelcomeUserRequestDto } from '../../../../contracts';

export interface IMapWelcomeUserEmailService
	extends IServiceHandlerAsync<JsonString, WelcomeUserRequestDto> {}

@sealed
@Service()
export class MapWelcomeUserEmailService implements IMapWelcomeUserEmailService {
	public handleAsync(params: JsonString): Promise<Result<WelcomeUserRequestDto, ResultError>> {
		return tryCatchResultAsync(async () => {
			// Guard
			if (!params) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Value is required');

			// Parse Data
			const data: WelcomeUserRequestDto = JSON.parse(params);
			if (!data) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Data is required');

			// Map Dto
			const welcomeUserEmailRequestDto: WelcomeUserRequestDto = {
				fullName: data.fullName,
				email: data.email,
			};

			// Return
			return ResultFactory.success(welcomeUserEmailRequestDto);
		});
	}
}
