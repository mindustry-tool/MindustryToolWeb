import type { Extensions } from '@tiptap/core';

import Heading from '@tiptap/extension-heading';
import { Highlight } from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { StarterKit } from '@tiptap/starter-kit';
import { renderToReactElement } from '@tiptap/static-renderer';
import { v4 } from 'uuid';
import { LinkSyntaxNode } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node';
import { LinkSyntax } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node-extension';
import { ColorHighlighter } from '@/components/tiptap/ui/color-highlighter/color-highlighter';

export type { WikiNode } from './wiki-tree';
export { buildTree } from './wiki-tree';

const HeadingWithId = Heading.extend({
	addAttributes: () => ({
		tocId: {
			default: '',
			parseHTML: element => element.getAttribute('data-toc'),
			renderHTML: () => ({
				'data-toc': true,
				id: v4(),
			}),
		},
	}),
});

export function renderPost(data: string, extensions: Extensions = []) {
	const html = renderToReactElement({
		content: JSON.parse(data),
		extensions: [
			StarterKit.configure({
				heading: false,
				horizontalRule: false,
				link: {
					openOnClick: false,
					enableClickSelection: true,
				},
			}),
			HorizontalRule,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			TaskList,
			TaskItem.configure({ nested: true }),
			Highlight.configure({ multicolor: true }),
			Image.configure({
				inline: true,
				HTMLAttributes: {
					fetchPriority: 'high',
					class: 'rounded-md',
				},
			}),
			Typography,
			Superscript,
			Subscript,
			ColorHighlighter,
			LinkSyntax,
			HeadingWithId,
			TableKit.configure({
				table: { resizable: true },
			}),
			...extensions,
		],
		options: {
			nodeMapping: {
				mention: LinkSyntaxNode,
			},
			unhandledNode: ({ node }) => {
				return node.type.name;
			},
		},
	});

	return html;
}
