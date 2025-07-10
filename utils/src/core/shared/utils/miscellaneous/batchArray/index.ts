import { Result } from 'neverthrow';
import { VoidResult } from '../voidResult';
import { ResultError } from '../../exceptions/results';

interface BatchArrayExecutionOptions<TInput, TOutput> {
	items: TInput[];
	handler: (item: TInput) => Promise<Result<TOutput | VoidResult, ResultError>>;
	batchSize?: number;
	concurrency?: number; // Max parallel tasks per batch (optional)
}

interface BatchArrayExecutionResult<TOutput> {
	success: Result<TOutput | VoidResult, ResultError>[];
	error: Result<TOutput | VoidResult, ResultError>[];
}

export async function executeBatchArrayAsync<TInput, TOutput>(
	options: BatchArrayExecutionOptions<TInput, TOutput>
): Promise<BatchArrayExecutionResult<TOutput>> {
	const { items, handler, batchSize = 10, concurrency = batchSize } = options;

	const result: BatchArrayExecutionResult<TOutput> = {
		success: [],
		error: [],
	};

	if (items.length === 0) {
		return { success: [], error: [] };
	}

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i * batchSize, i + batchSize);

		const results: Result<TOutput | VoidResult, ResultError>[] = [];

		// Controlled concurrency via chunked execution
		for (let j = 0; j < batch.length; j += concurrency) {
			const chunk = batch.slice(j, j + concurrency);
			const chunkResults = await Promise.all(chunk.map((item) => handler(item)));
			results.push(...chunkResults);
		}

		for (const r of results) {
			r.isOk() ? result.success.push(r) : result.error.push(r);
		}

		await new Promise((res) => setImmediate(res)); // Yield to event loop
	}

	return result;
}

/*
Example
await executeBatchArrayAsync({
  items: outboxList,
  handler: (outbox) =>
    service.handleAsync({ outbox, producer }),
  batchSize: 3,
  concurrency: 3, // Optional throttle
});


const result=await executeBatchArrayAsync({
  items: outboxList,
  handler: (outbox) =>
    service.handleAsync({ outbox, producer }),
  batchSize: 3,
  concurrency: 3, // Optional throttle
});

*/
