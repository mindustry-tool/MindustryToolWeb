import { Session } from '@mindustry-tool/api';
import React from "react";

export type SessionState =
	| {
			session: null;
			state: 'loading';
	  }
	| {
			session: Session;
			state: 'authenticated';
	  }
	| {
			session: null;
			state: 'unauthenticated';
	  };

export const defaultContextValue: SessionState = {
	session: null,
	state: 'loading',
};

export const SessionContext = React.createContext<SessionState>(defaultContextValue);

SessionContext.displayName = 'SessionContext';

export function useSession(): SessionState {
	const context = React.use(SessionContext);

	if (!context) {
		throw new Error('Can not use out side of context');
	}
	// TEST
	// const session = context.session;

	// if (session) {
	//   context.session = { ...session, roles: [] };
	// }

	return context;
}
