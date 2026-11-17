import environment from '@/config/environment';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Handles image upload with progress tracking and abort capability
 * @param file The file to upload
 * @param onProgress Optional callback for tracking upload progress
 * @param abortSignal Optional AbortSignal for cancelling the upload
 * @returns Promise resolving to the URL of the uploaded image
 */
export const handleImageUpload = async (
	{ file, width, height }: { file: File, width: number, height: number },
	onProgress?: (event: { progress: number }) => void,
	abortSignal?: AbortSignal,
): Promise<string> => {
	// Validate file
	if (!file) {
		throw new Error('No file provided');
	}

	if (file.size > MAX_FILE_SIZE) {
		throw new Error(`File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`);
	}

	const form = new FormData();
	form.append('image', file);
	form.append('name', file.name);
	form.append('width', String(width));
	form.append('height', String(height));

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', `${environment.url.apiV4}/media`);

		xhr.withCredentials = true;
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				const percentComplete = (event.loaded / event.total) * 100;
				onProgress?.({ progress: percentComplete });
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
			 resolve(xhr.responseText); // return response as string
			} else {
				reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
			}
		};

		xhr.onerror = () => reject(new Error('Network error'));
		xhr.onabort = () => reject(new Error('Upload aborted'));

		if (abortSignal) {
			if (abortSignal.aborted) {
				xhr.abort();
				reject(new Error('Upload aborted by abortSignal'));
				return;
			}
			abortSignal.addEventListener('abort', () => {
				xhr.abort();
				reject(new Error('Upload aborted by abortSignal'));
			});
		}
		xhr.send(form);
	});
};