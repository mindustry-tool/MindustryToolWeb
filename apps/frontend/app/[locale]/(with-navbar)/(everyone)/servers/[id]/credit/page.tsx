'use client';

import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';
import LoginButton from '@/components/buttons/login-button';
import { PageWrapper } from '@/components/common/page-wrapper';
import ErrorMessage from '@/components/error/error-message';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiInstance } from '@/config/api';
import environment from '@/config/environment';
import { useSession } from '@/hooks/use-session';
import { Tran } from '@/i18n/tran';
import { Batcher } from '@/lib/batcher';
import { cn } from '@/lib/utils';
import { api, UserDto } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Tv } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
	const [scriptError, setScriptError] = useState(false);

	return (
		<PageWrapper className="overflow-y-auto items-center justify-center">
			<Script
				async
				src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
				crossOrigin="anonymous"
				onError={() => setScriptError(true)}
			/>
			<div className="p-4 rounded-md bg-card border flex flex-col gap-2 min-w-sm shadow-lg">
				<div className="flex flex-col">
					<span className="text-xl space-x-1">
						<span>$</span>
						<Tran text="server.add-credit" />
					</span>
					<Tran
						className="text-muted-foreground text-sm"
						text="server.credit-description"
					/>
				</div>
				<div className="grid grid-cols-3 gap-2">
					<Button disabled>
						<CreditCard />
						<Tran text="server.buy-credit" />
					</Button>
					<Suspense>
						<ClientProtectedElement alt={<LoginButton />}>
							<TransferCreditButton />
						</ClientProtectedElement>
					</Suspense>
					<Suspense>
						<ClientProtectedElement alt={<LoginButton />}>
							<RewardedAd scriptError={scriptError} />
						</ClientProtectedElement>
					</Suspense>
				</div>
				<span className="text-xs text-muted-foreground">
					<Tran text="server.contact-admin-desc" />
					<Link className="underline text-[#5865F2] ml-1" href={environment.url.discordServer}>
						Discord
					</Link>
				</span>
			</div>
		</PageWrapper>
	);
}

function TransferCreditButton() {
	const { session } = useSession();

	const userId = session!.id;

	const { data, error, isLoading, isError } = useQuery({
		queryKey: ['users', userId],
		queryFn: () => Batcher.user.get(userId),
	});

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<CreditCard />
					<Tran text="server.transfer-credit" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="server.transfer-credit" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription />
				</VisuallyHidden>
				{isLoading ? <LoadingSpinner /> : <TransferCreditForm user={data!} />}
			</DialogContent>
		</Dialog>
	);
}

function TransferCreditForm({ user }: { user: UserDto }) {
	const [amount, setAmount] = useState<number>(0);
	const currentCredit = user.stats.credit || 0;
	const queryClient = useQueryClient();

	const { id } = useParams<{ id: string }>();

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.servers.credit.transfer, {
				params: {
					id,
				},
				body: {
					amount,
				},
			}),
		onError: (error) => {
			toast.error(String(error));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users', user.id] });
			queryClient.invalidateQueries({ queryKey: ['servers', id] });
		},
	});

	const { data } = useServer(id);

	return (
		<div className="flex flex-col gap-4 text-sm">
			<div className="flex flex-col gap-1 text-sm">
				<span>
					<Tran text="current-credit" />: {currentCredit}
				</span>
				<span className="text-sm text-muted-foreground">
					<Tran
						text="server.how-to-get-credit"
					/>
				</span>
				<div>
					<Tran text="server.current-credit" />: {data?.credit || 0}
				</div>
				<span className="text-sm text-muted-foreground">
					<Tran
						className="text-muted-foreground text-sm"
						text="server.credit-description"
					/>
				</span>
				<Tran text="server.amount-transfer" />
				<Input
					className={cn({ 'text-destructive': amount > currentCredit })}
					type="number"
					placeholder="100"
					value={amount}
					onChange={(e) => setAmount(e.target.valueAsNumber)}
					min={1}
				/>
			</div>
			<DialogFooter>
				<Button type="submit" disabled={amount <= 0 || amount > currentCredit || isPending} onClick={() => mutate()}>
					<Tran text="transfer" />
				</Button>
			</DialogFooter>
		</div>
	);
}

type RewardedAdState = 'idle' | 'loading' | 'ready' | 'showing' | 'no-ads' | 'unsupported' | 'error';

const AD_LOAD_TIMEOUT_MS = 5000;

