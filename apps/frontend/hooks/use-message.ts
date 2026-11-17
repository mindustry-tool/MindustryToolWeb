import React from 'react';

type MessageContextType = {
	renderReason: React.MutableRefObject<'fetch' | 'event'>;
	setRenderReason: (reason: 'fetch' | 'event') => void;
};

export const MessageContext = React.createContext<MessageContextType | null>(null);

MessageContext.displayName = 'MessageContext';

export function useMessage() {
	const context = React.use(MessageContext);

	if (!context) {
		throw new Error('Can not use out side of context');
	}

	return context;
}
