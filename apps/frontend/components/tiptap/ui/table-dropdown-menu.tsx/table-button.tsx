import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';

export function TableButton({ children, onClick, ...props }: React.ComponentProps<typeof Button>) {
	return (
		<DropdownMenuItem className="justify-start" tabIndex={-1} asChild>
			<Button variant="ghost" tabIndex={-1} {...props} onClick={onClick}>
				{children}
			</Button>
		</DropdownMenuItem>
	);
}
