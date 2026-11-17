import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import { Selection } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { renderToReactElement } from '@tiptap/static-renderer';
import { LinkSyntaxNode } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node';
import { LinkSyntax } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node-extension';
import { ColorHighlighter } from '@/components/tiptap/ui/color-highlighter/color-highlighter';

export function CommentContent({ content }: { content: string }) {
	let component;

	try {
		component = renderToReactElement({
			content: JSON.parse(content),
			extensions: [
				StarterKit.configure({
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
						class: 'resizable rounded-md',
					},
				}),
				Typography,
				Superscript,
				Subscript,
				Selection,
				ColorHighlighter,
				LinkSyntax,
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
	} catch (e) {
		component = content;
		console.error(e);
	}
	return component;
}
