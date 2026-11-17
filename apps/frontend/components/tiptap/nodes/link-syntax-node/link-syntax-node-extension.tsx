import OriginalMention from '@tiptap/extension-mention';

export const LinkSyntax = OriginalMention.configure({
	HTMLAttributes: {
		class: 'mention',
	},
}).extend({
	group: 'inline',
	inline: true,
	atom: true,
});
