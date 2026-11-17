'use client';

import type { NodeViewProps } from '@tiptap/react';
import type { UploadedImage } from '@/components/forms/media-upload.form';
import { NodeViewWrapper } from '@tiptap/react';
import * as React from 'react';
import { MediaUploadForm } from '@/components/forms/media-upload.form';
import { focusNextNode, isValidPosition } from '@/lib/tiptap-utils';

export const ImageUploadNode: React.FC<NodeViewProps> = (props) => {
	const { accept, limit, maxSize } = props.node.attrs;

	const extension = props.extension;

	const { upload, onSuccess, onError } = extension.options;

	const handleAdd = (images: UploadedImage[]) => {
		if (images.length > 0) {
			const pos = props.getPos();

			if (isValidPosition(pos)) {
				const imageNodes = images.map((image) => {
					const { url, width, height } = image;
					const filename = url.split('/').pop() || 'unknown';

					return {
						type: extension.options.type,
						attrs: {
							...extension.options,
							src: url,
							alt: filename,
							title: filename,
							width,
							height,
						},
					};
				});

				props.editor
					.chain()
					.focus()
					.deleteRange({ from: pos, to: pos + props.node.nodeSize })
					.insertContentAt(pos, imageNodes)
					.run();

				focusNextNode(props.editor);
			}
		}
	};

	return (
		<NodeViewWrapper className="mx-auto my-12" tabIndex={0}>
			<MediaUploadForm
  accept={accept}
  maxSize={maxSize}
  limit={limit}
  onSuccess={onSuccess}
  onError={onError}
  upload={upload}
  handleAdd={handleAdd}
			/>
		</NodeViewWrapper>
	);
};
