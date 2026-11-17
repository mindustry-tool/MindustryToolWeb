export type WikiNode<T> = {
	index: number;
	segment: string;
	path: string;
	data?: T;
	parent?: WikiNode<T>;
	leaves: Map<string, WikiNode<T>>;
};

export function buildTree<T extends { path: string }>(nodes: T[]): WikiNode<T> {
	const root: WikiNode<T> = { segment: 'ROOT', data: undefined, leaves: new Map(), path: '', index: -1 };

	for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
		const node = nodes[nodeIndex]!;
		const parts = node.path.split('.');
		let currentNode: WikiNode<T> = root;

		for (let index = 0; index < parts.length; index++) {
			const part = parts[index]!;
			const child = currentNode.leaves.get(part);

			if (child) {
				if (index < parts.length - 1) {
					child.data = undefined;
				}
				currentNode = child;
			} else {
				const newChild: WikiNode<T> = {
					segment: part,
					leaves: new Map(),
					path: parts.slice(0, index + 1).join('.'),
					index: nodeIndex,
					parent: currentNode,
				};

				if (index === parts.length - 1) {
					newChild.data = node;
				}

				currentNode.leaves.set(part, newChild);
				currentNode = newChild;
			}
		}
	}

	return root;
}
