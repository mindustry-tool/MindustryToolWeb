import type { MentionNodeAttrs } from '@tiptap/extension-mention';
import type { Editor } from '@tiptap/react';
import type { SuggestionOptions } from '@tiptap/suggestion';
import type { ComponentType } from 'react';
import { computePosition, flip, shift } from '@floating-ui/dom';
import { api } from '@mindustry-tool/api';
import { posToDOMRect, ReactRenderer } from '@tiptap/react';
import { IconSuggestionList, MentionSuggestionList } from '@/components/tiptap/nodes/link-syntax-node/suggestion-list';
import { apiInstance } from '@/config/api';

const renderSuggestion: (
	list: ComponentType<any>,
) => Omit<SuggestionOptions<any, MentionNodeAttrs>, 'editor'>['render'] = type => () => {
	let reactRenderer: any;

	return {
		onStart: (props: any) => {
			if (!props.clientRect) {
				return;
			}

			reactRenderer = new ReactRenderer(type, {
				props,
				editor: props.editor,
			});

			reactRenderer.element.style.position = 'absolute';

			document.body.appendChild(reactRenderer.element);

			updatePosition(props.editor, reactRenderer.element);
		},

		onUpdate(props) {
			reactRenderer.updateProps(props);

			if (!props.clientRect) {
				return;
			}
			updatePosition(props.editor, reactRenderer.element);
		},

		onKeyDown(props) {
			if (props.event.key === 'Escape') {
				reactRenderer.destroy();
				reactRenderer.element.remove();

				return true;
			}

			return reactRenderer.ref?.onKeyDown(props);
		},

		onExit() {
			reactRenderer.destroy();
			reactRenderer.element.remove();
		},
	};
};

export const userSuggestion: Omit<SuggestionOptions<any, MentionNodeAttrs>, 'editor'> = {
	char: '@',
	items: async ({ query }: { query: string; editor: Editor }) => {
		const [data] = await apiInstance.tryRequest(api.v4.users.search, {
			query: {
				q: query,
			},
		});
		return data ?? [];
	},
	render: renderSuggestion(MentionSuggestionList),
};

export const iconSuggestion: Omit<SuggestionOptions<any, MentionNodeAttrs>, 'editor'> = {
	char: ':',
	items: async ({ query }: { query: string; editor: Editor }) => {
		const [data] = await apiInstance.tryRequest(api.v4.icon.get, {
			query: {
				q: query,
				page: 0,
				size: 20,
			},
		});
		return data ?? [];
	},
	render: renderSuggestion(IconSuggestionList),
};

const updatePosition = (editor: Editor, element: HTMLElement) => {
	const virtualElement = {
		getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
	};

	computePosition(virtualElement, element, {
		placement: 'bottom-start',
		strategy: 'absolute',
		middleware: [shift(), flip()],
	}).then(({ x, y, strategy }) => {
		element.style.width = 'max-content';
		element.style.position = strategy;
		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
	});
};
