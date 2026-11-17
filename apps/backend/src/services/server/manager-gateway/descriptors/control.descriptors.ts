import { z } from 'zod/v4-mini';
import { serverConfigSchema, serverStateSchema, serverCommandSchema, serverMismatchDtoSchema, serverUsageDtoSchema } from '@mindustry-tool/api';
import { defineRpc, defineSubscription } from '../protocol';

const serverIdReq = z.object({ serverId: z.uuidv7() });

export const controlDescriptors = {
  hostServer: defineRpc({ type: 'host-server', request: serverConfigSchema, response: z.void() }),
  removeServer: defineRpc({ type: 'remove-server', request: serverIdReq, response: z.void() }),
  pause: defineRpc({ type: 'pause', request: serverIdReq, response: z.boolean() }),
  sendCommand: defineRpc({
    type: 'send-command',
    request: z.object({ serverId: z.uuidv7(), command: z.array(z.string()) }),
    response: z.void(),
  }),
  sendChat: defineRpc({
    type: 'send-chat',
    request: z.object({ serverId: z.uuidv7(), message: z.string() }),
    response: z.void(),
  }),
  getCommands: defineRpc({ type: 'get-commands', request: serverIdReq, response: z.array(serverCommandSchema) }),
  getState: defineRpc({ type: 'get-state', request: serverIdReq, response: serverStateSchema }),
  getMismatch: defineRpc({
    type: 'get-mismatch',
    request: z.object({ serverId: z.uuidv7(), config: serverConfigSchema }),
    response: z.array(serverMismatchDtoSchema),
  }),
  updateConfig: defineRpc({
    type: 'update-config',
    request: z.object({ serverId: z.uuidv7(), config: serverConfigSchema }),
    response: z.void(),
  }),
  failOp: defineRpc({ type: 'fail-op', request: z.object({}), response: z.void() }),
  serverUsage: defineSubscription({ event: 'get-usage', params: serverIdReq, eventSchema: serverUsageDtoSchema }),
};
