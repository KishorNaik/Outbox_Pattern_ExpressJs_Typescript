import { publicProcedure } from '@/config/trpc';
import { z } from 'zod';
import { CreateRequestDto, CreateResponseDto } from '../contracts';
import { TRPCError } from '@trpc/server';

/*
curl --location 'http://localhost:3000/trpc/v1_demo.create' \
--header 'Content-Type: application/json' \
--data '{
    "title":"typescript",
    "description":"great language"
}'
*/

const createInputSchema = z.object({
	title: z.string().min(2),
	description: z.string().min(1),
});

const createOutputSchema = z.object({
	message: z.string(),
});

export const createDemo = publicProcedure
	.input(createInputSchema)
	.output(createOutputSchema)
	.mutation((opts) => {
		const { ctx, input, signal } = opts;
		const { title, description } = input;
		const request = new CreateRequestDto();
		request.title = title;
		request.description = description;

		// Code
		//...
		//...

		// throw new TRPCError({
		//   code: "NOT_FOUND",
		//   message: "Not found",
		// })

		const response: CreateResponseDto = {
			message: 'success',
		};

		return response;
	});
