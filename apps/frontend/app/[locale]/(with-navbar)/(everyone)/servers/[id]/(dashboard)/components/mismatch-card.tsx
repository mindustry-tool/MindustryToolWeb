'use client';

import { ApiItem } from '@/components/query/api-item';
import { Tran } from '@/i18n/tran';
import { api } from '@mindustry-tool/api';
import { ServerDto } from '@mindustry-tool/api';
import React, { useMemo } from 'react';

export default function MismatchCard({ server }: { server: ServerDto }) {
	const { id } = server;
	const mismatchQueryKey = useMemo(() => ['servers', id, 'mismatch'], [id]);

	return (
		<ApiItem
			route={api.v4.servers.findMismatch}
			queryKey={mismatchQueryKey}
			params={{ id }}
			empty={() => undefined}
            error={(error) => (
                <div className="bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                    <Tran text="common.error" />
                    {error.message}
                </div>
            )}
		>
			{(items) => (
				<div className="flex flex-wrap text-xs gap-y-2">
					<div className="bg-primary/20 text-primary px-2 py-0.5 rounded-full mr-2">
						<Tran text="server.restart-required" />
					</div>
					{items.map(({ field, expected, current }) => (
						<React.Fragment key={field}>
							<span className="bg-destructive/20 text-destructive pl-2 py-0.5 rounded-l-full">{`Field: ${field}`}</span>
							<span className="bg-destructive/20 text-destructive py-0.5 px-1">{`Current: ${current}`}</span>
							<span className="bg-destructive/20 text-destructive pr-2 py-0.5 rounded-r-full mr-2">{`Expected: ${expected}`}</span>
						</React.Fragment>
					))}
				</div>
			)}
		</ApiItem>
	);
}
