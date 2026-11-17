// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: 'https://3942cb36c0cd0a96ba89fd5de5818459@o4507820137316352.ingest.de.sentry.io/4507820409094224',
	enableLogs: true,
	sendDefaultPii: true,
	enabled: process.env.NODE_ENV === 'production',
	ignoreErrors: [
		'Error creating WebGL context.',
		'THREE.WebGLRenderer: Error creating WebGL context.',
		/Error creating WebGL context/i,
		/THREE\.WebGLRenderer/i,
	],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
