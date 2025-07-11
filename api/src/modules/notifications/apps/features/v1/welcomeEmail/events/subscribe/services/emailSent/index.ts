import { IServiceHandlerAsync, Result, ResultError, ResultFactory, sealed, Service, StatusCodes, tryCatchResultAsync } from "@kishornaik/utils";
import { WelcomeUserRequestDto } from "../../../../contracts";

export interface IEmailSentEmailService extends IServiceHandlerAsync<WelcomeUserRequestDto,boolean>{

}

@sealed
@Service()
export class EmailSentService implements IEmailSentEmailService{

  public handleAsync(params: WelcomeUserRequestDto): Promise<Result<boolean, ResultError>> {
    return tryCatchResultAsync(async ()=>{

      // Guard
      if(!params)
        return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Value is required');

      console.log(`Email sent to ${params.email}`);

      return ResultFactory.success(true);
    })
  }

}
