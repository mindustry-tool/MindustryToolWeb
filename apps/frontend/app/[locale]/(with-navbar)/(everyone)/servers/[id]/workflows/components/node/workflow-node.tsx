import { CatchError } from '@/components/error/catch-error';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Handle, HandleConnection, Position, useNodeConnections, useReactFlow } from '@xyflow/react';

export type NodeIO = {
	id: string; // unique port id (for React Flow handle)
	name: string; // display name, e.g. "A" or "value"
	type: 'input' | 'output';
	dataType: string;
};

export type Consumer = {
	id: string; // unique port id (for React Flow handle)
	name: string; // display name, e.g. "A" or "value"
	defaultValue?: string;
	values?: string[];
	dataType: string;
};

export type Producer = {
	id: string; // unique port id (for React Flow handle)
	name: string; // display name, e.g. "A" or "value"
	as: string;
	dataType: string;
};

export type TypeMap = {
	consumer: string;
	producer: string;
	values: Record<string, string>;
};

export type WorkflowNodeData = {
	type: string;
	label: string; // display label (e.g. "Set Variable")
	description: string; // tooltip or hover text
	inputs: NodeIO[]; // visual input connectors
	outputs: NodeIO[]; // visual output connectors
	consumers: Consumer[];
	producers: Producer[];
	typeMap: TypeMap[];
	config: Record<string, unknown>; // editable config (value, operator, etc.)
};

export type WorkflowNode = {
	id: string; // unique node id
	type: 'workflow'; // for React Flow component mapping
	position: { x: number; y: number };
	data: WorkflowNodeData;
};

export function createWorkflowNode(position: { x: number; y: number }, data: WorkflowNodeData): WorkflowNode {
	return {
		id: crypto.randomUUID(),
		type: 'workflow',
		position,
		data,
	};
}

export const nodeTypes = {
	workflow: WorkflowNode,
} as const;

export function WorkflowNode({ data }: { data: WorkflowNodeData }) {
	const { label, description, inputs, outputs, consumers, producers } = data;

	return (
		<CatchError>
			<div className="rounded-xl p-2 min-w-35 border bg-card flex flex-col gap-2 shadow-lg">
				<div className="font-bold mb-1">{label}</div>
				{description && <div className="text-xs opacity-70">{description}</div>}
				{consumers.length > 0 && (
					<>
						<Separator />
						<div className="flex flex-wrap gap-2">
							{consumers.map((consumer) => (
								<Consumer key={consumer.id} consumer={consumer} />
							))}
						</div>
					</>
				)}
				{producers.length > 0 && (
					<>
						<Separator />
						<div className="flex flex-wrap gap-2">
							{producers.map((producer) => (
								<Producer key={producer.id} producer={producer} />
							))}
						</div>
					</>
				)}
				{inputs?.map((_, index, inputs) => (
					<InputHandle index={index} offset={index - (inputs.length - 1) / 2} key={index} parentId={''} />
				))}
				{outputs?.map((output, index, outputs) => (
					<OutputHandle key={index} index={index} parentId={''} offset={index - (outputs.length - 1) / 2} {...output} />
				))}
			</div>
		</CatchError>
	);
}

function Consumer({ consumer }: { consumer: Consumer }) {
	const { name, defaultValue } = consumer;
	return (
		<div className="flex gap-3 items-center w-full">
			<span className="min-w-14">{name}</span>
			<Input className="ml-auto" defaultValue={defaultValue} />
		</div>
	);
}

function Producer({ producer }: { producer: Producer }) {
	const { name, as } = producer;

	return (
		<div className="flex gap-3 items-center w-full">
			<span className="min-w-14">{name}</span>
			<Input className="ml-auto" defaultValue={as} />
		</div>
	);
}

function OutputHandle({ parentId, offset, index }: { parentId: string; offset: number; index: number }) {
	const { setEdges } = useReactFlow();

	const id = `${parentId}-source-handle-${index}`;

	const connections = useNodeConnections({
		handleType: 'source',
		handleId: id,
		onConnect(connections: HandleConnection[]) {
			setEdges((prevEdges) => prevEdges.map((edge) => (edge.id === connections[0]!.edgeId ? { ...edge } : edge)));
		},
	});

	return (
		<Handle
			className="size-3 bg-emerald-500 -right-2"
			id={id}
			type="source"
			style={{ marginTop: offset * 20 + 'px' }}
			position={Position.Right}
			isConnectable={connections.length < 1}
		/>
	);
}

function InputHandle({ parentId, offset, index }: { parentId: string; offset: number; index: number }) {
	const id = `${parentId}-target-handle-${index}`;

	return (
		<Handle
			className="size-3 bg-blue-400 -left-2"
			id={id}
			style={{ marginTop: offset * 20 + 'px' }}
			type={'target'}
			position={Position.Left}
			isConnectable={true}
		/>
	);
}
