import { api } from '@mindustry-tool/api';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';

const AUTHORS_QUERY_KEY = ['authors'];
import { ApiItem } from '@/components/query/api-item';
import { DropdownCard } from '@/components/search-bar/dropdown-card';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { UserAvatar, UserComponent, UserName } from '@/components/user/user-component';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

type AuthorDropdownProps = {
	input: string;
	value: string;
	onChange: (author: string) => void;
};

export default function AuthorDropdown({ input, value, onChange }: AuthorDropdownProps) {
	const queryClient = useQueryClient();

	return (
		<DropdownCard className="space-y-1 p-1 max-h-60">
			<ApiItem
				route={api.v4.users.search}
				queryKey={AUTHORS_QUERY_KEY}
				query={{
					q: input,
				}}
				loading={() => (
					<div className="flex justify-center py-3">
						<LoadingSpinner />
					</div>
				)}
				empty={() => (
					<div className="py-3 text-center text-xs text-muted-foreground">
						<Tran text="no-item" />
					</div>
				)}
			>
				{(data) => {
					return data?.map((item) => {
						const isSelected = item.id === value;
						return (
							<button
								key={item.id}
								type="button"
								className={cn(
									'flex items-center justify-between w-full rounded-sm px-2 py-1.5 text-left text-xs transition-colors cursor-pointer arrow-selector',
									isSelected
										? 'bg-primary text-primary-foreground font-medium'
										: 'hover:bg-muted/70 text-foreground',
								)}
								onClick={() => {
									onChange(item.id);
									queryClient.setQueryData(['users', item.id], item);
								}}
							>
								<UserComponent data={item} clickable={false}>
									<div className="flex items-center gap-2 min-w-0">
										<UserAvatar size={20} />
										<UserName
											className={cn(
												'text-xs truncate h-auto',
												isSelected && 'text-primary-foreground font-medium',
											)}
											useColor={!isSelected}
										/>
									</div>
								</UserComponent>
								{isSelected && <Check className="size-3.5 shrink-0 ml-1.5" />}
							</button>
						);
					});
				}}
			</ApiItem>
		</DropdownCard>
	);
}
