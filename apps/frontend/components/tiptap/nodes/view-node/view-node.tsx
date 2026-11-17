'use client';

import { NodeViewWrapper } from '@tiptap/react';
export function ViewNode({ children, ...props }: React.ComponentProps<typeof NodeViewWrapper>) {
	return <NodeViewWrapper {...props}>{children}</NodeViewWrapper>;
}
