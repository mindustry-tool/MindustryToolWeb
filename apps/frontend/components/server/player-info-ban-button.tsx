'use client';

import { BanButton } from './ban-button';

export type PlayerInfoRecord = {
	id: string;
	lastName: string;
	lastIP: string;
	ips: string[];
	names: string[];
	adminUsid?: string | null;
	timesKicked: number;
	timesJoined: number;
	banned: boolean;
	admin: boolean;
	lastKicked: number;
};

export type PlayerInfoBanButtonProps = {
	serverId: string;
	player: Pick<PlayerInfoRecord, 'id' | 'lastName' | 'lastIP' | 'ips' | 'names'>;
};

export function PlayerInfoBanButton({ serverId, player }: PlayerInfoBanButtonProps) {
	return (
		<BanButton
			serverId={serverId}
			player={player}
			variant="destructive"
			className="justify-between w-full"
		/>
	);
}
