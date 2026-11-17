import React from 'react';

export function getCountryFlag(code?: string | null): string {
  if (!code || code.length !== 2) {
    return '🌐';
  }
  const upper = code.toUpperCase();
  const offset = 0x1f1e6 - 65;
  const first = upper.charCodeAt(0) + offset;
  const second = upper.charCodeAt(1) + offset;
  if (first < 0x1f1e6 || first > 0x1f1ff || second < 0x1f1e6 || second > 0x1f1ff) {
    return '🌐';
  }
  return String.fromCodePoint(first, second);
}

interface CountryFlagProps {
  code?: string | null;
  className?: string;
  showCode?: boolean;
}

export function CountryFlag({ code, className, showCode = false }: CountryFlagProps) {
  const flag = getCountryFlag(code);
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-sm leading-none ${className ?? ''}`}
      title={code ? `Region: ${code.toUpperCase()}` : 'Unknown Region'}
    >
      <span className="text-base select-none">{flag}</span>
      {showCode && code && (
        <span className="text-[11px] font-semibold text-muted-foreground uppercase">{code}</span>
      )}
    </span>
  );
}
