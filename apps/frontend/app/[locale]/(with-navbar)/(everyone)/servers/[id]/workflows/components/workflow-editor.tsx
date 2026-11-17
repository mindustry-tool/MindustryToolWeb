'use client';

import HelperLines from '@/components/flow/helper-lines';
import { getHelperLines } from '@/lib/flow.utils';
import { Hydrated } from '@/components/common/hydrated';
import { CatchError } from '@/components/error/catch-error';
import { Identifier } from 'dnd-core';
import { createContext, ReactNode, Suspense, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import {
	Edge,
	EdgeChange,
	MarkerType,
	MiniMap,
	NodeChange,
	ReactFlow,
	ReactFlowInstance,
	Node,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	useReactFlow,
	useViewport,
	OnConnect,
	OnNodeDrag,
} from '@xyflow/react';
import {
	createWorkflowNode,
	nodeTypes,
} from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/node/workflow-node';

type WorkflowEditorContextType = {
	undo: () => void;
	redo: () => void;
};

const WorkflowEditorContext = createContext<WorkflowEditorContextType | null>(null);

export const useWorkflowEditor = () => {
	const context = useContext(WorkflowEditorContext);

	if (!context) {
		throw new Error('useWorkflowEditor must be used within a WorkflowEditorProvider');
	}

	return context;
};

type WorkflowEditorProps = {
	children: ReactNode;
};

export function WorkflowEditor({ children }: WorkflowEditorProps) {
	const [nodes, setNodes] = useState<Node[]>([
		createWorkflowNode(
			{
				x: 0,
				y: 0,
			},
			{
				label: 'Event (PlayerJoin)',
				description: '',
				type: 'start',
				inputs: [],
				outputs: [
					{
						id: '1',
						name: 'Player',
						type: 'output',
						dataType: 'Player',
					},
				],
				typeMap: [],
				consumers: [
					{
						id: '1',
						name: 'Event',
						dataType: 'Class',
					},
				],
				producers: [
					{
						id: '1',
						name: 'Result',
						dataType: 'Object',
						as: 'event',
					},
				],
				config: {},
			},
		),
		{
			id: '2',
			position: {
				x: 0,
				y: 100,
			},
			type: 'workflow',
			data: {
				label: 'Operation ( 1 + 2 * (3 / 4) )',
				description: '',
				nodeType: 'start',
				inputs: [{}],
				outputs: [{}],
				consumers: [],
				producers: [],
				config: {},
			},
		},
		{
			id: '3',
			position: {
				x: 0,
				y: 200,
			},
			type: 'workflow',
			data: {
				label: 'FlowControl (IF)',
				description: '',
				nodeType: 'start',
				inputs: [{}],
				outputs: [{}, {}],
				consumers: [],
				producers: [],
				config: {},
			},
		},
		{
			id: '4',
			position: {
				x: 0,
				y: 300,
			},
			type: 'workflow',
			data: {
				label: 'Action (player.sendMessage)',
				description: '',
				nodeType: 'start',
				inputs: [{}],
				outputs: [{}],
				consumers: [],
				producers: [],
				config: {},
			},
		},
		{
			id: '5',
			position: {
				x: 0,
				y: 400,
			},
			type: 'workflow',
			data: {
				label: 'Others(TryCatchFinally)',
				description: '',
				nodeType: 'start',
				inputs: [{}],
				outputs: [{}, {}, {}],
				consumers: [],
				producers: [],
				config: {},
			},
		},
	]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined);
	const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined);
	const [_rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
	const [nodeHistory, setNodeHistory] = useState<Node[][]>([]);
	const [edgeHistory, setEdgeHistory] = useState<Edge[][]>([[]]);
	const [historyIndex, setHistoryIndex] = useState(0);

	const ref = useRef<HTMLDivElement>(null);
	const viewport = useViewport();

	const { screenToFlowPosition } = useReactFlow();

	const updateHistory = useCallback(
		(newNodes: Node[], newEdges: Edge[]) => {
			const newHistoryIndex = historyIndex + 1;
			setNodeHistory((prev) => [...prev.slice(0, newHistoryIndex), newNodes]);
			setEdgeHistory((prev) => [...prev.slice(0, newHistoryIndex), newEdges]);
			setHistoryIndex(newHistoryIndex);
		},
		[historyIndex],
	);

	const customApplyNodeChanges = useCallback((changes: NodeChange[], nodes: Node[]): Node[] => {
		setHelperLineHorizontal(undefined);
		setHelperLineVertical(undefined);

		if (changes.length === 1 && changes[0]!.type === 'position' && changes[0]!.dragging && changes[0]!.position) {
			const helperLines = getHelperLines(changes[0]!, nodes);

			changes[0]!.position.x = helperLines.snapPosition.x ?? changes[0]!.position.x;
			changes[0]!.position.y = helperLines.snapPosition.y ?? changes[0]!.position.y;

			setHelperLineHorizontal(helperLines.horizontal);
			setHelperLineVertical(helperLines.vertical);
		}

		return applyNodeChanges(changes, nodes);
	}, []);

	const onNodeChange = useCallback(
		(changes: NodeChange[]) => {
			const newNodes = customApplyNodeChanges(changes, nodes);

			setNodes(newNodes);
		},
		[customApplyNodeChanges, nodes],
	);

	const onEdgeChange = useCallback(
		(changes: EdgeChange[]) => {
			const newEdges = applyEdgeChanges(changes, edges);
			setEdges(newEdges);
			updateHistory(nodes, newEdges);
		},
		[edges, updateHistory, nodes],
	);

	const onEdgeConnect: OnConnect = useCallback(
		(params) => {
			const newEdges = addEdge(
				{
					...params,
					animated: true,
					markerEnd: {
						type: MarkerType.ArrowClosed,
					},
				},
				edges,
			);
			setEdges(newEdges);
			updateHistory(nodes, newEdges);
		},
		[edges, updateHistory, nodes],
	);

	const onNodesDelete = useCallback(
		(deleted: Node[]) => {
			const newNodes = nodes.filter((node) => !deleted.some((d) => d.id === node.id));
			const newEdges = edges.filter((edge) => !deleted.some((d) => d.id === edge.source || d.id === edge.target));
			setNodes(newNodes);
			setEdges(newEdges);
			updateHistory(newNodes, newEdges);
		},
		[nodes, edges, updateHistory],
	);

	const onEdgesDelete = useCallback(
		(deleted: Edge[]) => {
			const newEdges = edges.filter((edge) => !deleted.some((d) => d.id === edge.id));
			setEdges(newEdges);
			updateHistory(nodes, newEdges);
		},
		[edges, updateHistory, nodes],
	);

	const onNodeDragStop: OnNodeDrag<Node> = useCallback(
		(_event, node) => {
			const newNodes = nodes.map((n) => (n.id === node.id ? { ...n, position: node.position } : n));
			setNodes(newNodes);
			updateHistory(newNodes, edges);
		},
		[nodes, updateHistory, edges],
	);

	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const newHistoryIndex = historyIndex - 1;
			setNodes(nodeHistory[newHistoryIndex]!);
			setEdges(edgeHistory[newHistoryIndex]!);
			setHistoryIndex(newHistoryIndex);
		}
	}, [historyIndex, nodeHistory, edgeHistory]);

	const redo = useCallback(() => {
		if (historyIndex < nodeHistory.length - 1) {
			const newHistoryIndex = historyIndex + 1;
			setNodes(nodeHistory[newHistoryIndex]!);
			setEdges(edgeHistory[newHistoryIndex]!);
			setHistoryIndex(newHistoryIndex);
		}
	}, [historyIndex, nodeHistory, edgeHistory]);

	const addNode = useCallback(
		(type: string, p?: { x: number; y: number } | undefined | null) => {
			const position = screenToFlowPosition({
				x: p?.x ?? window.innerWidth / 2 - 200,
				y: p?.y ?? window.innerHeight / 2 - 200,
			});

			const id = crypto.randomUUID();

			const newNode: Node = {
				id,
				type: 'workflow',
				data: {
					id,
					name: type,
					state: {
						fields: {},
					},
				},
				position,
			};

			const newNodes = [...nodes, newNode];

			setNodes(newNodes);
			updateHistory(newNodes, edges);
		},
		[nodes, edges, screenToFlowPosition, updateHistory],
	);

	const [{ handlerId }, drop] = useDrop<string, void, { handlerId: Identifier | null }>({
		accept: 'workflow',
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId(),
			};
		},
		drop: (item, monitor) => {
			const position = monitor.getClientOffset();

			addNode(item, position);
		},
	});

	// eslint-disable-next-line react-hooks/refs
	drop(ref);

	const context = useMemo(() => ({ undo, redo }), [undo, redo]);

	return (
		<WorkflowEditorContext.Provider value={context}>
			<ReactFlow
				className="h-full w-full"
				ref={ref}
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				data-handler-id={handlerId}
				onInit={setRfInstance}
				onNodesChange={onNodeChange}
				onEdgesChange={onEdgeChange}
				onConnect={onEdgeConnect}
				onNodesDelete={onNodesDelete}
				onEdgesDelete={onEdgesDelete}
				onNodeDragStop={onNodeDragStop}
				fitView
			>
				<CatchError>
					<Suspense>
						{children}
						<HelperLines horizontal={helperLineHorizontal} vertical={helperLineVertical} />
						<Hydrated>
							<MiniMap />
						</Hydrated>
						<div className="absolute z-50 bottom-0 top-0 right-1 p-1 space-x-1 flex text-sm text-muted-foreground">
							<span>x: {Math.round(viewport.x)}</span>
							<span>y: {Math.round(viewport.y)}</span>
						</div>
					</Suspense>
				</CatchError>
			</ReactFlow>
		</WorkflowEditorContext.Provider>
	);
}
