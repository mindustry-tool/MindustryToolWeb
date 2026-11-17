import {
  FRAME_KINDS,
  TYPE_SUBJECT_KINDS,
  EVENT_SUBJECT_KINDS,
  CHUNK_HEADER_SIZE,
  MAX_CHUNK_BYTES,
  MAX_STREAM_BYTES,
  MAX_CONCURRENT_STREAMS,
  SLOT_CEILING_MS,
  MANAGER_REPLACED_CLOSE_CODE,
  createRequest,
  createResponse,
  createResponseError,
  createNotification,
  createStreamStart,
  createStreamDone,
  createListen,
  createListening,
  createEventFrame,
  createUnlisten,
  createListenEnded,
  createListenError,
} from './protocol';
import { eventMap } from '@mindustry-tool/api';
import { controlDescriptors } from './descriptors/control.descriptors';
import { fileDescriptors } from './descriptors/files.descriptors';
import { playerDescriptors } from './descriptors/players.descriptors';
import { eventDescriptors } from './descriptors/events.descriptors';

const WIRE_KINDS = [
  'request',
  'response',
  'response-error',
  'notification',
  'stream-start',
  'stream-done',
  'stream-abort',
  'stream-reply-start',
  'stream-reply-done',
  'listen',
  'listening',
  'event',
  'unlisten',
  'listen-ended',
  'listen-error',
] as const;

const RPC_METHODS = [
  'file-transfer-start',
  'file-transfer-complete',
  'download-file',
  'host-server',
  'remove-server',
  'send-command',
  'pause',
  'send-chat',
  'get-commands',
  'get-state',
  'get-files',
  'create-folder',
  'delete-file',
  'get-maps',
  'get-mods',
  'get-manager-maps',
  'get-manager-mods',
  'get-image',
  'get-players',
  'get-player-infos',
  'get-recent-players',
  'get-kicked-ips',
  'delete-kicked-ip',
  'update-player',
  'get-mismatch',
  'update-config',
  'event',
  'fail-op',
] as const;

const GATEWAY_EVENTS = [
  'log',
  'server-state',
  'start',
  'stop',
  'disconnect',
  'chat',
  'player-join',
  'player-leave',
  'player-kick',
  'player-ban',
  'player-vote-kick',
] as const;

const STREAM_NAMES = ['file-upload', 'get-usage'] as const;

/** Replace the random frame id so the snapshot captures only the wire shape. */
function freezeId<T extends { id: string }>(frame: T): Record<string, unknown> {
  const normalized: Record<string, unknown> = JSON.parse(JSON.stringify(frame));
  normalized.id = '<uuid>';
  return normalized;
}

