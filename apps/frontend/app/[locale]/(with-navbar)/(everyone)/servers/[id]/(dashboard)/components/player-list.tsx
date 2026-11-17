'use client';

import { EllipsisButton } from '@/components/buttons/ellipsis-button';
import ColorText from '@/components/common/color-text';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { AdminButton } from '@/components/server/admin-button';
import { BanButton } from '@/components/server/ban-button';
import { KickButton } from '@/components/server/kick-button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@mindustry-tool/api';
import { PlayerDto, ServerDto } from '@mindustry-tool/api';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

export default function PlayerList({ server }: { server: ServerDto }) {
	const { id, players } = server;

	const playersQueryKey = useMemo(() => ['servers', id, 'players'], [id]);

	return (
		<div className="flex gap-2 flex-col">
			<ApiItem
				refetchOnWindowFocus="always"
				refetchOnMount="always"
				route={api.v4.servers.players.getAll}
				params={{ id }}
				queryKey={playersQueryKey}
				loading={() => (
					<Skeletons number={players}>
						<Skeleton className="flex gap-2 items-center bg-card rounded-md px-2 border h-10 w-full" />
					</Skeletons>
				)}
				empty={() => undefined}
			>
				{(players) =>
					players
						.sort((a, b) => a.name.localeCompare(b.name))
						.sort((a, b) => a.team.name.localeCompare(b.team.name))
						.map((player) => <PlayerCard key={player.uuid} player={player} />)
				}
			</ApiItem>
		</div>
	);
}

function PlayerCard({ player }: { player: PlayerDto }) {
	const { id } = useParams<{ id: string }>();
	const { locale, name, team, isAdmin, joinedAt } = player;
	const flag = localeToFlag[getCountryCode(locale ?? 'EN')] ?? locale;

	return (
		<div className="flex gap-2 items-center rounded-md px-2 border h-10 bg-card">
			<div className="rounded-full size-2" style={{ backgroundColor: `#${team.color}` }} />
			<div className="flex gap-1 justify-between items-center w-full">
				<span className="flex gap-1 justify-center items-center">
					<span>{flag}</span>
					<ColorText className="font-semibold mix-blend-difference text-xs" text={name} />
					{isAdmin && ''}
				</span>
				<div className="flex gap-2 items-center">
					<TimeFrom time={joinedAt} />
					<EllipsisButton variant="ghost">
						<KickButton serverId={id} player={player} />
						<BanButton serverId={id} player={player} />
						<AdminButton serverId={id} player={player} />
					</EllipsisButton>
				</div>
			</div>
		</div>
	);
}

function TimeFrom({ time }: { time: number }) {
	const [relative, setRelative] = useState('');

	useInterval(() => {
		const now = Date.now();
		const diff = now - time;
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			setRelative(`${days}d${hours % 24}h${minutes % 60}m`);
		} else if (hours > 0) {
			setRelative(`${hours}h${minutes % 60}m`);
		} else if (minutes > 0) {
			setRelative(`${minutes}m`);
		} else if (seconds > 0) {
			setRelative(`${seconds}s`);
		}
	}, 1000);

	return <span className="text-muted-foreground text-sm">{relative}</span>;
}

