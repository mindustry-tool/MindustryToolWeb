import { api } from '@mindustry-tool/api';

import { apiInstance } from '@/config/api';

export class Batcher<K, M, R, F> {
	private static batchers: Batcher<unknown, unknown, unknown, unknown>[] = [];

	static user = new Batcher({
		reduceFn: (ids: string[]) => ids,
		batchFn: async (ids) =>
			await apiInstance.request(api.v4.users.getBatches, {
				body: { ids },
			}),
		extractFn: (results, id) => results.find((result) => result.id === id) || null,
	});

	static postLikes = new Batcher({
		reduceFn: (ids: string[]) => ids,
		batchFn: async (ids) =>
			await apiInstance.request(api.v4.likes.find, {
				body: { itemIds: ids },
				params: { itemType: 'posts' },
			}),
		extractFn: (results, id) => results.find((result) => result.itemId === id) || null,
	});

	static schematicLikes = new Batcher({
		reduceFn: (ids: string[]) => ids,
		batchFn: async (ids) =>
			await apiInstance.request(api.v4.likes.find, {
				body: { itemIds: ids },
				params: { itemType: 'schematics' },
			}),
		extractFn: (results, id) => results.find((result) => result.itemId === id) || null,
	});

	static mapLikes = new Batcher({
		reduceFn: (ids: string[]) => ids,
		batchFn: async (ids) =>
			await apiInstance.request(api.v4.likes.find, {
				body: { itemIds: ids },
				params: { itemType: 'maps' },
			}),
		extractFn: (results, id) => results.find((result) => result.itemId === id) || null,
	});

	static contentPatchLikes = new Batcher({
		reduceFn: (ids: string[]) => ids,
		batchFn: async (ids) =>
			await apiInstance.request(api.v4.likes.find, {
				body: { itemIds: ids },
				params: { itemType: 'content-patches' },
			}),
		extractFn: (results, id) => results.find((result) => result.itemId === id) || null,
	});

	private promises = new Map<
		K,
		{
			resolve: (value: F | null) => void;
			reject: (reason?: unknown) => void;
		}
	>();

	private timeout: NodeJS.Timeout | null = null;

	constructor(
		private readonly props: {
			reduceFn: (key: K[]) => M;
			batchFn: (data: M) => Promise<R>;
			extractFn: (result: R, key: K) => F;
		},
	) {
		Batcher.batchers.push(this as Batcher<any, any, any, any>);
	}

	async batch() {
		const copy = new Map(this.promises);

		this.promises.clear();

		if (copy.size === 0) {
			return;
		}

		const keys = Array.from(copy.keys());
		const data = this.props.reduceFn(keys);

		await this.props
			.batchFn(data)
			.then((results) => {
				keys.forEach((key) => {
					const result = this.props.extractFn(results, key);
					if (result) {
						const promise = copy.get(key);
						if (promise) {
							promise.resolve(result);
						}
					} else {
						const promise = copy.get(key);
						if (promise) {
							promise.resolve(null);
						}
					}
				});
			})
			.catch((error) => {
				keys.forEach((key) => {
					copy.get(key)?.reject(new Error(error));
				});
			})
			.finally(() => copy.clear());
	}

	get(id: K): Promise<F | null> {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.timeout = setTimeout(() => this.batch(), 500);

		const promise = new Promise<F | null>((resolve, reject) => {
			this.promises.set(id, { resolve, reject });

			setTimeout(() => reject(new Error('Timeout')), 10000);
		});

		return promise;
	}
}
