import { logger } from "@/shared/utils/helpers/loggers";
import { Container, CronJob, WorkerCronJob } from "@kishornaik/utils";
import { WelcomeUserEmailPublishIntegrationEventService } from "../events/publish/SendEmail";

export const sendWelcomeUserEmailEventCronJob: WorkerCronJob = async () => {
  const job = new CronJob(
    `*/20 * * * * *`,
    async () => {
      logger.info(`SendEmailEventCronJob started....`);
      await Container.get(WelcomeUserEmailPublishIntegrationEventService).handleAsync();
      logger.info(`SendEmailEventCronJob ended....`);
    },
    null,
    false
  );
  job.start();
};
