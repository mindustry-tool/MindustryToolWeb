import { z } from 'zod/v4-mini';
import { eventMap } from '@mindustry-tool/api';
import { defineRpc } from '../protocol';

const gatewayEventSchema = z.union([
  eventMap.log,
  eventMap['server-state'],
  eventMap.start,
  eventMap.stop,
  eventMap.disconnect,
  eventMap.chat,
  eventMap['player-join'],
  eventMap['player-leave'],
  eventMap['player-kick'],
  eventMap['player-ban'],
  eventMap['player-vote-kick'],
]);

export type GatewayEvent = z.infer<typeof gatewayEventSchema>;

export const eventDescriptors = {
  managerEvent: defineRpc({ type: 'event', request: gatewayEventSchema, response: z.void() }),
};
