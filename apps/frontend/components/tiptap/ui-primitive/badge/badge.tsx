'use client';

import * as React from 'react';

export type BadgeProps = {
	variant?: 'ghost' | 'white' | 'gray' | 'green' | 'default'
	size?: 'default' | 'small'
	appearance?: 'default' | 'subdued' | 'emphasized'
	trimText?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export const Badge = ({ ref, variant, size = 'default', appearance = 'default', trimText = false, className, children, ...props }: BadgeProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
		return (
			<div
  ref={ref}
  className={`tiptap-badge ${className || ''}`}
  data-style={variant}
  data-size={size}
  data-appearance={appearance}
  data-text-trim={trimText ? 'on' : 'off'}
  {...props}
			>
				{children}
			</div>
		);
	};

Badge.displayName = 'Badge';

export default Badge;