function RewardedAd({ scriptError }: { scriptError: boolean }) {
	const { session } = useSession();
	const queryClient = useQueryClient();
	const userIdRef = useRef<string | undefined>(session?.id);

	useEffect(() => {
		userIdRef.current = session?.id;
	}, [session?.id]);

	const slotRef = useRef<googletag.Slot | null>(null);
	const readyEventRef = useRef<googletag.events.RewardedSlotReadyEvent | null>(null);
	const nonceRef = useRef<string | null>(null);
	const grantedRef = useRef(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const cleanupListenersRef = useRef<(() => void) | null>(null);
	const requestIdRef = useRef(0);

	const [state, setState] = useState<RewardedAdState>('loading');

	const cleanupSlot = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = undefined;
		}
		cleanupListenersRef.current?.();
		cleanupListenersRef.current = null;
		readyEventRef.current = null;

		const activeSlot = slotRef.current;
		slotRef.current = null;
		if (activeSlot && typeof window !== 'undefined') {
			window.googletag = window.googletag || { cmd: [] };
			window.googletag.cmd.push(() => {
				window.googletag.destroySlots([activeSlot]);
			});
		}
	}, []);

	const requestSlot = useCallback(() => {
		if (!environment.adUnit.rewarded || scriptError) {
			return;
		}

		cleanupSlot();
		nonceRef.current = null;
		grantedRef.current = false;
		const requestId = ++requestIdRef.current;

		timeoutRef.current = setTimeout(() => {
			if (requestIdRef.current !== requestId) return;
			cleanupSlot();
			setState('no-ads');
		}, AD_LOAD_TIMEOUT_MS);

		window.googletag = window.googletag || { cmd: [] };
		window.googletag.cmd.push(() => {
			if (requestIdRef.current !== requestId) return;

			const g = window.googletag;
			const slot = g
				.defineOutOfPageSlot(environment.adUnit.rewarded, g.enums.OutOfPageFormat.REWARDED)
				?.addService(g.pubads());

			if (!slot) {
				cleanupSlot();
				setState('unsupported');
				return;
			}

			slotRef.current = slot;

			const onReady = (event: googletag.events.RewardedSlotReadyEvent) => {
				if (requestIdRef.current !== requestId || event.slot !== slot) return;
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = undefined;
				}
				readyEventRef.current = event;
				setState('ready');
			};

			const onRenderEnded = (event: googletag.events.SlotRenderEndedEvent) => {
				if (requestIdRef.current !== requestId || event.slot !== slot) return;
				if (event.isEmpty) {
					cleanupSlot();
					setState('no-ads');
				}
			};

			const onGranted = async (event: googletag.events.RewardedSlotGrantedEvent) => {
				if (requestIdRef.current !== requestId || event.slot !== slot) return;
				grantedRef.current = true;
				const nonce = nonceRef.current;
				nonceRef.current = null;

				if (!nonce) {
					toast.error(<Tran text="server.ad-claim-failed" />);
					return;
				}

				try {
					const result = await apiInstance.request(api.v4.users.me.ads.claim, {
						body: { nonce },
					});
					toast.success(<Tran text="server.ad-reward-earned" args={{ credits: result.granted }} />);
					const currentUserId = userIdRef.current;
					if (currentUserId) {
						queryClient.invalidateQueries({ queryKey: ['users', currentUserId] });
					}
				} catch (error) {
					toast.error(<Tran text="server.ad-claim-failed" />, {
						description: error instanceof Error ? error.message : String(error),
					});
				}
			};

			const onClosed = (event: googletag.events.RewardedSlotClosedEvent) => {
				if (requestIdRef.current !== requestId || event.slot !== slot) return;
				if (!grantedRef.current) {
					toast.info(<Tran text="server.ad-closed-no-reward" />);
				}
				cleanupSlot();
				setState('idle');
			};

			const pubads = g.pubads();
			pubads.addEventListener('rewardedSlotReady', onReady);
			pubads.addEventListener('slotRenderEnded', onRenderEnded);
			pubads.addEventListener('rewardedSlotGranted', onGranted);
			pubads.addEventListener('rewardedSlotClosed', onClosed);

			cleanupListenersRef.current = () => {
				pubads.removeEventListener('rewardedSlotReady', onReady);
				pubads.removeEventListener('slotRenderEnded', onRenderEnded);
				pubads.removeEventListener('rewardedSlotGranted', onGranted);
				pubads.removeEventListener('rewardedSlotClosed', onClosed);
			};

			g.enableServices();
			g.display(slot);
		});
	}, [cleanupSlot, queryClient, scriptError]);

	useEffect(() => {
		if (!environment.adUnit.rewarded || scriptError) {
			requestIdRef.current += 1;
			cleanupSlot();
			return;
		}
		requestSlot();
		return () => {
			requestIdRef.current += 1;
			cleanupSlot();
		};
	}, [requestSlot, cleanupSlot, scriptError]);

	const effectiveState: RewardedAdState = !environment.adUnit.rewarded
		? 'unsupported'
		: scriptError
			? 'error'
			: state;

	if (effectiveState === 'unsupported') {
		return <span><Tran text="server.unsupported" /></span>;
	}

	const handleClick = async () => {
		if (effectiveState === 'idle' || effectiveState === 'no-ads' || effectiveState === 'error') {
			setState('loading');
			requestSlot();
			return;
		}
		if (effectiveState !== 'ready') return;

		const readyEvent = readyEventRef.current;
		if (!readyEvent) {
			setState('loading');
			requestSlot();
			return;
		}

		setState('showing');
		try {
			const { nonce } = await apiInstance.request(api.v4.users.me.ads.session, {});
			nonceRef.current = nonce;
			const shown = readyEvent.makeRewardedVisible();
			if (!shown) {
				nonceRef.current = null;
				cleanupSlot();
				setState('error');
				toast.error(<Tran text="server.ad-load-failed" />);
			}
		} catch (error) {
			nonceRef.current = null;
			setState('ready');
			toast.error(<Tran text="server.ad-claim-failed" />, {
				description: error instanceof Error ? error.message : String(error),
			});
		}
	};

	return (
		<Button
			variant="secondary"
			disabled={effectiveState === 'loading' || effectiveState === 'showing'}
			onClick={handleClick}
		>
			{effectiveState === 'no-ads' ? (
				<Tran text="server.no-ads" />
			) : effectiveState === 'error' ? (
				<Tran text="server.ad-load-failed" />
			) : effectiveState === 'idle' ? (
				<>
					<Tv />
					<Tran text="server.retry-ads" />
				</>
			) : effectiveState === 'ready' || effectiveState === 'showing' ? (
				<>
					<Tv />
					<Tran text="server.watch-ads" />
					+$60
				</>
			) : (
				<>
					<LoadingSpinner className="m-0" />
					<Tran text="server.finding-ads" />
				</>
			)}
		</Button>
	);
}
