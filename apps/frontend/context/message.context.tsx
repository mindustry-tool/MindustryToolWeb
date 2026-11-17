'use client';

import { MessageContext } from '@/hooks/use-message';
import React, { ReactNode, useRef } from 'react';

const MessageProvider = React.memo(({ children }: { children: ReactNode }) => {
	const ref = useRef<'fetch' | 'event'>('fetch');

	const setRenderReason = (reason: 'fetch' | 'event') => {
		ref.current = reason;
	};

	return <MessageContext value={{ renderReason: ref, setRenderReason }}>{children}</MessageContext>;
});

MessageProvider.displayName = 'MessageProvider';

export { MessageProvider };
