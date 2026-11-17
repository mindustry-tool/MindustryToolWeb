'use client';

import '@xyflow/react/dist/style.css';
import './components/workflow.module.css';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Background, ReactFlowProvider } from '@xyflow/react';
import { WorkflowEditor } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/workflow-editor';

export default function Page() {
	return (
		<ReactFlowProvider>
			<div className="w-full h-full">
				<DndProvider backend={HTML5Backend}>
					<WorkflowEditor>
						<Background />
					</WorkflowEditor>
				</DndProvider>
			</div>
		</ReactFlowProvider>
	);
}
