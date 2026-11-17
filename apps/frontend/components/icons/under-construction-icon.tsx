import Image from 'next/image';
import underConstruction from '../../public/assets/under-construction.jpg';

export function UnderConstructionIcon() {
	return <Image className="h-full w-full" src={underConstruction} alt="Under Construction" />;
}