describe('WS-RPC wire contract freeze', () => {
  it('frame kinds match the frozen inventory', () => {
    expect([...FRAME_KINDS].sort()).toEqual([...WIRE_KINDS].sort());
  });

  it('subject-kind routing sets match the frozen inventory', () => {
    expect([...TYPE_SUBJECT_KINDS].sort()).toEqual(
      [
        'request',
        'notification',
        'response',
        'response-error',
        'stream-start',
        'stream-done',
        'stream-abort',
        'stream-reply-start',
        'stream-reply-done',
      ].sort(),
    );
    expect([...EVENT_SUBJECT_KINDS].sort()).toEqual(
      ['listen', 'listening', 'event', 'unlisten', 'listen-ended', 'listen-error'].sort(),
    );
  });

  it('frame kind sets are disjoint and cover every kind exactly once', () => {
    for (const kind of FRAME_KINDS) {
      const inType = TYPE_SUBJECT_KINDS.has(kind);
      const inEvent = EVENT_SUBJECT_KINDS.has(kind);
      expect(inType !== inEvent).toBe(true);
    }
  });

  it('chunk and stream constants are frozen', () => {
    expect(CHUNK_HEADER_SIZE).toBe(20);
    expect(MAX_CHUNK_BYTES).toBe(64 * 1024);
    expect(MAX_STREAM_BYTES).toBe(33554432);
    expect(MAX_CONCURRENT_STREAMS).toBe(8);
    expect(SLOT_CEILING_MS).toBe(300_000);
  });

  it('RPC method type strings match the frozen inventory', () => {
    const rpcDescriptorTypes = [
      controlDescriptors.hostServer,
      controlDescriptors.removeServer,
      controlDescriptors.pause,
      controlDescriptors.sendCommand,
      controlDescriptors.sendChat,
      controlDescriptors.getCommands,
      controlDescriptors.getState,
      controlDescriptors.getMismatch,
      controlDescriptors.updateConfig,
      controlDescriptors.failOp,
      fileDescriptors.fileTransferStart,
      fileDescriptors.fileTransferComplete,
      fileDescriptors.downloadFile,
      fileDescriptors.getFiles,
      fileDescriptors.createFolder,
      fileDescriptors.deleteFile,
      fileDescriptors.getMaps,
      fileDescriptors.getMods,
      fileDescriptors.getManagerMaps,
      fileDescriptors.getManagerMods,
      fileDescriptors.getImage,
      playerDescriptors.getPlayers,
      playerDescriptors.getPlayerInfos,
      playerDescriptors.getRecentPlayers,
      playerDescriptors.getKickedIps,
      playerDescriptors.deleteKickedIp,
      playerDescriptors.updatePlayer,
      eventDescriptors.managerEvent,
    ].map((descriptor) => descriptor.type);
    expect(rpcDescriptorTypes.sort()).toEqual([...RPC_METHODS].sort());
  });

  it('gateway event names match the frozen inventory', () => {
    expect(Object.keys(eventMap).sort()).toEqual([...GATEWAY_EVENTS].sort());
  });

  it('stream and subscription subjects match the frozen inventory', () => {
    expect([fileDescriptors.fileUpload.streamType, controlDescriptors.serverUsage.event]).toEqual([...STREAM_NAMES]);
  });

  it('manager replacement close code is 4234', () => {
    expect(MANAGER_REPLACED_CLOSE_CODE).toBe(4234);
  });

  it('request envelope has the frozen key set', () => {
    const frame = createRequest('pause', { serverId: '00000000-0000-7000-8000-000000000000' });
    expect(Object.keys(frame).sort()).toEqual(['id', 'kind', 'payload', 'type']);
    expect(frame.kind).toBe('request');
    expect(frame.type).toBe('pause');
    expect(freezeId(frame)).toMatchSnapshot();
  });

  it('response envelope has the frozen key set', () => {
    const frame = createResponse('req-1', 'pause', { ok: true });
    expect(Object.keys(frame).sort()).toEqual(['id', 'kind', 'payload', 'responseOf', 'type']);
    expect(frame.kind).toBe('response');
    expect(frame.responseOf).toBe('req-1');
    expect(freezeId(frame)).toMatchSnapshot();
  });

  it('response-error envelope carries a string payload', () => {
    const frame = createResponseError('req-1', 'pause', 'boom');
    expect(frame.kind).toBe('response-error');
    expect(frame.payload).toBe('boom');
    expect(freezeId(frame)).toMatchSnapshot();
  });

  it('notification envelope has the frozen key set', () => {
    const frame = createNotification('event', { name: 'start' });
    expect(Object.keys(frame).sort()).toEqual(['id', 'kind', 'payload', 'type']);
    expect(frame.kind).toBe('notification');
    expect(freezeId(frame)).toMatchSnapshot();
  });

  it('stream control envelopes keep their kind and subject', () => {
    expect(createStreamStart('file-upload', { streamId: 'x' }).kind).toBe('stream-start');
    expect(createStreamDone('file-upload', { streamId: 'x', sha256: 'a' }).kind).toBe('stream-done');
  });

  it('subscription control envelopes keep their kind and subject', () => {
    expect(createListen('get-usage', { serverId: 's' }).event).toBe('get-usage');
    expect(createListening('l-1', 'get-usage').kind).toBe('listening');
    expect(createEventFrame('l-1', 'get-usage', { players: 1 }).kind).toBe('event');
    expect(createUnlisten('l-1', 'get-usage', 'done').kind).toBe('unlisten');
    expect(createListenEnded('l-1', 'get-usage').kind).toBe('listen-ended');
    expect(createListenError('l-1', 'get-usage', 'boom').kind).toBe('listen-error');
  });
});
