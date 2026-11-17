'use client';

import { api } from '@mindustry-tool/api';
import { useQueryClient } from '@tanstack/react-query';
import { Check, User, X } from 'lucide-react';
import { useState } from 'react';
import { ApiItem } from '@/components/query/api-item';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchInput } from '@/components/common/search-input';
import { UserAvatar, UserComponent, UserName, UserRole, UserWithIdComponent, type UserType } from '@/components/user/user-component';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';

const AUTHORS_QUERY_KEY = ['authors'];

type AuthorSelectorProps = {
	value?: string;
	onChange: (authorId?: string) => void;
	className?: string;
};

export default function AuthorSelector({ value, onChange, className }: AuthorSelectorProps) {
	const { t } = useI18n();
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const queryClient = useQueryClient();

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{value ? (
				<div className="flex items-center justify-between gap-2 rounded-md border border-border/80 bg-card/60 p-2 shadow-xs transition-colors hover:border-border">
					<UserWithIdComponent userId={value} clickable={false}>
						<div className="flex items-center gap-2 min-w-0">
							<UserAvatar size={24} />
							<div className="flex flex-col min-w-0 leading-none">
								<UserName className="text-xs font-semibold truncate h-auto" />
								<UserRole className="text-[10px]" />
							</div>
						</div>
					</UserWithIdComponent>

					<div className="flex items-center gap-1 shrink-0">
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button variant="outline" size="xs" className="h-6 text-[11px] px-2 font-mono">
									<Tran text="change" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-72 p-2" align="end">
								<AuthorSearchList
									searchQuery={searchQuery}
									onSearchQueryChange={setSearchQuery}
									selectedValue={value}
									onSelect={(item) => {
										onChange(item.id);
										queryClient.setQueryData(['users', item.id], item);
										setOpen(false);
									}}
								/>
							</PopoverContent>
						</Popover>

						<Button
							variant="ghost"
							size="icon"
							className="size-6 text-muted-foreground hover:text-foreground"
							onClick={() => onChange(undefined)}
							aria-label={t('remove-author-filter')}
						>
							<X className="size-3.5" />
						</Button>
					</div>
				</div>
			) : (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="w-full justify-between h-8 text-xs font-normal border-dashed border-border/80 bg-background/50 hover:bg-card hover:border-border"
						>
							<span className="flex items-center gap-1.5 text-muted-foreground">
								<User className="size-3.5" />
								<Tran text="select-author" />
							</span>
							<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
								<Tran text="filter" />
							</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-72 p-2" align="start">
						<AuthorSearchList
							searchQuery={searchQuery}
							onSearchQueryChange={setSearchQuery}
							selectedValue={value}
							onSelect={(item) => {
								onChange(item.id);
								queryClient.setQueryData(['users', item.id], item);
								setOpen(false);
							}}
						/>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}

type AuthorSearchListProps = {
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	selectedValue?: string;
	onSelect: (item: UserType) => void;
};

function AuthorSearchList({
	searchQuery,
	onSearchQueryChange,
	selectedValue,
	onSelect,
}: AuthorSearchListProps) {
	return (
		<div className="flex flex-col gap-2">
			<SearchInput
				value={searchQuery}
				onChange={onSearchQueryChange}
				className="min-h-7 h-7 text-xs max-w-none"
			/>
			<div className="max-h-56 overflow-y-auto flex flex-col gap-1 overscroll-contain pr-0.5">
				<ApiItem
					route={api.v4.users.search}
					queryKey={AUTHORS_QUERY_KEY}
					query={{
						q: searchQuery,
					}}
					loading={() => (
						<div className="flex justify-center py-4">
							<LoadingSpinner />
						</div>
					)}
					empty={() => (
						<div className="py-4 text-center text-xs text-muted-foreground">
							<Tran text="no-item" />
						</div>
					)}
				>
					{(data) => {
						return data?.map((item) => {
							const isSelected = item.id === selectedValue;
							return (
								<button
									key={item.id}
									type="button"
									className={cn(
										'flex items-center justify-between w-full rounded-sm px-2 py-1.5 text-left text-xs transition-colors cursor-pointer',
										isSelected
											? 'bg-primary text-primary-foreground font-medium'
											: 'hover:bg-muted/70 text-foreground',
									)}
									onClick={() => onSelect(item)}
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
			</div>
		</div>
	);
}