const localeToFlag: Record<string, string> = {
	EN: '🇬🇧',
	AD: '🇦🇩',
	AE: '🇦🇪',
	AF: '🇦🇫',
	AG: '🇦🇬',
	AI: '🇦🇮',
	AL: '🇦🇱',
	AM: '🇦🇲',
	AO: '🇦🇴',
	AQ: '🇦🇶',
	AR: '🇦🇷',
	AS: '🇦🇸',
	AT: '🇦🇹',
	AU: '🇦🇺',
	AW: '🇦🇼',
	AX: '🇦🇽',
	AZ: '🇦🇿',
	BA: '🇧🇦',
	BB: '🇧🇧',
	BD: '🇧🇩',
	BE: '🇧🇪',
	BF: '🇧🇫',
	BG: '🇧🇬',
	BH: '🇧🇭',
	BI: '🇧🇮',
	BJ: '🇧🇯',
	BL: '🇧🇱',
	BM: '🇧🇲',
	BN: '🇧🇳',
	BO: '🇧🇴',
	BQ: '🇧🇶',
	BR: '🇧🇷',
	BS: '🇧🇸',
	BT: '🇧🇹',
	BV: '🇧🇻',
	BW: '🇧🇼',
	BY: '🇧🇾',
	BZ: '🇧🇿',
	CA: '🇨🇦',
	CC: '🇨🇨',
	CD: '🇨🇩',
	CF: '🇨🇫',
	CG: '🇨🇬',
	CH: '🇨🇭',
	CI: '🇨🇮',
	CK: '🇨🇰',
	CL: '🇨🇱',
	CM: '🇨🇲',
	CN: '🇨🇳',
	CO: '🇨🇴',
	CR: '🇨🇷',
	CU: '🇨🇺',
	CV: '🇨🇻',
	CW: '🇨🇼',
	CX: '🇨🇽',
	CY: '🇨🇾',
	CZ: '🇨🇿',
	DE: '🇩🇪',
	DJ: '🇩🇯',
	DK: '🇩🇰',
	DM: '🇩🇲',
	DO: '🇩🇴',
	DZ: '🇩🇿',
	EC: '🇪🇨',
	EE: '🇪🇪',
	EG: '🇪🇬',
	EH: '🇪🇭',
	ER: '🇪🇷',
	ES: '🇪🇸',
	ET: '🇪🇹',
	FI: '🇫🇮',
	FJ: '🇫🇯',
	FK: '🇫🇰',
	FM: '🇫🇲',
	FO: '🇫🇴',
	FR: '🇫🇷',
	GA: '🇬🇦',
	GB: '🇬🇧',
	GD: '🇬🇩',
	GE: '🇬🇪',
	GF: '🇬🇫',
	GG: '🇬🇬',
	GH: '🇬🇭',
	GI: '🇬🇮',
	GL: '🇬🇱',
	GM: '🇬🇲',
	GN: '🇬🇳',
	GP: '🇬🇵',
	GQ: '🇬🇶',
	GR: '🇬🇷',
	GS: '🇬🇸',
	GT: '🇬🇹',
	GU: '🇬🇺',
	GW: '🇬🇼',
	GY: '🇬🇾',
	HK: '🇭🇰',
	HM: '🇭🇲',
	HN: '🇭🇳',
	HR: '🇭🇷',
	HT: '🇭🇹',
	HU: '🇭🇺',
	ID: '🇮🇩',
	IE: '🇮🇪',
	IL: '🇮🇱',
	IM: '🇮🇲',
	IN: '🇮🇳',
	IO: '🇮🇴',
	IQ: '🇮🇶',
	IR: '🇮🇷',
	IS: '🇮🇸',
	IT: '🇮🇹',
	JE: '🇯🇪',
	JM: '🇯🇲',
	JO: '🇯🇴',
	JA: '🇯🇵',
	JP: '🇯🇵',
	KE: '🇰🇪',
	KG: '🇰🇬',
	KH: '🇰🇭',
	KI: '🇰🇮',
	KM: '🇰🇲',
	KN: '🇰🇳',
	KP: '🇰🇵',
	KR: '🇰🇷',
	KO: '🇰🇷',
	KW: '🇰🇼',
	KY: '🇰🇾',
	KZ: '🇰🇿',
	LA: '🇱🇦',
	LB: '🇱🇧',
	LC: '🇱🇨',
	LI: '🇱🇮',
	LK: '🇱🇰',
	LR: '🇱🇷',
	LS: '🇱🇸',
	LT: '🇱🇹',
	LU: '🇱🇺',
	LV: '🇱🇻',
	LY: '🇱🇾',
	MA: '🇲🇦',
	MC: '🇲🇨',
	MD: '🇲🇩',
	ME: '🇲🇪',
	MF: '🇲🇫',
	MG: '🇲🇬',
	MH: '🇲🇭',
	MK: '🇲🇰',
	ML: '🇲🇱',
	MM: '🇲🇲',
	MN: '🇲🇳',
	MO: '🇲🇴',
	MP: '🇲🇵',
	MQ: '🇲🇶',
	MR: '🇲🇷',
	MS: '🇲🇸',
	MT: '🇲🇹',
	MU: '🇲🇺',
	MV: '🇲🇻',
	MW: '🇲🇼',
	MX: '🇲🇽',
	MY: '🇲🇾',
	MZ: '🇲🇿',
	NA: '🇳🇦',
	NC: '🇳🇨',
	NE: '🇳🇪',
	NF: '🇳🇫',
	NG: '🇳🇬',
	NI: '🇳🇮',
	NL: '🇳🇱',
	NO: '🇳🇴',
	NP: '🇳🇵',
	NR: '🇳🇷',
	NU: '🇳🇺',
	NZ: '🇳🇿',
	OM: '🇴🇲',
	PA: '🇵🇦',
	PE: '🇵🇪',
	PF: '🇵🇫',
	PG: '🇵🇬',
	PH: '🇵🇭',
	PK: '🇵🇰',
	PL: '🇵🇱',
	PM: '🇵🇲',
	PN: '🇵🇳',
	PR: '🇵🇷',
	PS: '🇵🇸',
	PT: '🇵🇹',
	PW: '🇵🇼',
	PY: '🇵🇾',
	QA: '🇶🇦',
	RE: '🇷🇪',
	RO: '🇷🇴',
	RS: '🇷🇸',
	RU: '🇷🇺',
	RW: '🇷🇼',
	SA: '🇸🇦',
	SB: '🇸🇧',
	SC: '🇸🇨',
	SD: '🇸🇩',
	SE: '🇸🇪',
	SG: '🇸🇬',
	SH: '🇸🇭',
	SI: '🇸🇮',
	SJ: '🇸🇯',
	SK: '🇸🇰',
	SL: '🇸🇱',
	SM: '🇸🇲',
	SN: '🇸🇳',
	SO: '🇸🇴',
	SR: '🇸🇷',
	SS: '🇸🇸',
	ST: '🇸🇹',
	SV: '🇸🇻',
	SX: '🇸🇽',
	SY: '🇸🇾',
	SZ: '🇸🇿',
	TC: '🇹🇨',
	TD: '🇹🇩',
	TF: '🇹🇫',
	TG: '🇹🇬',
	TH: '🇹🇭',
	TJ: '🇹🇯',
	TK: '🇹🇰',
	TL: '🇹🇱',
	TM: '🇹🇲',
	TN: '🇹🇳',
	TO: '🇹🇴',
	TR: '🇹🇷',
	TT: '🇹🇹',
	TV: '🇹🇻',
	TW: '🇹🇼',
	TZ: '🇹🇿',
	UA: '🇺🇦',
	UG: '🇺🇬',
	UM: '🇺🇲',
	US: '🇺🇸',
	UY: '🇺🇾',
	UZ: '🇺🇿',
	VA: '🇻🇦',
	VC: '🇻🇨',
	VE: '🇻🇪',
	VG: '🇻🇬',
	VI: '🇻🇳',
	VN: '🇻🇳',
	VU: '🇻🇺',
	WF: '🇼🇫',
	WS: '🇼🇸',
	XK: '🇽🇰',
	YE: '🇾🇪',
	YT: '🇾🇹',
	ZA: '🇿🇦',
	ZM: '🇿🇲',
	ZW: '🇿🇼',
};

function getCountryCode(locale: string): string {
	const parts = locale.split('_');

	if (parts.length === 0) {
		return '';
	}

	return parts.length > 1 ? parts[1]!.toUpperCase() : parts[0]!.toUpperCase();
}
