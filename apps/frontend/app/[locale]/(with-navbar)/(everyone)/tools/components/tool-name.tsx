'use client';

import { usePathname } from 'next/navigation';
import { tools } from '@/app/[locale]/(with-navbar)/(everyone)/tools/components/tools';
import { LocalLink } from '@/components/common/locale-link';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tran } from '@/i18n/tran';

export function ToolName() {
	const pathname = usePathname();

	const toolsIndex = pathname.indexOf('tools/');
	const endIndex = toolsIndex + 'tools/'.length;
	const questionMarkIndex = pathname.indexOf('?');
	const toolName = pathname.substring(endIndex, questionMarkIndex > 0 ? questionMarkIndex : undefined);

	const tool = tools.find((t) => t.href.endsWith(toolName));

	if (tool) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Tran {...tool.name} />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="start">
					{tools
						.filter((t) => t.href !== tool.href)
						.map((t) => (
							<DropdownMenuItem key={t.href} asChild>
								<LocalLink href={t.href}>
									<Tran {...t.name} />
								</LocalLink>
							</DropdownMenuItem>
						))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return undefined;
}
