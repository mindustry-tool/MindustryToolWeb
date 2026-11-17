'use client';

import type { ServerDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ErrorMessage from '@/components/error/error-message';
import { ServerLogCard } from '@/components/server/server-log-card';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '@/components/ui/dialog';
import useSseMutation from '@/hooks/use-sse-mutation';
import { Tran } from '@/i18n/tran';
import { apiInstance } from '@/config/api';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import { AddressButton } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/address-button';

export default function HostButton({ server }: { server: ServerDto }) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const { id } = server;
	const containerRef = useRef<HTMLDivElement>(null);

	const { data: maps } = useQuery({
		queryKey: ['servers', id, 'maps'],
		queryFn: () =>
			apiInstance.request(api.v4.servers.maps.getAll, {
				params: { id },
			}),
	});

	const { data } = useQuery({
		queryKey: ['servers', server.id],
		queryFn: () =>
			apiInstance.request(api.v4.servers.get, {
				params: {
					id: server.id,
				},
			}),
		initialData: server,
	});

	const onOpenChange = (open: boolean) => {
		setOpen(open);
	};

	const { credit } = data || server;

	const {
		data: message,
		isError,
		error,
		isPending,
		mutate,
	} = useSseMutation({
		route: api.v4.servers.host,
		queryKey: ['servers', 'host', id],
		params: {
			id,
		},
		mutation: {
			onMutate: () => setOpen(true),
			onError: (error) => {
				toast.error(String(error));
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ['servers'] });
			},
		},
	});

	function handleHostClick() {
		if (maps === undefined) {
			return toast(<Tran text="loading" />);
		}

		if (maps.length === 0) {
			toast.warning(<Tran text="server.no-map-warning" />, {
				description: (
					<LocalLink className="text-primary underline" href={routes.servers.id({ id }).maps + '?tab=download'}>
						<Tran text="map" />
					</LocalLink>
				),
			});
		}

		if (credit <= 0) {
			return toast.warning(
				<Tran className="text-destructive" text="server.out-of-credit" />,
				{
					description: (
						<LocalLink className="text-primary underline" href={routes.servers.id({ id }).credit}>
							<Tran text="server.add-credit" />
						</LocalLink>
					),
				},
			);
		}

		setOpen(true);

		return mutate({});
	}

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
		}
	}, [message.length]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Button onClick={handleHostClick} disabled={isPending || maps === undefined}>
				<Tran text="server.host" />
			</Button>
			<DialogContent className="sm:max-w-3xl">
				<DialogTitle>
					<Tran text="server.host" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription />
				</VisuallyHidden>
				<div className="h-[70dvh] overflow-y-auto rounded-md bg-black py-2 text-sm text-white" ref={containerRef}>
					{message.map((item, index) => (
						<ServerLogCard key={index} item={item} />
					))}
					{isError && <ErrorMessage error={error} />}
				</div>
				<DialogFooter>
					{isPending ? (
						<Button className="ml-auto">
							<LoadingSpinner />
						</Button>
					) : (
						<>
							<DialogClose asChild>
								<Button className="ml-auto" disabled={isPending}>
									{isPending ? <LoadingSpinner /> : <Tran text="close" />}
								</Button>
							</DialogClose>
							<AddressButton server={server} />
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
