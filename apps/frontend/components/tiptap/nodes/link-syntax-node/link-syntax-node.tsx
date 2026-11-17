import { LocalLink } from '@/components/common/locale-link';
import { ViewNode } from '@/components/tiptap/nodes/view-node/view-node';
import { routes } from '@/config/routes';

export function LinkSyntaxNode(props: any) {
	const { mentionSuggestionChar, id, label } = props.node.attrs as {
		mentionSuggestionChar: string;
		id: string;
		label: string;
	};

	if (mentionSuggestionChar === ':') {
		return (
			<ViewNode
				className="not-prose inline aspect-square size-6 object-cover"
				as="img"
				src={label}
				alt={id}
				width={24}
				height={24}
			/>
		);
	}

	return (
		<ViewNode className="not-prose" as="span">
			<LocalLink className="text-primary underline-offset-4" href={routes.users.id({ id })}>
				{mentionSuggestionChar}
				{label}
			</LocalLink>
		</ViewNode>
	);
}
