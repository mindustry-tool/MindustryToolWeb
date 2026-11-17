'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = ({ ref, className, ...props }: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	return <div ref={ref} className={cn('tiptap-card', className)} {...props} />;
};
Card.displayName = 'Card';

const CardHeader = ({ ref, className, ...props }: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	return <div ref={ref} className={cn('tiptap-card-header', className)} {...props} />;
};
CardHeader.displayName = 'CardHeader';

const CardBody = ({ ref, className, ...props }: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	return <div ref={ref} className={cn('tiptap-card-body', className)} {...props} />;
};
CardBody.displayName = 'CardBody';

const CardItemGroup = ({ ref, className, orientation = 'vertical', ...props }: React.ComponentProps<'div'> & {
		orientation?: 'horizontal' | 'vertical'
	} & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	return <div ref={ref} data-orientation={orientation} className={cn('tiptap-card-item-group', className)} {...props} />;
};
CardItemGroup.displayName = 'CardItemGroup';

const CardGroupLabel = ({ ref, className, ...props }: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	return <div ref={ref} className={cn('tiptap-card-group-label', className)} {...props} />;
};
CardGroupLabel.displayName = 'CardGroupLabel';

const CardFooter = ({ ref, className, ...props }: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	return <div ref={ref} className={cn('tiptap-card-footer', className)} {...props} />;
};
CardFooter.displayName = 'CardFooter';

export { Card, CardBody, CardFooter, CardGroupLabel, CardHeader, CardItemGroup };
