import { bullMqRedisConnection, Container, JsonString, ReplyMessageBullMq, RequestReplyConsumerBullMq, WorkerBullMq } from '@kishornaik/utils';
import { MapWelcomeUserEmailService } from './services/mapContract';
import { EmailSentService } from './services/emailSent';

const requestQueue = 'welcome-user-email-queue';
const consumer = new RequestReplyConsumerBullMq(bullMqRedisConnection);

export const welcomeUserEmailSubscribeIntegrationEvent: WorkerBullMq = async () => {
  const worker=await consumer.startConsumingAsync<JsonString,JsonString>(requestQueue,async (reply)=>{

    // Guard
    if(!reply.data.data){
      return {
        success: false,
        error: 'Data is required',
        message:null,
        data: null,
        correlationId: reply.data.correlationId,
      }
    }

    // Map Service
    const mapWelcomeUserEmailService=Container.get(MapWelcomeUserEmailService);
    const mapResult=await mapWelcomeUserEmailService.handleAsync(reply.data.data);
    if(mapResult.isErr()){
      return {
        success: false,
        error: mapResult.error.message,
        message:null,
        data: null,
        correlationId: reply.data.correlationId,
      }
    }

    const request=mapResult.value;

    // Email Send  Service
    const emailSendService=Container.get(EmailSentService);
    const emailSendResult=await emailSendService.handleAsync(request);
    if(emailSendResult.isErr()){
      return {
        success: false,
        error: emailSendResult.error.message,
        message:null,
        data: null,
        correlationId: reply.data.correlationId,
      }
    }

    // Generate Message
    const message: ReplyMessageBullMq<JsonString> = {
				correlationId: reply.data.correlationId,
				success: true,
				data: `Processed request with data: ${JSON.stringify(reply.data.data)}` as JsonString,
				message: `Processed request with data: ${JSON.stringify(reply.data.data)}`,
			};

    // Return
    return message;

  });

  worker.on('completed', (job) => {
		console.log(`[App - PubSubConsumer] Job completed: ${job.id}`);
	});

	worker.on('failed', (job, err) => {
		console.error(`[App - PubSubConsumer] Job failed: ${job.id}, Error: ${err.message}`);
	});

};
