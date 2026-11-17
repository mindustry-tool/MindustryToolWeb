import type { AuthFilter } from '@mindustry-tool/api';
import type { Session } from '@mindustry-tool/api';
import type { ReactNode } from 'react';

import { hasAccess } from '@mindustry-tool/api';
import React from 'react';

type Props = {
	filter?: AuthFilter;
	session: Session | null;
	alt?: ReactNode;
	children: ReactNode;
};

function ProtectedElement({ children, alt, filter, session }: Props) {
	return hasAccess(session, filter) ? children : alt;
}

ProtectedElement.displayName = 'ProtectedElement';

export default React.memo(ProtectedElement);
