import { useMemo } from 'react';

import { parseColorText } from '@/lib/utils';
import React from 'react';

type ColorTextProps = {
	text?: string;
	className?: string;
};

function ColorText({ text, className }: ColorTextProps) {
	const components = useMemo(() => parseColorText(text), [text]);

	return (
		<span className={className}>
			{components.map(({ line, format }, index) => {
				switch (line) {
					case '\n':
						return <br key={index} />;

					// Reset color syntax
					case '[]':
						return null;

					case '':
						return null;

					default: {
						return (
							<span className={className} key={index} style={format}>
								{line}
							</span>
						);
					}
				}
			})}
		</span>
	);
}

export default React.memo(ColorText);
