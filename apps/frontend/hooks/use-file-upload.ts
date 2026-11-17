import React from 'react';

export type UploadOptions = {
	maxSize: number;
	limit: number;
	accept: string;
	upload: (
		data: { file: File; width: number; height: number },
		onProgress: (event: { progress: number }) => void,
		signal: AbortSignal,
	) => Promise<string>;
	onSuccess?: (url: string) => void;
	onError?: (error: Error) => void;
};

export type FileItem = {
	id: string;
	file: File;
	progress: number;
	status: 'uploading' | 'success' | 'error';
	url?: string;
	abortController?: AbortController;
};

export function getImageWithHeight(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();

		img.onload = () => {
			resolve({
				width: img.naturalWidth,
				height: img.naturalHeight,
			});
			URL.revokeObjectURL(url);
		};

		img.onerror = (err) => {
			reject(err);
			URL.revokeObjectURL(url);
		};

		img.src = url;
	});
}

export function useFileUpload(options: UploadOptions) {
	const [fileItems, setFileItems] = React.useState<FileItem[]>([]);

	const uploadFile = async (
		file: File,
	): Promise<{ name: string; url: string; width: number; height: number } | null> => {
		if (file.size > options.maxSize) {
			const error = new Error(`File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`);
			options.onError?.(error);
			return null;
		}

		const abortController = new AbortController();
		const fileId = crypto.randomUUID();

		const newFileItem: FileItem = {
			id: fileId,
			file,
			progress: 0,
			status: 'uploading',
			abortController,
		};

		setFileItems((prev) => [...prev, newFileItem]);

		try {
			if (!options.upload) {
				throw new Error('Upload function is not defined');
			}

			const { width, height } = await getImageWithHeight(file);

			const url = await options.upload(
				{ file, width, height },
				(event: { progress: number }) => {
					setFileItems((prev) =>
						prev.map((item) => (item.id === fileId ? { ...item, progress: event.progress } : item)),
					);
				},
				abortController.signal,
			);

			if (!url) {
				throw new Error('Upload failed: No URL returned');
			}

			if (!abortController.signal.aborted) {
				setFileItems((prev) =>
					prev.map((item) => (item.id === fileId ? { ...item, status: 'success', url, progress: 100 } : item)),
				);
				options.onSuccess?.(url);
				return { url, width, height, name: file.name };
			}

			return null;
		} catch (error) {
			if (!abortController.signal.aborted) {
				setFileItems((prev) =>
					prev.map((item) => (item.id === fileId ? { ...item, status: 'error', progress: 0 } : item)),
				);
				options.onError?.(error instanceof Error ? error : new Error('Upload failed'));
			}
			return null;
		}
	};

	const uploadFiles = async (
		files: File[],
	): Promise<{ name: string; url: string; width: number; height: number }[]> => {
		const filesToUpload = files.slice(0, options.limit);
		const promises = filesToUpload.map((file) => uploadFile(file));
		const results = await Promise.all(promises);
		return results.filter((result): result is { name: string; url: string; width: number; height: number } => result !== null);
	};

	const removeFileItem = (id: string) => {
		setFileItems((prev) => {
			const item = prev.find((item) => item.id === id);
			item?.abortController?.abort();
			return prev.filter((item) => item.id !== id);
		});
	};

	const clearAllFiles = () => {
		fileItems.forEach((item) => item.abortController?.abort());
		setFileItems([]);
	};

	return {
		fileItems,
		uploadFile,
		uploadFiles,
		removeFileItem,
		clearAllFiles,
	};
}
