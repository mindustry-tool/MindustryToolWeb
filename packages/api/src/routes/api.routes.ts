import { defineApiRoute } from '../types/index.js';
import { pingQuerySchema } from '../schema/index.js';

import { authRoutes } from './v4/auth.routes.js';
import { itemRoutes } from './v4/item.routes.js';
import { userRoutes } from './v4/user.routes.js';
import { postRoutes } from './v4/post.routes.js';
import { mediaRoutes } from './v4/media.routes.js';
import { imageRoutes } from './v4/image.routes.js';
import { iconRoutes } from './v4/icon.routes.js';
import { wikiRoutes } from './v4/wiki.routes.js';
import { likeRoutes } from './v4/like.routes.js';
import { commentRoutes } from './v4/comment.routes.js';
import { tagRoutes } from './v4/tag.routes.js';
import { plannetRoutes } from './v4/planet.routes.js';
import { schematicRoutes } from './v4/schematic.routes.js';
import { mapRoutes } from './v4/map.routes.js';
import { verificationRoutes } from './v4/verification.routes.js';
import { discordUploadRoutes } from './v4/discord-upload.routes.js';
import { githubUploadRoutes } from './v4/github-upload.routes.js';
import { playerConnectRoutes } from './v4/player-connect.routes.js';
import { roleRoutes } from './v4/role.routes.js';
import { actionRoutes } from './v4/action.routes.js';
import { modRoutes } from './v4/mod.routes.js';
import { serverRoutes } from './v4/server.routes.js';
import { serverGroupRoutes } from './v4/server-group.routes.js';
import { pluginRoutes } from './v4/plugin.routes.js';
import { contentPatchesRoutes } from './v4/content-patches.routes.js';
import { imageGeneratorsRoutes } from './v4/image-generators.routes.js';
import { shareRoutes } from './v4/share.routes.js';
import { statsRoutes } from './v4/stats.routes.js';
import { messageRoutes } from './v4/message.routes.js';
import { logicRoutes } from './v4/logic.routes.js';
import { chatRoutes } from './v4/chat.routes.js';
import { crashRoutes } from './v4/crash.routes.js';
import { proxyRoutes } from './v4/proxy.routes.js';
import { notificationRoutes } from './v4/notification.routes.js';
import { managementNotificationRoutes } from './v4/management-notification.routes.js';
import { communityServerRoutes } from './v4/community-server.routes.js';

export const api = {
  v4: {
    proxy: proxyRoutes,
    ping: defineApiRoute<undefined, typeof pingQuerySchema>({
      path: `/ping`,
      method: 'GET',
    }),
    crashes: crashRoutes,
    auth: authRoutes,
    items: itemRoutes,
    users: userRoutes,
    posts: postRoutes,
    media: mediaRoutes,
    images: imageRoutes,
    icon: iconRoutes,
    wiki: wikiRoutes,
    likes: likeRoutes,
    comments: commentRoutes,
    tags: tagRoutes,
    planets: plannetRoutes,
    schematics: schematicRoutes,
    maps: mapRoutes,
    verification: verificationRoutes,
    discordUploads: discordUploadRoutes,
    githubUploads: githubUploadRoutes,
    playerConnects: playerConnectRoutes,
    roles: roleRoutes,
    actions: actionRoutes,
    mods: modRoutes,
    servers: serverRoutes,
    serverGroups: serverGroupRoutes,
    communityServers: communityServerRoutes,
    plugins: pluginRoutes,
    contentPatches: contentPatchesRoutes,
    imageGenerators: imageGeneratorsRoutes,
    share: shareRoutes,
    stats: statsRoutes,
    messages: messageRoutes,
    logics: logicRoutes,
    chats: chatRoutes,
    notifications: notificationRoutes,
    management: {
      notifications: managementNotificationRoutes,
    },
  },
} as const;

export {
  authRoutes,
  itemRoutes,
  userRoutes,
  postRoutes,
  mediaRoutes,
  imageRoutes,
  iconRoutes,
  wikiRoutes,
  likeRoutes,
  commentRoutes,
  tagRoutes,
  plannetRoutes,
  schematicRoutes,
  mapRoutes,
  verificationRoutes,
  discordUploadRoutes,
  githubUploadRoutes,
  playerConnectRoutes,
  roleRoutes,
  actionRoutes,
  modRoutes,
  serverRoutes,
  serverGroupRoutes,
  pluginRoutes,
  contentPatchesRoutes,
  imageGeneratorsRoutes,
  shareRoutes,
  statsRoutes,
  messageRoutes,
  logicRoutes,
  chatRoutes,
  crashRoutes,
  proxyRoutes,
  notificationRoutes,
  managementNotificationRoutes,
  communityServerRoutes,
};
