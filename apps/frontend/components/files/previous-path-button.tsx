import { Button } from "@/components/ui/button";
import { getParentPath } from "@/lib/utils";
import { ChevronLeftIcon } from "lucide-react";

export function PreviousPathButton({ path, setPath }: { path: string; setPath: (path: string) => void }) {
	return (
		<Button
			className="rounded-sm shrink-0"
			variant="outline"
			size="icon"
			onClick={() => setPath(getParentPath(path))}
		>
			<ChevronLeftIcon />
		</Button>
	);
}
