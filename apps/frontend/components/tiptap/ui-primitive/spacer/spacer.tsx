'use client'

import * as React from 'react'

export type SpacerOrientation = 'horizontal' | 'vertical'

export type SpacerProps = {
  orientation?: SpacerOrientation
  size?: string | number
} & React.HTMLAttributes<HTMLDivElement>

export function Spacer({
  orientation = 'horizontal',
  size,
  style = {},
  ...props
}: SpacerProps) {
  const computedStyle = {
    ...style,
    ...(orientation === 'horizontal' && !size && { flex: 1 }),
    ...(size && {
      width: orientation === 'vertical' ? '1px' : size,
      height: orientation === 'horizontal' ? '1px' : size,
    }),
  }

  return <div {...props} style={computedStyle} />
}
