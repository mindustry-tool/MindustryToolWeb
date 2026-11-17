'use client';

import type { Placement } from '@floating-ui/dom';

import type { Editor } from '@tiptap/react';
// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

import { computePosition, flip, shift } from '@floating-ui/dom';
import { ReactRenderer } from '@tiptap/react';

import { Plus, Table } from 'lucide-react';
import * as React from 'react';
// --- Icons ---
import { ChevronDownIcon } from '@/components/icons/chevron-down-icon';
import { InsertTableDialog } from '@/components/tiptap/ui/table-dropdown-menu.tsx/insert-table-dialog';
import { TableButton } from '@/components/tiptap/ui/table-dropdown-menu.tsx/table-button';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';

type UseTableDropdownMenuConfig = {
	editor?: Editor | null;
};

export type TableDropdownMenuProps = {
	/**
	 * Whether to render the dropdown menu in a portal
	 * @default false
	 */
	portal?: boolean;
	/**
	 * Callback for when the dropdown opens or closes
	 */
	onOpenChange?: (isOpen: boolean) => void;
} & Omit<ButtonProps, 'type'> &
	UseTableDropdownMenuConfig;

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useTableDropdownMenu` hook instead.
 */

export const TableDropdownMenu = ({
	ref,
	editor: providedEditor,
	...buttonProps
}: TableDropdownMenuProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const { editor } = useTiptapEditor(providedEditor);
	const { t } = useI18n('tiptap');
	const [isOpen, setIsOpen] = React.useState(false);

	const handleOpenChange = React.useCallback(
		(open: boolean) => {
			if (!editor) {
				return;
			}
			setIsOpen(open);
		},
		[editor],
	);

	React.useEffect(() => {
		if (!editor) {
			return;
		}

		const renders: MenuRenderer<{ editor: Editor }>[] = [
			//
			new MenuRenderer('left', CellLeftFloatingMenu),
			new MenuRenderer('right', CellRightFloatingMenu),
			new MenuRenderer('top', CellTopFloatingMenu),
			new MenuRenderer('bottom', CellBottomFloatingMenu),
		];

		const selectionUpdate = () => {
			const { state, view } = editor;
			const { selection } = state;
			const $pos = selection.$anchor;

			for (const render of renders) {
				if (render.isDestroyed()) {
					render.create(editor);
				}
			}

			// Check if inside a table cell
			const cell = $pos.node(-1); // parent at depth -1
			if (cell?.type.name === 'tableCell' || cell?.type.name === 'tableHeader') {
				const cellPos = $pos.before(-1);
				const domNode = view.nodeDOM(cellPos) as HTMLElement | null;

				if (domNode) {
					for (const render of renders) {
						render.update(domNode);
					}
				}
			} else {
				for (const render of renders) {
					render.destroy();
				}
			}
		};

		setTimeout(() => {
			editor.on('selectionUpdate', selectionUpdate);
		});
		return () => {
			editor.off('selectionUpdate', selectionUpdate);

			for (const render of renders) {
				render.destroy();
			}
		};
	}, [editor]);

	return (
		<DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild tabIndex={-1}>
				<Button
					className="gap-0"
					type="button"
					data-style="ghost"
					role="button"
					tabIndex={-1}
				aria-label={t('format-as-heading')}
				tooltip={t('table')}
					ref={ref}
					variant="ghost"
					size="sm"
					{...buttonProps}
				>
					<Table />
					<ChevronDownIcon />
				</Button>
			</DropdownMenuTrigger>
			<React.Suspense>
				<DropdownMenuContent className="grid max-h-[50vh] min-w-0 overflow-y-auto" align="start">
					{editor && (
						<>
							<InsertTableDialog
								onSubmit={({ rows, columns }) =>
									editor.chain().focus().insertTable({ rows, cols: columns, withHeaderRow: false }).run()
								}
							/>

							<TableButton
								onClick={() => editor.chain().focus().addColumnBefore().run()}
								disabled={!editor.can().addColumnBefore()}
							>
								<Tran text="editor.add-column-before" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().addColumnAfter().run()}
								disabled={!editor.can().addColumnAfter()}
							>
								<Tran text="editor.add-column-after" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().deleteColumn().run()}
								disabled={!editor.can().deleteColumn()}
							>
								<Tran text="editor.delete-column" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().addRowBefore().run()}
								disabled={!editor.can().addRowBefore()}
							>
								<Tran text="editor.add-row-before" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().addRowAfter().run()}
								disabled={!editor.can().addRowAfter()}
							>
								<Tran text="editor.add-row-after" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().deleteRow().run()}
								disabled={!editor.can().deleteRow()}
							>
								<Tran text="editor.delete-row" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().deleteTable().run()}
								disabled={!editor.can().deleteTable()}
							>
								<Tran text="editor.delete-table" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().mergeCells().run()}
								disabled={!editor.can().mergeCells()}
							>
								<Tran text="editor.merge-cells" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().splitCell().run()}
								disabled={!editor.can().splitCell()}
							>
								<Tran text="editor.split-cell" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
								disabled={!editor.can().toggleHeaderColumn()}
							>
								<Tran text="editor.toggle-header-column" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().toggleHeaderRow().run()}
								disabled={!editor.can().toggleHeaderRow()}
							>
								<Tran text="editor.toggle-header-row" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().toggleHeaderCell().run()}
								disabled={!editor.can().toggleHeaderCell()}
							>
								<Tran text="editor.toggle-header-cell" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().mergeOrSplit().run()}
								disabled={!editor.can().mergeOrSplit()}
							>
								<Tran text="editor.merge-or-split" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#FAF594').run()}
								disabled={!editor.can().setCellAttribute('backgroundColor', '#FAF594')}
							>
								<Tran text="editor.set-cell-attribute" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().fixTables().run()}
								disabled={!editor.can().fixTables()}
							>
								<Tran text="editor.fix-tables" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().goToNextCell().run()}
								disabled={!editor.can().goToNextCell()}
							>
								<Tran text="editor.go-to-next-cell" />
							</TableButton>
							<TableButton
								onClick={() => editor.chain().focus().goToPreviousCell().run()}
								disabled={!editor.can().goToPreviousCell()}
							>
								<Tran text="editor.go-to-previous-cell" />
							</TableButton>
						</>
					)}
				</DropdownMenuContent>
			</React.Suspense>
		</DropdownMenu>
	);
};

function CellLeftFloatingMenu({ editor }: { editor: Editor }) {
	return (
		<Button
			tabIndex={-1}
			onClick={() => editor.chain().focus().addColumnBefore().run()}
			disabled={!editor.can().addColumnBefore()}
			variant="ghost"
			size="icon"
		>
			<Plus />
		</Button>
	);
}

function CellRightFloatingMenu({ editor }: { editor: Editor }) {
	return (
		<Button
			tabIndex={-1}
			onClick={() => editor.chain().focus().addColumnAfter().run()}
			disabled={!editor.can().addColumnAfter()}
			variant="ghost"
			size="icon"
		>
			<Plus />
		</Button>
	);
}

function CellTopFloatingMenu({ editor }: { editor: Editor }) {
	return (
		<Button
			tabIndex={-1}
			onClick={() => editor.chain().focus().addRowBefore().run()}
			disabled={!editor.can().addRowBefore()}
			variant="ghost"
			size="icon"
		>
			<Plus />
		</Button>
	);
}

function CellBottomFloatingMenu({ editor }: { editor: Editor }) {
	return (
		<Button
			tabIndex={-1}
			onClick={() => editor.chain().focus().addRowAfter().run()}
			disabled={!editor.can().addRowAfter()}
			variant="ghost"
			size="icon"
		>
			<Plus />
		</Button>
	);
}

export class MenuRenderer<P extends { editor: Editor }> {
	reactRenderer: ReactRenderer<React.ComponentType<P>, Record<string, unknown>> | undefined;
	placement: Placement;
	component: React.ComponentType<P>;

	constructor(placement: Placement, component: React.ComponentType<P>) {
		this.placement = placement;
		this.component = component;
	}

	create(editor: Editor) {
		this.reactRenderer = new ReactRenderer(this.component, {
			props: { editor },
			editor,
		});

		(this.reactRenderer.element as HTMLDivElement).style.position = 'absolute';

		document.body.appendChild(this.reactRenderer.element);
	}

	update(anchor: HTMLElement) {
		if (!this.reactRenderer) {
			throw new Error('Render is not created');
		}

		const reactRenderer = this.reactRenderer;

		computePosition(anchor, reactRenderer.element as HTMLElement, {
			placement: this.placement,
			strategy: 'absolute',
			middleware: [shift(), flip()],
		}).then(({ x, y, strategy }) => {
			(reactRenderer.element as HTMLElement).style.width = 'max-content';
			(reactRenderer.element as HTMLElement).style.position = strategy;
			(reactRenderer.element as HTMLElement).style.left = `${x}px`;
			(reactRenderer.element as HTMLElement).style.top = `${y}px`;
		});
	}

	destroy() {
		if (this.reactRenderer) {
			this.reactRenderer.destroy();
			this.reactRenderer.element.remove();
			this.reactRenderer = undefined;
		}
	}

	isDestroyed() {
		return this.reactRenderer === undefined;
	}
}

TableDropdownMenu.displayName = 'TableDropdownMenu';

export default TableDropdownMenu;
