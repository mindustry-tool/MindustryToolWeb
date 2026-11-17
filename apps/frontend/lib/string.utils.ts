import { stripColors } from '@mindustry-tool/api';
import environment from '@/config/environment';

export function formatTitle(title: string) {
	return `${stripColors(title)} - ${environment.webName}`;
}

export function tagStyle(color: string | undefined) {
	return {
		backgroundColor: color ?? undefined,
		boxShadow: color
			? `0 0 8px ${color}CC, 0 0 16px ${color}99, 0 0 24px ${color}66, 0 0 36px ${color}33, inset 0 1px 0 ${color}E6, inset 0 0 4px ${color}4D`
			: undefined,
	};
}
