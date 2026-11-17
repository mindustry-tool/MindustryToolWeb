import type { Mode } from '@/components/search-bar/search-bar';
import { DropdownCard } from '@/components/search-bar/dropdown-card';
import { Tran } from '@/i18n/tran';

type SizeDropdownProps = {
	setSizeQuery: (size: string) => void;
	setInput: (input: string) => void;
	setMode: (mode: Mode) => void;
};

export function SizeDropdown({}: SizeDropdownProps) {
	return <DropdownCard><Tran text="nothing" /></DropdownCard>;
}
