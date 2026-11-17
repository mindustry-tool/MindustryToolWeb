import type { Locale } from '@mindustry-tool/api';
import { TreeNode } from '@/app/[locale]/wiki/components/path-node';
import { getWikiTree } from '@/app/[locale]/wiki/components/wiki.action';
import ErrorMessage from '@/components/error/error-message';
import { Tran } from '@/i18n/tran';

export async function PathList({ language }: { language: Locale }) {
	const [result, error] = await getWikiTree(language);

	if (error) {
		return <ErrorMessage error={error} />;
	}

	if (result.list.length === 0) {
		return <span className="max-w-44"><Tran text="wiki.nothing-there-yet" /></span>;
	}

	return (
		<div className="flex w-full flex-col text-muted-foreground">
			{Array.from(result.tree.leaves.entries()).map(([segment, child]) => (
				<TreeNode key={segment} node={child} level={1} />
			))}
		</div>
	);
}
