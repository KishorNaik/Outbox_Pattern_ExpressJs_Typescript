import { protectedProcedure, publicProcedure } from '@/config/trpc';
import z from 'zod';
import { GetRequestDto, GetResponseDto } from '../contracts';
import { TRPCError } from '@trpc/server';

/*
curl --location 'http://localhost:3000/trpc/v1_demo.get' \
--header 'Content-Type: application/json' \
--data '{
    "id":1
}'
*/

//const getInputSchema = z.string();

const getInputSchema = z.object({
	id: z.number(),
});

const getOutputSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string(),
});

export const getDemo = publicProcedure
	.input(getInputSchema)
	.output(getOutputSchema)
	.query((opts) => {
		const { ctx, input, signal } = opts;

		const request = new GetRequestDto();
		request.id = Number(opts.input);

		// Code
		//...
		//...

		/* throw new TRPCError({
      code: "NOT_FOUND",
      message: "Not found",
    }) */

		const response: GetResponseDto = {
			id: 1,
			title: 'typescript',
			description: 'great language',
		};

		return response;
	});
