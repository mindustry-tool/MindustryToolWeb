import { z } from 'zod/v4-mini';
import { fileDto, serverMapDto, serverModDto } from '@mindustry-tool/api';
import { defineRpc, defineStream } from '../protocol';

const serverIdReq = z.object({ serverId: z.uuidv7() });
const filesReq = z.object({ serverId: z.uuidv7(), path: z.string() });

export const fileDescriptors = {
  fileTransferStart: defineRpc({
    type: 'file-transfer-start',
    request: z.object({
      transferId: z.uuid(),
      serverId: z.uuidv7(),
      path: z.string().check(z.minLength(1)),
      totalChunks: z.int().check(z.gte(0)),
      sha256: z.optional(z.string().check(z.minLength(1))),
    }),
    response: z.object({ transferId: z.uuid(), accepted: z.literal(true) }),
  }),
  fileTransferComplete: defineRpc({
    type: 'file-transfer-complete',
    request: z.object({ transferId: z.uuid(), sha256: z.string().check(z.minLength(1)) }),
    response: z.object({
      transferId: z.uuid(),
      bytes: z.int().check(z.gte(0)),
      sha256: z.string().check(z.minLength(1)),
    }),
  }),
  downloadFile: defineRpc({
    type: 'download-file',
    request: z.object({ serverId: z.uuidv7(), path: z.string().check(z.minLength(1)) }),
    response: z.instanceof(Buffer),
  }),
  getFiles: defineRpc({ type: 'get-files', request: filesReq, response: z.union([z.array(fileDto), z.base64()]) }),
  createFolder: defineRpc({ type: 'create-folder', request: filesReq, response: z.boolean() }),
  deleteFile: defineRpc({ type: 'delete-file', request: filesReq, response: z.boolean() }),
  getMaps: defineRpc({ type: 'get-maps', request: serverIdReq, response: z.array(serverMapDto) }),
  getMods: defineRpc({ type: 'get-mods', request: serverIdReq, response: z.array(serverModDto) }),
  getManagerMaps: defineRpc({
    type: 'get-manager-maps',
    request: z.null(),
    response: z.array(z.object({ metadata: serverMapDto, servers: z.array(z.string()) })),
  }),
  getManagerMods: defineRpc({
    type: 'get-manager-mods',
    request: z.null(),
    response: z.array(z.object({ data: serverModDto, servers: z.array(z.string()) })),
  }),
  getImage: defineRpc({ type: 'get-image', request: serverIdReq, response: z.instanceof(Buffer) }),
  fileUpload: defineStream({
    streamType: 'file-upload',
    metadata: z.object({ serverId: z.string(), path: z.string() }),
    response: z.object({
      transferId: z.uuid(),
      bytes: z.int().check(z.gte(0)),
      sha256: z.string().check(z.minLength(1)),
    }),
  }),
};
