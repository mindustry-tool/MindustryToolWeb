'use client';

import React, { useState } from 'react';
import type { CommunityServerDto } from '@mindustry-tool/api';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ColorText from '@/components/common/color-text';
import { CountryFlag } from './country-flag';
import { PlayerSparkline } from './player-sparkline';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CommunityServerCardProps {
  server: CommunityServerDto;
}

export function CommunityServerCard({ server }: CommunityServerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(server.address);
    setCopied(true);
    toast.success(`Copied: ${server.address}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const gamemodeLabel = server.gamemode
    ? server.gamemode.charAt(0).toUpperCase() + server.gamemode.slice(1)
    : 'Survival';

  const mapInfo = [
    gamemodeLabel,
    server.mapName && server.mapName !== 'unknown' ? server.mapName : null,
    server.wave !== null && server.wave > 0 ? `w.${server.wave}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const pingColor =
    server.ping === null
      ? 'text-muted-foreground'
      : server.ping < 300
      ? 'text-emerald-500'
      : server.ping < 500
      ? 'text-amber-500'
      : 'text-red-500';

  return (
    <div className="w-full bg-card border border-border/50 hover:border-border/80 hover:bg-accent/4 transition-colors rounded-lg px-3.5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
      {/* Left: Status Dot, Server Name, Address & Flag */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Status dot */}
        <span
          className={`size-2 rounded-full shrink-0 mt-1.5 ${
            server.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'
          }`}
          title={server.isOnline ? 'Online' : 'Offline'}
        />

        <div className="min-w-0 space-y-0.5 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-foreground truncate text-sm">
              {server.serverName ? (
                <ColorText text={server.serverName} />
              ) : (
                server.cleanName || server.address
              )}
            </span>

            {server.isHub && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                Hub
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <CountryFlag code={server.countryCode} />
            <span className="truncate">{server.address}</span>
          </div>
        </div>
      </div>

      {/* Middle: Map & Mode Details */}
      <div className="hidden lg:block text-xs text-muted-foreground/80 truncate max-w-60 text-left">
        {mapInfo}
      </div>

      {/* Right: Ping, Sparkline, Player Count & Copy Action */}
      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-border/40">
        {/* Mobile map info */}
        <div className="block lg:hidden text-xs text-muted-foreground truncate">
          {mapInfo}
        </div>

        <div className="flex items-center gap-3">
          {/* Ping with fixed width for perfect vertical alignment */}
          <div className="font-mono text-xs w-14 text-right shrink-0">
            {server.isOnline && server.ping !== null ? (
              <span className={pingColor}>{server.ping}ms</span>
            ) : (
              <span className="text-muted-foreground/40">—</span>
            )}
          </div>

          {/* Sparkline */}
          <div className="hidden sm:block">
            <PlayerSparkline data={server.snapshots} width={90} height={22} />
          </div>

          {/* Player Count */}
          <div className="font-mono text-xs font-medium text-foreground min-w-13.75 text-right">
            <span>{server.players}</span>
            {server.playerLimit ? (
              <span className="text-muted-foreground/70">/{server.playerLimit}</span>
            ) : null}
            <span className="text-muted-foreground text-[11px] ml-1">p</span>
          </div>

          {/* Copy Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Copy address</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export function CommunityServerCardSkeleton() {
  return (
    <div className="w-full bg-card/40 border border-border/40 rounded-lg px-3.5 py-3 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-start gap-3 flex-1">
        <div className="size-2 rounded-full bg-muted shrink-0 mt-1.5" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted/60 rounded" />
        </div>
      </div>
      <div className="h-5 w-24 bg-muted/30 rounded hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="h-4 w-12 bg-muted/40 rounded shrink-0" />
        <div className="h-5 w-20 bg-muted/20 rounded hidden sm:block" />
        <div className="h-4 w-12 bg-muted rounded" />
        <div className="size-7 bg-muted/30 rounded" />
      </div>
    </div>
  );
}
