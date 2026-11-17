import dgram from 'node:dgram';
import { stripColors } from '@mindustry-tool/api';

export interface MindustryPingResult {
  isOnline: boolean;
  ping: number | null;
  serverName: string | null;
  cleanName: string | null;
  mapName: string | null;
  gamemode: string | null;
  wave: number | null;
  players: number;
  playerLimit: number | null;
  version: number | null;
  versionType: string | null;
  description: string | null;
  modeName: string | null;
  isHub: boolean;
}

const GAMEMODES = ['survival', 'sandbox', 'attack', 'pvp', 'editor'] as const;

export function pingMindustryServer(
  host: string,
  port = 6567,
  timeoutMs = 2500,
): Promise<MindustryPingResult> {
  return new Promise((resolve) => {
    let settled = false;
    const socket = dgram.createSocket('udp4');
    const startTime = Date.now();

    const cleanup = () => {
      if (settled) return;
      settled = true;
      try {
        socket.close();
      } catch {
        // ignore close error
      }
    };

    const emptyResult: MindustryPingResult = {
      isOnline: false,
      ping: null,
      serverName: null,
      cleanName: null,
      mapName: null,
      gamemode: null,
      wave: null,
      players: 0,
      playerLimit: null,
      version: null,
      versionType: null,
      description: null,
      modeName: null,
      isHub: false,
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(emptyResult);
    }, timeoutMs);

    socket.on('error', () => {
      clearTimeout(timer);
      cleanup();
      resolve(emptyResult);
    });

    socket.on('message', (msg: Buffer) => {
      clearTimeout(timer);
      const ping = Math.max(1, Date.now() - startTime);
      cleanup();

      try {
        let offset = 0;

        const readString = (): string => {
          if (offset >= msg.length) return '';
          const len = msg.readUInt8(offset);
          offset += 1;
          if (len === 0 || offset + len > msg.length) return '';
          const str = msg.toString('utf8', offset, offset + len);
          offset += len;
          return str;
        };

        const serverName = readString();
        const mapName = readString();
        const players = offset + 4 <= msg.length ? msg.readInt32BE(offset) : 0;
        offset += 4;
        const wave = offset + 4 <= msg.length ? msg.readInt32BE(offset) : 0;
        offset += 4;
        const version = offset + 4 <= msg.length ? msg.readInt32BE(offset) : 0;
        offset += 4;
        const versionType = readString();
        const modeByte = offset < msg.length ? msg.readUInt8(offset) : 0;
        offset += 1;
        const gamemode = GAMEMODES[modeByte] || 'survival';
        const playerLimit = offset + 4 <= msg.length ? msg.readInt32BE(offset) : 0;
        offset += 4;
        const description = readString();
        const modeName = readString();

        const cleanName = stripColors(serverName || '');
        const isHub =
          cleanName.toLowerCase().includes('hub') ||
          (serverName ? serverName.toLowerCase().includes('hub') : false);

        resolve({
          isOnline: true,
          ping,
          serverName: serverName || null,
          cleanName: cleanName || serverName || null,
          mapName: mapName || null,
          gamemode: modeName || gamemode,
          wave: wave >= 0 ? wave : null,
          players: Math.max(0, players),
          playerLimit: playerLimit > 0 ? playerLimit : null,
          version: version > 0 ? version : null,
          versionType: versionType || null,
          description: description || null,
          modeName: modeName || null,
          isHub,
        });
      } catch {
        resolve(emptyResult);
      }
    });

    const packet = Buffer.from([0xfe, 0x01]);
    socket.send(packet, 0, packet.length, port, host, (err) => {
      if (err) {
        clearTimeout(timer);
        cleanup();
        resolve(emptyResult);
      }
    });
  });
}
