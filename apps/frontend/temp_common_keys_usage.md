# Common.json Key Usage & Namespace Mapping Report

Generated: 2026-09-05T12:47:32.020Z
Total Keys in common.json: **269**

## Summary by Target Namespace

| Target Namespace | Key Count | Description |
|---|---|---|
| **common** | 190 | Keys shared across multiple distinct features/pages or general UI (kept in common.json) |
| **server** | 19 | Keys exclusively used in or prefixed for server feature (move to server.json) |
| **DELETE** | 17 | Unused keys with no specific namespace prefix (can be pruned or archived) |
| **tools** | 14 | Keys exclusively used in or prefixed for tools feature (move to tools.json) |
| **tags** | 6 | Keys exclusively used in or prefixed for tags feature (move to tags.json) |
| **user** | 4 | Keys exclusively used in or prefixed for user feature (move to user.json) |
| **wiki** | 4 | Keys exclusively used in or prefixed for wiki feature (move to wiki.json) |
| **search-bar** | 4 | Keys exclusively used in or prefixed for search-bar feature (move to search-bar.json) |
| **moderation** | 4 | Keys exclusively used in or prefixed for moderation feature (move to moderation.json) |
| **post** | 3 | Keys exclusively used in or prefixed for post feature (move to post.json) |
| **notification** | 1 | Keys exclusively used in or prefixed for notification feature (move to notification.json) |
| **login** | 1 | Keys exclusively used in or prefixed for login feature (move to login.json) |
| **comment** | 1 | Keys exclusively used in or prefixed for comment feature (move to comment.json) |
| **mod** | 1 | Keys exclusively used in or prefixed for mod feature (move to mod.json) |

---

## Target Namespace: `common` (190 keys)

### `dashboard`
- **Value**: "Dashboard"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:229` [Tran]: `label: <Tran text="dashboard" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:43` [string_literal]: `id: 'dashboard',`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:45` [Tran]: `label: <Tran text="dashboard" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:163` [string_literal]: `...([toItem('dashboard'), toItem('console')].filter(Boolean) as NavGroupSingleItem[]),`

### `admin`
- **Value**: "Admin"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: comment, server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:145` [string_literal]: `userId: 'admin',`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:165` [string_literal]: `userId: 'admin',`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:32` [string_literal]: `const COMMENTS_ADMIN_QUERY_KEY = ['comments', 'admin'];`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:226` [Tran]: `groupName: <Tran text="admin" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:84` [string_literal]: `id: 'admin',`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:172` [string_literal]: `items: [toItem('players'), toItem('credit'), toItem('admin'), toItem('webhooks'), toItem('workflow')].filter(`
  - `apps/frontend/components/server/player-info-admin-button.tsx:28` [string_literal]: `player: Pick<PlayerInfoRecord, 'id' | 'lastName' | 'admin'>;`

### `data`
- **Value**: "Data"
- **Classification**: COMMON_SHARED
- **Occurrences**: 48
- **Domains detected**: schematic, server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:448` [string_literal]: `data.append('data', files[i]!);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:70` [string_literal]: `form.setValue('data', reader.result as string);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:135` [string_literal]: `name="data"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:150` [string_literal]: `name="data"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:168` [string_literal]: `name="data"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog.tsx:122` [string_literal]: `data.append('data', text);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:179` [string_literal]: `parseEmbedJson(form.getValues('data')) ? 'embed' : 'chat',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:205` [string_literal]: `const watchData = form.watch('data');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:270` [string_literal]: `const currentEmbed = convertToEmbed(form.getValues('data'));`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:271` [string_literal]: `form.setValue('data', JSON.stringify(currentEmbed, null, 2), { shouldDirty: true });`
  - ... and 38 more occurrences

### `moderation`
- **Value**: "Moderation"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: user, moderation
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:140` [string_literal]: `const { t } = useI18n('moderation');`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:320` [string_literal]: `const { t } = useI18n('moderation');`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:175` [string_literal]: `const { t } = useI18n('moderation');`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:230` [string_literal]: `const { t } = useI18n('moderation');`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/actions/page.tsx:290` [string_literal]: `const { t } = useI18n('moderation');`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:282` [Tran]: `label: <Tran text="moderation" />,`
  - `apps/frontend/i18n.config.ts:27` [string_literal]: `'moderation',`

### `schematic`
- **Value**: "Schematic"
- **Classification**: COMMON_SHARED
- **Occurrences**: 14
- **Domains detected**: schematic, tools, user, notification
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/page.tsx:17` [t()]: `const title = t('schematic');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/logic-display-generator/components/logic-display-generator.tsx:74` [string_literal]: `const [previewMode, setPreviewMode] = useState<'canvas' | 'schematic'>('canvas');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/logic-display-generator/components/logic-display-generator.tsx:486` [string_literal]: `if (previewMode === 'schematic') {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/logic-display-generator/components/logic-display-generator.tsx:612` [string_literal]: `setPreviewMode('schematic');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:78` [string_literal]: `<Tabs className="h-full overflow-hidden" defaultValue="schematic">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:80` [string_literal]: `<TabsTrigger value="schematic">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:81` [Tran]: `<Tran text="schematic" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:92` [string_literal]: `<TabsContent className="h-full overflow-hidden" value="schematic">`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:98` [Tran]: `label: <Tran text="schematic" />,`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:240` [Tran]: `label: <Tran text="schematic" />,`
  - ... and 4 more occurrences

### `map`
- **Value**: "Map"
- **Classification**: COMMON_SHARED
- **Occurrences**: 19
- **Domains detected**: map, server, user, notification
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/page.tsx:15` [t()]: `const title = t('map');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/dashboard.tsx:120` [string_literal]: `<SectionTitle text="map" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/host-button.tsx:91` [Tran]: `<Tran text="map" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/tokenize-command.test.ts:23` [string_literal]: `{ name: 'map', optional: true, variadic: false },`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-autocomplete.ts:17` [string_literal]: `category: 'command' | 'player' | 'map' | 'enum' | 'param';`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-autocomplete.ts:173` [string_literal]: `if (paramName.includes('map')) {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-autocomplete.ts:182` [string_literal]: `category: 'map' as const,`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:83` [string_literal]: `<TabsTrigger value="map">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:84` [Tran]: `<Tran text="map" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:95` [string_literal]: `<TabsContent className="h-full overflow-hidden" value="map">`
  - ... and 9 more occurrences

### `mod`
- **Value**: "Mod"
- **Classification**: COMMON_SHARED
- **Occurrences**: 12
- **Domains detected**: mod, server, tools, notification
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/mods/page.tsx:24` [string_literal]: `const { t } = useI18n('mod');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/dashboard.tsx:146` [string_literal]: `<SectionTitle text="mod" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/mods/components/download-mod-list.tsx:212` [string_literal]: `const { t } = useI18n('mod');`
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-metadata.tsx:8` [Tran]: `<span className="text-xs font-medium text-primary uppercase tracking-wider"><Tran text="mod" /></span>`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:108` [Tran]: `label: <Tran text="mod" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:63` [string_literal]: `id: 'mod',`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:65` [Tran]: `label: <Tran text="mod" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:168` [string_literal]: `items: [toItem('map'), toItem('mod')].filter(Boolean) as NavGroupSingleItem[],`
  - `apps/frontend/app/[locale]/tools/logic/node/operation-node.tsx:23` [string_literal]: `{ id: 'mod', sign: '%', type: 'binary', op: (a: any, b: any) => a % b },`
  - `apps/frontend/components/notification/notification-utils.ts:44` [string_literal]: `if (itemType === 'mod') return `/mods/${itemId}`;`
  - ... and 2 more occurrences

### `home`
- **Value**: "Home"
- **Classification**: COMMON_SHARED
- **Occurrences**: 5
- **Usage locations**:
  - `apps/frontend/app/[locale]/(home)/components/hero-section.tsx:14` [string_literal]: `const { t } = useI18n('home');`
  - `apps/frontend/app/[locale]/(home)/page.tsx:28` [t()]: `const title = t('home');`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:89` [Tran]: `label: <Tran text="home" />,`
  - `apps/frontend/components/common/not-found-card.tsx:31` [Tran]: `<Tran text="home" />`
  - `apps/frontend/i18n.config.ts:16` [string_literal]: `'home',`

### `database`
- **Value**: "Database"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:94` [Tran]: `label: <Tran text="database" />,`

### `post`
- **Value**: "Post"
- **Classification**: COMMON_SHARED
- **Occurrences**: 11
- **Domains detected**: post, user, wiki, notification
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/[id]/page.tsx:48` [string_literal]: `tags: ['post', `post-${id}`],`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:86` [string_literal]: `<TabsTrigger value="post">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:87` [Tran]: `<Tran text="post" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/page.tsx:98` [string_literal]: `<TabsContent className="h-full overflow-hidden" value="post">`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:136` [Tran]: `label: <Tran text="post" />,`
  - `apps/frontend/app/[locale]/wiki/components/wiki.action.ts:13` [string_literal]: `tags: ['wiki', 'post'],`
  - `apps/frontend/app/[locale]/wiki/[postId]/page.tsx:31` [string_literal]: `tags: ['post', `post-${id}`],`
  - `apps/frontend/components/notification/notification-utils.ts:46` [string_literal]: `if (itemType === 'post') return `/posts/${itemId}`;`
  - `apps/frontend/components/notification/notification-utils.ts:57` [string_literal]: `if (itemType === 'post') return `/posts/${itemId}`;`
  - `apps/frontend/components/post/simple-editor.tsx:103` [string_literal]: `const { t } = useI18n('post');`
  - ... and 1 more occurrences

### `about`
- **Value**: "About"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/about/page.tsx:35` [string_literal]: `const { t } = await getTranslation(locale, ['about', 'common', 'meta']);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/about/page.tsx:37` [t()]: `const title = t('about', { defaultValue: 'About' });`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:125` [Tran]: `label: <Tran text="about" />,`
  - `apps/frontend/i18n.config.ts:9` [string_literal]: `'about',`

### `about-description`
- **Value**: "MindustryTool is an all-in-one platform for the Mindustry community, providing tools and resources to make creating, managing, and sharing Mindustry content easier. It includes features such as schematic sharing, modding tools, project editors, server management, maps, and other utilities designed for both players and developers."
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/about/page.tsx:38` [t()]: `const description = t('about-description', {`

### `help`
- **Value**: "Help"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/tokenize-command.test.ts:7` [string_literal]: `text: 'help',`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:169` [Tran]: `groupName: <Tran text="help" />,`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:400` [Tran]: `label: <Tran text="help" />,`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:109` [Tran]: `<Button variant="ghost"><Tran text="help" /></Button>`

### `player-connect`
- **Value**: "Player connect"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:157` [Tran]: `label: <Tran text="player-connect" />,`
  - `apps/frontend/i18n.config.ts:28` [string_literal]: `'player-connect',`

### `network`
- **Value**: "Network"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:133` [Tran]: `groupName: <Tran text="network" />,`

### `upload`
- **Value**: "Upload"
- **Classification**: COMMON_SHARED
- **Occurrences**: 27
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:328` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:329` [Tran]: `<Tran text="upload" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:398` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:399` [Tran]: `<Tran text="upload" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:164` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:165` [Tran]: `<Tran text="upload" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:147` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:148` [Tran]: `<Tran text="upload" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:213` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:214` [Tran]: `<Tran text="upload" />`
  - ... and 17 more occurrences

### `verification-status`
- **Value**: "Status"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/detail.tsx:148` [Tran]: `<Tran text="verification-status" />`

### `power-consumption`
- **Value**: "Power Consumption"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:142` [Tran]: `<Tran text="power-consumption" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:147` [Tran]: `<Tran text="power-consumption" />`

### `size`
- **Value**: "Size"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:131` [Tran]: `<Tran text="size" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:135` [Tran]: `<Tran text="size" />`
  - `apps/frontend/components/buttons/ellipsis-button.tsx:27` [string_literal]: `type Props = Pick<React.ComponentProps<typeof Button>, 'size' | 'children' | 'className'> &`
  - `apps/frontend/components/prompt-kit/prompt-suggestion.tsx:10` [string_literal]: `size?: VariantProps<typeof buttonVariants>["size"];`
  - `apps/frontend/components/prompt-kit/scroll-button.tsx:12` [string_literal]: `size?: VariantProps<typeof buttonVariants>["size"];`
  - `apps/frontend/components/ui/input-group.tsx:106` [string_literal]: `}: Omit<React.ComponentProps<typeof Button>, "size"> &`
  - `apps/frontend/hooks/use-query-params.ts:15` [string_literal]: `if (result && typeof result === 'object' && !(result instanceof URLSearchParams) && 'size' in result) {`

### `tags`
- **Value**: "Tags"
- **Classification**: COMMON_SHARED
- **Occurrences**: 36
- **Domains detected**: map, schematic, tools, content-patch, post, search-bar, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:37` [string_literal]: `mutationKey: ['tags'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:55` [string_literal]: `mutationKey: ['tags'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-group-dialog.tsx:45` [string_literal]: `mutationKey: ['tags'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-category-dialog.tsx:43` [string_literal]: `mutationKey: ['tags'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:65` [string_literal]: `mutationKey: ['tags'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:405` [Tran]: `<Tran text="tags" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:88` [string_literal]: `const { t } = await getTranslation(locale as Locale, ['maps', 'tags']);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:136` [Tran]: `<Tran text="tags" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog.tsx:532` [Tran]: `<Tran text="tags" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:90` [string_literal]: `const { t } = await getTranslation(locale as Locale, ['schematics', 'tags']);`
  - ... and 26 more occurrences

### `created-at`
- **Value**: "Created At"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Domains detected**: map, schematic, content-patch
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:156` [Tran]: `<Tran text="created-at" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:161` [Tran]: `<Tran text="created-at" />`
  - `apps/frontend/components/content-patch/verify-content-patch-dialog.tsx:74` [Tran]: `<Tran text="created-at" />`

### `verified-by`
- **Value**: "Verified By"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/detail.tsx:170` [Tran]: `<Tran text="verified-by" />`

### `requirements`
- **Value**: "Requirements"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: schematic, content-patch
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:141` [Tran]: `<Tran text="requirements" />`
  - `apps/frontend/components/content-patch/verify-content-patch-dialog.tsx:71` [Tran]: `<Tran text="requirements" />`
  - `apps/frontend/components/schematic/requirement-container.tsx:4` [string_literal]: `export function RequirementContainer({ requirements }: { requirements: SchematicDetailDto['meta']['requirements'] }) {`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:269` [Tran]: `<Tran text="requirements" />`

### `author`
- **Value**: "Author"
- **Classification**: COMMON_SHARED
- **Occurrences**: 9
- **Domains detected**: map, schematic, content-patch, search-bar
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:133` [Tran]: `<Tran text="author" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:137` [Tran]: `<Tran text="author" />`
  - `apps/frontend/components/content-patch/verify-content-patch-dialog.tsx:67` [Tran]: `<Tran text="author" />`
  - `apps/frontend/components/search-bar/dropdowns/mode-selector.tsx:33` [string_literal]: `mode: 'author',`
  - `apps/frontend/components/search-bar/filter-dialog.tsx:33` [Tran]: `<Tran className="font-semibold" text="author" />`
  - `apps/frontend/components/search-bar/search-bar.tsx:34` [string_literal]: `export type Mode = 'name' | 'tags' | 'author' | 'width';`
  - `apps/frontend/components/search-bar/search-queries.tsx:37` [string_literal]: `item.mode === 'author' ? 'pl-1 pr-1.5' : 'px-1.5',`
  - `apps/frontend/components/search-bar/search-queries.tsx:61` [string_literal]: `if (query.mode === 'author') {`
  - `apps/frontend/components/webhooks/embed-builder.tsx:162` [Tran]: `<Label className="text-xs font-medium text-muted-foreground"><Tran text="author" /></Label>`

### `back`
- **Value**: "Back"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: server, post
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:387` [Tran]: `<Tran text="back" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:429` [Tran]: `<Tran text="back" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:463` [Tran]: `<Tran text="back" />`
  - `apps/frontend/app/[locale]/new-post/page.client.tsx:30` [Tran]: `<Tran text="back" />`
  - `apps/frontend/components/buttons/back-button.tsx:16` [t()]: `title={t('back')}`
  - `apps/frontend/components/common/not-found-card.tsx:27` [Tran]: `<Tran text="back" />`
  - `apps/frontend/components/post/simple-editor.tsx:172` [Tran]: `<Tran text="back" />`

### `search`
- **Value**: "search"
- **Classification**: COMMON_SHARED
- **Occurrences**: 6
- **Domains detected**: tools, wiki, search-bar
- **Usage locations**:
  - `apps/frontend/app/[locale]/tools/logic/components/left/left-bar.tsx:27` [string_literal]: `id: 'search',`
  - `apps/frontend/app/[locale]/wiki/layout.tsx:45` [Tran]: `<Tran text="search" />`
  - `apps/frontend/components/common/search-input.tsx:31` [t()]: `placeholder={t('search')}`
  - `apps/frontend/components/common/search-input.tsx:32` [t()]: `aria-label={t('search')}`
  - `apps/frontend/components/search-bar/search-bar.tsx:133` [t()]: `placeholder={t('search', { defaultValue: 'Search...' })}`
  - `apps/frontend/components/search-bar/search-bar.tsx:134` [t()]: `aria-label={t('search', { defaultValue: 'Search' })}`

### `content`
- **Value**: "Content"
- **Classification**: COMMON_SHARED
- **Occurrences**: 10
- **Domains detected**: post, wiki
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/[id]/layout.tsx:17` [string_literal]: `<div id="content" className="mt-2 flex h-full w-full flex-col space-y-10 overflow-y-auto">`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:167` [Tran]: `groupName: <Tran text="content" />,`
  - `apps/frontend/app/[locale]/new-post/page.client.tsx:36` [Tran]: `<TabsTrigger value="content"><Tran text="content" /></TabsTrigger>`
  - `apps/frontend/app/[locale]/wiki/[postId]/components/table-of-content.tsx:23` [string_literal]: `const content = document.getElementById('content');`
  - `apps/frontend/app/[locale]/wiki/[postId]/page.tsx:81` [string_literal]: `<Container id="content" className="mx-auto w-full max-w-[90ch] xl:w-[90ch]">`
  - `apps/frontend/components/post/simple-editor.tsx:163` [string_literal]: `const onContentUpdate = React.useCallback((content: string) => form.setValue('content', content), [form]);`
  - `apps/frontend/components/post/simple-editor.tsx:184` [string_literal]: `value="content"`
  - `apps/frontend/components/post/simple-editor.tsx:346` [string_literal]: `<TabsContent className="overflow-hidden" value="content">`
  - `apps/frontend/components/post/simple-editor.tsx:348` [string_literal]: `<ContentEditor content={form.watch('content')} onUpdate={onContentUpdate} />`
  - `apps/frontend/components/ui/sidebar.tsx:70` [string_literal]: `data-sidebar="content"`

### `update-admin`
- **Value**: "Update Admin"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:106` [Tran]: `<Tran text="update-admin" />`

### `copy`
- **Value**: "Copy"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: tools, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/tools/logic/components/logic-node.tsx:129` [Tran]: `<Tran text="copy" />`
  - `apps/frontend/components/schematic/schematic-copy-button.tsx:58` [t()]: `<Button variant="outline" aria-label={t('copy')} {...props} onClick={handleClick}>`

### `schematics`
- **Value**: "Schematics"
- **Classification**: COMMON_SHARED
- **Occurrences**: 44
- **Domains detected**: schematic, comment, user
- **Usage locations**:
  - `apps/frontend/app/sitemap.ts:6` [string_literal]: `const routes = ['schematics', 'maps', 'posts', 'servers', 'upload/schematic', 'upload/map', 'upload/post'];`
  - `apps/frontend/app/[locale]/(home)/components/recent-schematics.tsx:17` [string_literal]: `const SCHEMATICS_QUERY_KEY = ['schematics'];`
  - `apps/frontend/app/[locale]/(home)/components/recent-schematics.tsx:47` [string_literal]: `<LikeButton itemType="schematics" data={item} variant="outline" />`
  - `apps/frontend/app/[locale]/(home)/components/recent-schematics.tsx:48` [string_literal]: `<CommentButton itemType="schematics" data={item} />`
  - `apps/frontend/app/[locale]/(home)/components/recent-schematics.tsx:49` [string_literal]: `<DownloadButton itemType="schematics" queryKey={SCHEMATICS_QUERY_KEY} data={item} />`
  - `apps/frontend/app/[locale]/(home)/page.tsx:37` [string_literal]: `tags: ['schematics'],`
  - `apps/frontend/app/[locale]/(home)/page.tsx:63` [string_literal]: `tags: ['schematics'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/schematics/page.tsx:25` [string_literal]: `const SCHEMATICS_QUERY_KEY = ['schematics'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/schematics/page.tsx:43` [string_literal]: `<SearchBar tags="schematics" sorts={SORT_TAGS} author size>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:36` [string_literal]: `SCHEMATIC: 'schematics',`
  - ... and 34 more occurrences

### `general`
- **Value**: "General"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:48` [string_literal]: `<Tabs value={segment || 'general'} className="flex-1 flex flex-col min-h-0">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:50` [string_literal]: `<TabsTrigger value="general" data-state={segment === null ? 'active' : 'inactive'} asChild>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:52` [Tran]: `<Tran text="general" />`

### `maps`
- **Value**: "Maps"
- **Classification**: COMMON_SHARED
- **Occurrences**: 52
- **Domains detected**: map, comment, server, user
- **Usage locations**:
  - `apps/frontend/app/sitemap.ts:6` [string_literal]: `const routes = ['schematics', 'maps', 'posts', 'servers', 'upload/schematic', 'upload/map', 'upload/post'];`
  - `apps/frontend/app/[locale]/(home)/components/recent-maps.tsx:16` [string_literal]: `const MAPS_QUERY_KEY = ['maps'];`
  - `apps/frontend/app/[locale]/(home)/components/recent-maps.tsx:46` [string_literal]: `<LikeButton itemType="maps" data={item} variant="outline" />`
  - `apps/frontend/app/[locale]/(home)/components/recent-maps.tsx:47` [string_literal]: `<CommentButton itemType="maps" data={item} />`
  - `apps/frontend/app/[locale]/(home)/components/recent-maps.tsx:48` [string_literal]: `<DownloadButton itemType="maps" queryKey={MAPS_QUERY_KEY} data={item} />`
  - `apps/frontend/app/[locale]/(home)/page.tsx:76` [string_literal]: `tags: ['maps'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/maps/page.tsx:25` [string_literal]: `const MAPS_QUERY_KEY = ['maps'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/maps/page.tsx:43` [string_literal]: `<SearchBar tags="maps" sorts={SORT_TAGS} author size>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:37` [string_literal]: `MAP: 'maps',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:407` [string_literal]: `<TagIdSelector returnType="dto" type="maps" value={tags} onValueChange={setTags}>`
  - ... and 42 more occurrences

### `next`
- **Value**: "Next"
- **Classification**: COMMON_SHARED
- **Occurrences**: 8
- **Domains detected**: server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/terminal-input.tsx:152` [string_literal]: `autocomplete.cycleHighlight('next');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/terminal-input.tsx:157` [string_literal]: `const handled = history.navigateHistory('next');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-autocomplete.ts:275` [string_literal]: `(direction: 'next' | 'prev') => {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-autocomplete.ts:278` [string_literal]: `if (direction === 'next') {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-history.ts:40` [string_literal]: `(direction: 'prev' | 'next'): boolean => {`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-nodes.tsx:321` [string_literal]: `return [id, type, 'handle', label || 'next'].join('|');`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:154` [Tran]: `<Tran text="next" />`
  - `apps/frontend/next-env.d.ts:1` [string_literal]: `/// <reference types="next" />`

### `posts`
- **Value**: "Posts"
- **Classification**: COMMON_SHARED
- **Occurrences**: 13
- **Domains detected**: wiki, comment, post
- **Usage locations**:
  - `apps/frontend/app/sitemap.ts:6` [string_literal]: `const routes = ['schematics', 'maps', 'posts', 'servers', 'upload/schematic', 'upload/map', 'upload/post'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:597` [string_literal]: `<InfiniteApiItem className="grid gap-2" route={api.v4.posts.findAll} queryKey={['posts']} query={queryParam}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:35` [string_literal]: `POST: 'posts',`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:123` [string_literal]: `const routeSegment = itemTypeToRoute[item.itemType] ?? 'posts';`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/components/posts.tsx:9` [string_literal]: `const POSTS_QUERY_KEY = ['posts'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/page.tsx:18` [string_literal]: `<SearchBar author tags="posts" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/[id]/components/delete-post-dialog.tsx:45` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['posts'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/[id]/page.tsx:125` [string_literal]: `<LikeButton itemType="posts" data={data} />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/[id]/page.tsx:131` [string_literal]: `<CommentSection itemType="posts" itemId={itemId} />`
  - `apps/frontend/app/[locale]/new-post/page.client.tsx:64` [string_literal]: `queryKey: ['posts', postId],`
  - ... and 3 more occurrences

### `go`
- **Value**: "go"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/components/query/api-pagination.tsx:119` [Tran]: `<Tran text="go" />`
  - `apps/frontend/components/query/api-pagination.tsx:208` [Tran]: `<Tran text="go" />`

### `page`
- **Value**: "Page"
- **Classification**: COMMON_SHARED
- **Occurrences**: 6
- **Domains detected**: server, search-bar
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/page.tsx:52` [string_literal]: `const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0));`
  - `apps/frontend/components/query/api-pagination.tsx:45` [string_literal]: `const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0).withOptions({ shallow }));`
  - `apps/frontend/components/query/api-pagination.tsx:195` [Tran]: `<Tran text="page" />`
  - `apps/frontend/components/search-bar/search-bar.tsx:49` [string_literal]: `const [, setPage] = useQueryState('page', parseAsInteger.withDefault(0));`
  - `apps/frontend/components/ui/breadcrumb.tsx:59` [string_literal]: `aria-current="page"`
  - `apps/frontend/hooks/use-search-queries.ts:48` [string_literal]: `if (key === 'page' || key === 'name') continue;`

### `limit`
- **Value**: "Limit"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/query/api-pagination.tsx:197` [Tran]: `<Tran text="limit" />`

### `copied`
- **Value**: "Copied"
- **Classification**: COMMON_SHARED
- **Occurrences**: 6
- **Domains detected**: server, tools, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:70` [Tran]: `toast.info(<Tran text="copied" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/player-connects/page.tsx:84` [Tran]: `toast.success(<Tran text="copied" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/address-button.tsx:19` [Tran]: `toast.info(<Tran text="copied" />, {`
  - `apps/frontend/app/[locale]/tools/logic/components/right/right-bar.tsx:22` [Tran]: `toast.success(<Tran text="copied" />);`
  - `apps/frontend/components/buttons/share-button.tsx:58` [Tran]: `toast.info(<Tran text="copied" />, {`
  - `apps/frontend/components/schematic/schematic-copy-button.tsx:34` [Tran]: `toast.success(<Tran text="copied" />);`

### `metadata`
- **Value**: "Metadata"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/detail.tsx:110` [Tran]: `<Tran text="metadata" />`

### `close`
- **Value**: "Close"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: server, content-patch, map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/host-button.tsx:148` [Tran]: `{isPending ? <LoadingSpinner /> : <Tran text="close" />}`
  - `apps/frontend/components/content-patch/verify-content-patch-dialog.tsx:96` [Tran]: `<Tran text="close" />`
  - `apps/frontend/components/map/verify-map-dialog.tsx:304` [Tran]: `<Tran text="close" />`
  - `apps/frontend/components/prompt-kit/feedback-bar.tsx:58` [t()]: `aria-label={t('close')}`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:306` [Tran]: `<Tran text="close" />`
  - `apps/frontend/components/ui/dialog.tsx:66` [Tran]: `<span className="sr-only"><Tran text="close" /></span>`
  - `apps/frontend/components/ui/sheet.tsx:69` [Tran]: `<span className="sr-only"><Tran text="close" /></span>`

### `api-docs`
- **Value**: "API Docs"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:347` [Tran]: `label: <Tran text="api-docs" />,`

### `github-uploads`
- **Value**: "Uploads"
- **Classification**: COMMON_SHARED
- **Occurrences**: 8
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-upload-form.tsx:48` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['github-uploads'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:97` [string_literal]: `queryKey={['github-uploads']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:184` [string_literal]: `queryKey={['github-uploads']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:226` [string_literal]: `queryKey={['github-uploads']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:250` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['github-uploads'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:292` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['github-uploads'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/page.tsx:13` [Tran]: `<Tran className="text-xl font-semibold" text="github-uploads" />`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:341` [Tran]: `label: <Tran text="github-uploads" />,`

### `image`
- **Value**: "image"
- **Classification**: COMMON_SHARED
- **Occurrences**: 41
- **Domains detected**: server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:116` [string_literal]: `<label className="flex h-9 items-center justify-center rounded-md border p-2" htmlFor="image" hidden>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:145` [string_literal]: `<label className="flex h-9 items-center justify-center rounded-md border p-2" htmlFor="image" hidden>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog.tsx:114` [string_literal]: `<label className="flex h-9 items-center justify-center rounded-md border p-2" htmlFor="image" hidden>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:176` [string_literal]: `<label className="flex h-9 items-center justify-center rounded-md border p-2" htmlFor="image" hidden>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:233` [string_literal]: `<label className="flex h-9 items-center justify-center rounded-md border p-2" htmlFor="image" hidden>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:437` [string_literal]: `htmlFor="image"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:170` [string_literal]: `htmlFor="image"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:296` [string_literal]: `name="image"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:307` [string_literal]: `form.watch('image')`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:309` [string_literal]: `SERVER_IMAGES.find((item) => item.image === form.watch('image')) || SERVER_IMAGES[0]!`
  - ... and 31 more occurrences

### `icon`
- **Value**: "Icon"
- **Classification**: COMMON_SHARED
- **Occurrences**: 98
- **Domains detected**: wiki, server, chat, tools, comment, notification, post, search-bar, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:187` [string_literal]: `mutationKey: ['icon', id],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:225` [string_literal]: `mutationKey: ['icon'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:358` [string_literal]: `mutationKey: ['icon'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:108` [string_literal]: `name="icon"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:137` [string_literal]: `name="icon"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog.tsx:106` [string_literal]: `name="icon"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:168` [string_literal]: `name="icon"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:188` [string_literal]: `<EllipsisButton variant="secondary" size="icon">`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:332` [string_literal]: `<Button variant="outline" size="icon">`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:564` [string_literal]: `<Button size="icon" variant="outline" title="server.add">`
  - ... and 88 more occurrences

### `vi`
- **Value**: "vi"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/lib/i18n.util.ts:12` [string_literal]: `vi: 'vi',`

### `ru`
- **Value**: "ru"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/lib/i18n.util.ts:10` [string_literal]: `ru: 'ru',`

### `id`
- **Value**: "id"
- **Classification**: COMMON_SHARED
- **Occurrences**: 15
- **Domains detected**: server, tools, post, tags, user
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:358` [string_literal]: `name="id"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/current-map-image.tsx:13` [string_literal]: `export default function CurrentMapImage({ server }: { server: Pick<ServerDto, 'id' | 'name'> }) {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/shutdown-button.tsx:25` [string_literal]: `export default function ShutdownButton({ server }: { server: Pick<ServerDto, 'id'> }) {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/usage-panel.tsx:16` [string_literal]: `server: Pick<ServerDto, 'id' | 'memory' | 'cpu'>;`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-types.tsx:48` [string_literal]: `} & Omit<Node, 'id' | 'type' | 'data'>;`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-types.tsx:559` [string_literal]: `export type LogicCondition = (typeof logicConditions)[number]['id'];`
  - `apps/frontend/app/[locale]/tools/logic/node/operation-node.tsx:101` [string_literal]: `export type LogicOp = (typeof logicOps)[number]['id'];`
  - `apps/frontend/components/post/simple-editor.tsx:309` [string_literal]: `<TagIdSelector returnType="id" value={field.value} onValueChange={field.onChange} type="posts" />`
  - `apps/frontend/components/server/player-info-admin-button.tsx:28` [string_literal]: `player: Pick<PlayerInfoRecord, 'id' | 'lastName' | 'admin'>;`
  - `apps/frontend/components/server/player-info-ban-button.tsx:42` [string_literal]: `player: Pick<PlayerInfoRecord, 'id' | 'lastName' | 'lastIP' | 'ips' | 'names'>;`
  - ... and 5 more occurrences

### `be`
- **Value**: "be"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/lib/i18n.util.ts:16` [string_literal]: `be: 'be',`

### `fr`
- **Value**: "fr"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/lib/i18n.util.ts:13` [string_literal]: `fr: 'fr',`

### `de`
- **Value**: "de"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/lib/i18n.util.ts:14` [string_literal]: `de: 'de',`

### `generate-share-link`
- **Value**: "Generate share link"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/buttons/share-button.tsx:36` [Tran]: `toastId = toast.loading(<Tran text="generate-share-link" />);`

### `day-ago`
- **Value**: "{{day}} days ago"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/relative-time.tsx:61` [Tran]: `return <Tran className={className} text="day-ago" args={{ day }} />;`

### `discord`
- **Value**: "Discord"
- **Classification**: COMMON_SHARED
- **Occurrences**: 5
- **Domains detected**: login, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/help/page.tsx:14` [Tran]: `<Tran text="discord" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/login/page.tsx:17` [string_literal]: `<LoginProvider provider="discord">`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:115` [Tran]: `<span><Tran text="discord" /></span>`
  - `apps/frontend/components/buttons/login-button.tsx:29` [string_literal]: `<LoginProvider className="bg-[rgb(88,101,242)]" provider="discord">`
  - `apps/frontend/components/error/report-error-form.tsx:74` [Tran]: `<DiscordIcon /> <Tran text="discord" />`

### `stacktrace`
- **Value**: "Stacktrace"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-details-view.tsx:58` [Tran]: `<Tran text="stacktrace" />`

### `category`
- **Value**: "Category"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-group-dialog.tsx:95` [Tran]: `<Tran text="category" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:152` [Tran]: `<Tran text="category" />`

### `planet`
- **Value**: "Planet"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:45` [string_literal]: `mutationKey: ['planet'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog.tsx:44` [string_literal]: `mutationKey: ['planet'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:114` [Tran]: `<Tran text="planet" />`

### `no-data`
- **Value**: "No data found"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:188` [Tran]: `<Tran text="no-data" />`
  - `apps/frontend/components/query/api-item.tsx:81` [Tran]: `<Tran text="no-data" />`

### `user`
- **Value**: "Users"
- **Classification**: COMMON_SHARED
- **Occurrences**: 8
- **Domains detected**: server, user
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:233` [string_literal]: `onClick={() => setTarget('user')}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:236` [string_literal]: `target === 'user'`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:264` [string_literal]: `{target === 'user' && (`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-autocomplete.ts:154` [string_literal]: `if (paramName.includes('player') || paramName.includes('user') || paramName.includes('target')) {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/components/user-map-list.tsx:23` [string_literal]: `<PreviewContainer variant="user">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/users/[id]/components/user-schematic-list.tsx:24` [string_literal]: `<PreviewContainer variant="user">`
  - `apps/frontend/components/user/user-component.tsx:332` [string_literal]: `if (id === 'user') {`
  - `apps/frontend/i18n.config.ts:45` [string_literal]: `'user',`

### `add`
- **Value**: "Add"
- **Classification**: COMMON_SHARED
- **Occurrences**: 10
- **Domains detected**: user, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:212` [Tran]: `<Tran text="add" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:149` [Tran]: `<Tran text="add" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:154` [Tran]: `<Tran text="add" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:238` [Tran]: `<Tran text="add" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-env-form.tsx:236` [string_literal]: `<Tran text={initial ? 'save' : 'add'} />`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:237` [Tran]: `<Tran text="add" />`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:360` [Tran]: `<Button type="submit"><Tran text="add" /></Button>`
  - `apps/frontend/app/[locale]/tools/logic/node/operation-node.tsx:18` [string_literal]: `{ id: 'add', sign: '+', type: 'binary', op: (a: any, b: any) => a + b },`
  - `apps/frontend/app/[locale]/tools/logic/node/operation-node.tsx:109` [string_literal]: `state: { op: 'add', result: 'result', a: 'a', b: 'b' } as { op: LogicOp; result: string; a: string; b: string },`
  - `apps/frontend/app/[locale]/tools/logic/node/switch-node.tsx:104` [Tran]: `<span><Tran text="add" /></span>`

### `comments`
- **Value**: "Comments"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: comment, post
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:32` [string_literal]: `const COMMENTS_ADMIN_QUERY_KEY = ['comments', 'admin'];`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:304` [Tran]: `label: <Tran text="comments" />,`
  - `apps/frontend/components/comment/comment-section.tsx:93` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['comments', itemId, itemType] });`
  - `apps/frontend/components/comment/comment-section.tsx:176` [string_literal]: `queryKey: ['comments', itemId, itemType],`
  - `apps/frontend/components/comment/comment-section.tsx:248` [string_literal]: `queryKey: ['comments', itemId, itemType],`
  - `apps/frontend/components/comment/comment-section.tsx:469` [string_literal]: `queryKey: ['comments', itemId, itemType],`
  - `apps/frontend/components/post/post-card.tsx:19` [string_literal]: `'itemId' | 'title' | 'summary' | 'createdAt' | 'createdBy' | 'cover' | 'comments' | 'likes' | 'views'`

### `select-user`
- **Value**: "Select user"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: moderation, server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/actions/page.tsx:269` [Tran]: `<Tran text="select-user" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/actions/page.tsx:274` [Tran]: `<Tran text="select-user" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:162` [Tran]: `<Tran text="select-user" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:263` [Tran]: `<Tran text="select-user" />`

### `select`
- **Value**: "Select"
- **Classification**: COMMON_SHARED
- **Occurrences**: 10
- **Domains detected**: server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:244` [Tran]: `render={(item) => (item ? <span>{item.name}</span> : <Tran text="select" />)}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:425` [Tran]: `render={(item) => (item ? <span>{item.name}</span> : <Tran text="select" />)}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-webhook-card.tsx:329` [Tran]: `render={(item) => (item ? <span>{item.name}</span> : <Tran text="select" />)}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-webhook-card.tsx:510` [Tran]: `render={(item) => (item ? <span>{item.name}</span> : <Tran text="select" />)}`
  - `apps/frontend/app/[locale]/tools/logic/node/select-node.tsx:22` [string_literal]: `label: 'select',`
  - `apps/frontend/components/combo-box/combo-box.tsx:56` [string_literal]: `aria-label='select'`
  - `apps/frontend/components/combo-box/combo-box.tsx:65` [Tran]: `{value ? render(value as T) : (empty ?? <Tran text="select" />)}`
  - `apps/frontend/components/ui/carousel.tsx:106` [string_literal]: `api.on('select', onSelect);`
  - `apps/frontend/components/ui/carousel.tsx:109` [string_literal]: `api?.off('select', onSelect);`
  - `apps/frontend/components/ui/select.tsx:12` [string_literal]: `return <SelectPrimitive.Root data-slot="select" {...props} />`

### `minute-ago`
- **Value**: "{{minute}} minutes ago"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/relative-time.tsx:51` [Tran]: `return <Tran className={className} text="minute-ago" args={{ minute }} />;`

### `hour-ago`
- **Value**: "{{hour}} hours ago"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/relative-time.tsx:56` [Tran]: `return <Tran className={className} text="hour-ago" args={{ hour }} />;`

### `file`
- **Value**: "File"
- **Classification**: COMMON_SHARED
- **Occurrences**: 25
- **Domains detected**: map, schematic, server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:457` [string_literal]: `type="file"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:142` [string_literal]: `<Input type="file" accept=".hjson, .json, .txt" onChange={onFileChange} />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:92` [string_literal]: `data.append('file', file);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:207` [string_literal]: `type="file"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog.tsx:95` [string_literal]: `data.append('file', file);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog.tsx:260` [string_literal]: `type="file"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/files/page.tsx:203` [string_literal]: `const { t } = useI18n('file');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/files/page.tsx:329` [string_literal]: `const { t } = useI18n('file');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/files/page.tsx:369` [string_literal]: `type="file"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/maps/components/installed-map-list.tsx:185` [string_literal]: `type="file"`
  - ... and 15 more occurrences

### `setting`
- **Value**: "Setting"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/server-nav.tsx:126` [string_literal]: `id: 'setting', //`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:128` [Tran]: `label: <Tran text="setting" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:139` [string_literal]: `const settingFilter = links.find((l) => l.id === 'setting')?.filter;`
  - `apps/frontend/i18n.config.ts:39` [string_literal]: `'setting',`

### `cancel`
- **Value**: "Cancel"
- **Classification**: COMMON_SHARED
- **Occurrences**: 44
- **Domains detected**: wiki, user, comment, post, server, tools, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:99` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:111` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:222` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:443` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:618` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:737` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:225` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:281` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:385` [Tran]: `<Tran text="cancel" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:450` [Tran]: `<Tran text="cancel" />`
  - ... and 34 more occurrences

### `error`
- **Value**: "Error"
- **Classification**: COMMON_SHARED
- **Occurrences**: 63
- **Domains detected**: user, server, tools, chat, schematic, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(home)/components/mod-section.tsx:21` [Tran]: `toast.error(<Tran text="error" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:76` [Tran]: `toast.error(<Tran text="error" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/create-user-form.tsx:25` [Tran]: `toast.error(<Tran text="error" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:33` [Tran]: `toast.error(<Tran text="error" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:105` [Tran]: `toast.error(<Tran text="error" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:49` [Tran]: `toast.error(<Tran text="error" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/player-connects/page.tsx:89` [Tran]: `toast.error(<Tran text="error" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/page.tsx:44` [Tran]: `toast.error(<Tran text="error" />, { description: err.message });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/page.tsx:121` [Tran]: `toast.error(<Tran text="error" />, { description: err.message });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:136` [Tran]: `toast.error(<Tran text="error" />, { description: error.message });`
  - ... and 53 more occurrences

### `month-ago`
- **Value**: "{{month}} months ago"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/relative-time.tsx:71` [Tran]: `return <Tran className={className} text="month-ago" args={{ month }} />;`

### `submit`
- **Value**: "Submit"
- **Classification**: COMMON_SHARED
- **Occurrences**: 45
- **Domains detected**: wiki, user, server, chat, tools, post
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-upload-form.tsx:141` [string_literal]: `<Button type="submit" disabled={uploadMutation.isPending} className="w-full">`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:382` [string_literal]: `<Button type="submit" disabled={uploadMutation.isPending} className="w-full">`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:340` [string_literal]: `<Button type="submit" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:459` [string_literal]: `<Button type="submit" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:328` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:398` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:164` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:147` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:213` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-group-dialog.tsx:114` [string_literal]: `<Button type="submit" title="upload" disabled={isPending}>`
  - ... and 35 more occurrences

### `root`
- **Value**: "Root"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:189` [Tran]: `<Tran text="root" />`
  - `apps/frontend/components/forms/media-upload.form.tsx:231` [Tran]: `<Tran text="root" />`

### `second-ago`
- **Value**: "{{second}} seconds ago"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/relative-time.tsx:43` [string_literal]: `text="second-ago"`

### `users`
- **Value**: "Users"
- **Classification**: COMMON_SHARED
- **Occurrences**: 24
- **Domains detected**: user, server, chat, search-bar
- **Usage locations**:
  - `apps/frontend/action/index.ts:11` [string_literal]: `tags: ['users', id],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-upload-form.tsx:31` [string_literal]: `queryKey: ['users', query],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:272` [string_literal]: `queryKey: ['users', query],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/create-user-form.tsx:30` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['users'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:38` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['users'], exact: false });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:110` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['users'], exact: false });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:44` [string_literal]: `const USERS_MANAGEMENT_QUERY_KEY = ['users', 'management'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:51` [string_literal]: `<Tabs defaultValue="users" className="flex flex-col flex-1 overflow-hidden">`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:54` [string_literal]: `<TabsTrigger value="users" className="text-xs">`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:55` [Tran]: `<Tran text="users" />`
  - ... and 14 more occurrences

### `power-production`
- **Value**: "Power Production"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:150` [Tran]: `<Tran text="power-production" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:155` [Tran]: `<Tran text="power-production" />`

### `delete-fail`
- **Value**: "Delete failed"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: comment, post
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-planet-dialog.tsx:29` [Tran]: `toast.error(<Tran text="delete-fail" />, { description: error.message });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-category-dialog.tsx:29` [Tran]: `toast.error(<Tran text="delete-fail" />, { description: error.message });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-dialog.tsx:29` [Tran]: `toast.error(<Tran text="delete-fail" />, { description: error.message });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-group-dialog.tsx:28` [Tran]: `toast.error(<Tran text="delete-fail" />, { description: error.message });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:77` [Tran]: `toast.error(<Tran text="delete-fail" />, { description: error.message });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/[id]/components/delete-post-dialog.tsx:42` [Tran]: `toast.error(<Tran text="delete-fail" />, { description: error.message });`
  - `apps/frontend/components/comment/comment-section.tsx:96` [Tran]: `toast.error(<Tran text="delete-fail" />, { description: error.message });`

### `settings`
- **Value**: "Settings"
- **Classification**: COMMON_SHARED
- **Occurrences**: 6
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:33` [string_literal]: `parseAsString.withDefault('settings').withOptions({ shallow: true, clearOnDefault: true }),`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:36` [string_literal]: `const safeTab = tab === 'shares' ? 'shares' : tab === 'notifications' ? 'notifications' : 'settings';`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:43` [string_literal]: `<TabsTrigger className="flex-none px-3" value="settings">`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:44` [Tran]: `<Tran text="settings" />`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:54` [string_literal]: `<TabsContent value="settings" className="mt-0 flex-1 overflow-auto rounded-md border bg-card/30 p-3">`
  - `apps/frontend/app/[locale]/components/navbar.tsx:433` [Tran]: `<Tran text="settings" />`

### `bug-report`
- **Value**: "Bug report"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:177` [Tran]: `label: <Tran text="bug-report" />,`

### `name`
- **Value**: "Name"
- **Classification**: COMMON_SHARED
- **Occurrences**: 36
- **Domains detected**: user, server, tools, map, schematic, search-bar
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:259` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:316` [string_literal]: `form.setValue('name', image?.name ?? '');`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:311` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:381` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:73` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:65` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:92` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog.tsx:71` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-category-dialog.tsx:72` [string_literal]: `name="name"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:95` [string_literal]: `name="name"`
  - ... and 26 more occurrences

### `description`
- **Value**: "Description"
- **Classification**: COMMON_SHARED
- **Occurrences**: 13
- **Domains detected**: server, map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:97` [string_literal]: `name="description"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/page.tsx:160` [string_literal]: `name="description"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/page.tsx:164` [Tran]: `<Tran text="description" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/page.tsx:71` [string_literal]: `name="description"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/page.tsx:75` [Tran]: `<Tran text="description" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:137` [string_literal]: `name="description"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form.tsx:132` [string_literal]: `name="description"`
  - `apps/frontend/components/item/item-field-edit-dialog.tsx:28` [string_literal]: `fieldKey: 'name' | 'description';`
  - `apps/frontend/components/map/verify-map-dialog.tsx:203` [Tran]: `<Tran text="description" />`
  - `apps/frontend/components/map/verify-map-dialog.tsx:207` [string_literal]: `fieldKey="description"`
  - ... and 3 more occurrences

### `chat`
- **Value**: "Chat"
- **Classification**: COMMON_SHARED
- **Occurrences**: 23
- **Domains detected**: server, chat
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:178` [string_literal]: `const [mode, setMode] = useState<'chat' | 'embed'>(() =>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:179` [string_literal]: `parseEmbedJson(form.getValues('data')) ? 'embed' : 'chat',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:267` [string_literal]: `const newMode = val as 'chat' | 'embed';`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:276` [string_literal]: `<TabsTrigger value="chat">Chat Message</TabsTrigger>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:279` [string_literal]: `<TabsContent value="chat">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:356` [string_literal]: `const [mode, setMode] = useState<'chat' | 'embed'>(() =>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:357` [string_literal]: `parseEmbedJson(webhook.data) ? 'embed' : 'chat',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:448` [string_literal]: `const newMode = val as 'chat' | 'embed';`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:457` [string_literal]: `<TabsTrigger value="chat">Chat Message</TabsTrigger>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:460` [string_literal]: `<TabsContent value="chat">`
  - ... and 13 more occurrences

### `shared-links`
- **Value**: "Shared links"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:50` [Tran]: `<Tran text="shared-links" />`

### `saved`
- **Value**: "Saved"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:128` [Tran]: `toast.success(<Tran text="saved" />);`

### `credit`
- **Value**: "Credit"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/server-nav.tsx:70` [string_literal]: `id: 'credit',`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:72` [Tran]: `label: <Tran text="credit" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:133` [string_literal]: `].filter((item) => showCreditPage || item.id !== 'credit');`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:172` [string_literal]: `items: [toItem('players'), toItem('credit'), toItem('admin'), toItem('webhooks'), toItem('workflow')].filter(`

### `crash`
- **Value**: "Crash"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:172` [Tran]: `label: <Tran text="crash" />,`

### `verify`
- **Value**: "Verify"
- **Classification**: COMMON_SHARED
- **Occurrences**: 8
- **Domains detected**: map, schematic, content-patch
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/[id]/page.tsx:174` [Tran]: `<Tran text="verify" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/[id]/page.tsx:180` [Tran]: `<Tran text="verify" />`
  - `apps/frontend/app/[locale]/components/navbar-badge.tsx:13` [string_literal]: `queryKey: ['schematics', 'count', 'verify'],`
  - `apps/frontend/app/[locale]/components/navbar-badge.tsx:27` [string_literal]: `queryKey: ['maps', 'count', 'verify'],`
  - `apps/frontend/app/[locale]/components/navbar-badge.tsx:41` [string_literal]: `queryKey: ['content-patches', 'count', 'verify'],`
  - `apps/frontend/components/content-patch/verify-content-patch-dialog.tsx:112` [Tran]: `<Tran text="verify" />`
  - `apps/frontend/components/map/verify-map-dialog.tsx:323` [Tran]: `<Tran text="verify" />`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:325` [Tran]: `<Tran text="verify" />`

### `no-item`
- **Value**: "No item found"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Domains detected**: search-bar, tags
- **Usage locations**:
  - `apps/frontend/components/search-bar/author-selector.tsx:146` [Tran]: `<Tran text="no-item" />`
  - `apps/frontend/components/search-bar/dropdowns/author-dropdown.tsx:37` [Tran]: `<Tran text="no-item" />`
  - `apps/frontend/components/tag/tag-selector.tsx:48` [Tran]: `<Tran text="no-item" />`

### `avatar`
- **Value**: "Avatar"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: user, server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/create-user-form.tsx:62` [Tran]: `<Tran text="avatar" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:160` [string_literal]: `name="avatar"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form.tsx:155` [string_literal]: `name="avatar"`
  - `apps/frontend/components/ui/avatar.tsx:17` [string_literal]: `data-slot="avatar"`

### `unselect-image`
- **Value**: "Unselect image"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/forms/image-select.form.tsx:37` [Tran]: `<Tran text="unselect-image" />`

### `accept`
- **Value**: "Accept"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/forms/image-select.form.tsx:41` [Tran]: `<Tran text="accept" />`

### `reject`
- **Value**: "Reject"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/components/item/reject-item-dialog.tsx:52` [string_literal]: `const mutationKey = ['verification', 'reject', itemType, id];`
  - `apps/frontend/components/item/reject-item-dialog.tsx:107` [Tran]: `<Tran text="reject" />`

### `week-ago`
- **Value**: "{{week}} weeks ago"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/relative-time.tsx:66` [Tran]: `return <Tran className={className} text="week-ago" args={{ week }} />;`

### `edit`
- **Value**: "Edit"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: user, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:156` [Tran]: `<Tran text="edit" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:137` [Tran]: `<Tran text="edit" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:172` [Tran]: `<Tran className="px-1 text-lg font-semibold" text="edit"></Tran>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:107` [Tran]: `<Tran text="edit" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:113` [Tran]: `<Tran text="edit" />`
  - `apps/frontend/app/[locale]/new-post/page.client.tsx:47` [string_literal]: `const postId = searchParams.get('edit');`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:78` [Tran]: `<Button variant="ghost"><Tran text="edit" /></Button>`

### `delete`
- **Value**: "Delete"
- **Classification**: COMMON_SHARED
- **Occurrences**: 41
- **Domains detected**: wiki, comment, post, server, tools, notification, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:171` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:193` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-planet-dialog.tsx:38` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-category-dialog.tsx:40` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-dialog.tsx:40` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-group-dialog.tsx:39` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:209` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:215` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:430` [Tran]: `<Tran text="delete" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:436` [Tran]: `<Tran text="delete" />`
  - ... and 31 more occurrences

### `delete-success`
- **Value**: "Delete successful"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: comment, post
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-planet-dialog.tsx:26` [Tran]: `toast.success(<Tran text="delete-success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-category-dialog.tsx:26` [Tran]: `toast.success(<Tran text="delete-success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-dialog.tsx:26` [Tran]: `toast.success(<Tran text="delete-success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-group-dialog.tsx:25` [Tran]: `toast.success(<Tran text="delete-success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:72` [Tran]: `toast.success(<Tran text="delete-success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/posts/[id]/components/delete-post-dialog.tsx:38` [Tran]: `toast.success(<Tran text="delete-success" />);`
  - `apps/frontend/components/comment/comment-section.tsx:92` [Tran]: `toast.success(<Tran text="delete-success" />);`

### `color`
- **Value**: "Color"
- **Classification**: COMMON_SHARED
- **Occurrences**: 17
- **Domains detected**: tools, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:80` [string_literal]: `name="color"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:84` [Tran]: `<Tran text="color" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-category-dialog.tsx:87` [string_literal]: `name="color"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-category-dialog.tsx:91` [Tran]: `<Tran text="color" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:197` [string_literal]: `name="color"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:201` [Tran]: `<Tran text="color" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:399` [string_literal]: `name="color"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:403` [Tran]: `<Tran text="color" />`
  - `apps/frontend/app/[locale]/tools/logic/node/block-control-node.tsx:15` [string_literal]: `export const blockControlModes = ['enabled', 'shoot', 'shootp', 'config', 'color'] as const;`
  - `apps/frontend/app/[locale]/tools/logic/node/block-control-node.tsx:140` [string_literal]: `{(mode === 'config' || mode === 'color') && (`
  - ... and 7 more occurrences

### `refresh`
- **Value**: "Refresh"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:137` [Tran]: `<Tran text="refresh" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:256` [Tran]: `<Tran text="refresh" />`
  - `apps/frontend/components/common/session-error-screen.tsx:22` [Tran]: `{isFetching ? <LoadingSpinner /> : <Tran text="refresh" />}`

### `sort`
- **Value**: "Sort"
- **Classification**: COMMON_SHARED
- **Occurrences**: 5
- **Domains detected**: tools, search-bar
- **Usage locations**:
  - `apps/frontend/app/[locale]/tools/logic/node/block-radar-node .tsx:99` [string_literal]: `<LogicFieldLabel name="sort" />`
  - `apps/frontend/app/[locale]/tools/logic/node/block-radar-node .tsx:102` [string_literal]: `name="sort"`
  - `apps/frontend/app/[locale]/tools/logic/node/unit-radar-node.tsx:91` [string_literal]: `<LogicFieldLabel name="sort" />`
  - `apps/frontend/app/[locale]/tools/logic/node/unit-radar-node.tsx:92` [string_literal]: `<LogicComboboxField className="w-full" name="sort" values={radarSortOptions} />`
  - `apps/frontend/components/search-bar/search-bar.tsx:46` [string_literal]: `const [sortQuery, setSortQuery] = useQueryState('sort', {`

### `status`
- **Value**: "Status"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: post, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:41` [string_literal]: `GitHubUpload['status'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:69` [string_literal]: `const [statusFilter] = useQueryState('status', {`
  - `apps/frontend/components/post/simple-editor.tsx:317` [string_literal]: `name="status"`
  - `apps/frontend/components/tools/ProcessingOverlay.tsx:35` [string_literal]: `role="status"`

### `or`
- **Value**: "or"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: wiki, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:547` [Tran]: `<Tran text="or" />`
  - `apps/frontend/app/[locale]/tools/logic/node/operation-node.tsx:38` [string_literal]: `{ id: 'or', sign: 'or', type: 'binary', op: (a: any, b: any) => a | b },`

### `add-admin`
- **Value**: "Add Admin"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:47` [Tran]: `<Tran text="add-admin" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:52` [Tran]: `<Tran text="add-admin" />`

### `loading`
- **Value**: "Loading"
- **Classification**: COMMON_SHARED
- **Occurrences**: 22
- **Domains detected**: server, user
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:337` [t()]: `{t('loading', { defaultValue: 'Loading...' })}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/host-button.tsx:84` [Tran]: `return toast(<Tran text="loading" />);`
  - `apps/frontend/components/layout/client-protected-element.tsx:20` [string_literal]: `if (state === 'loading') {`
  - `apps/frontend/components/layout/protected-route.tsx:21` [string_literal]: `if (!isHydrated || state === 'loading') {`
  - `apps/frontend/components/prompt-kit/loader.tsx:47` [Tran]: `<span className="sr-only"><Tran text="loading" /></span>`
  - `apps/frontend/components/prompt-kit/loader.tsx:93` [Tran]: `<span className="sr-only"><Tran text="loading" /></span>`
  - `apps/frontend/components/prompt-kit/loader.tsx:114` [Tran]: `<span className="sr-only"><Tran text="loading" /></span>`
  - `apps/frontend/components/prompt-kit/loader.tsx:140` [Tran]: `<span className="sr-only"><Tran text="loading" /></span>`
  - `apps/frontend/components/prompt-kit/loader.tsx:184` [Tran]: `<span className="sr-only"><Tran text="loading" /></span>`
  - `apps/frontend/components/prompt-kit/loader.tsx:228` [Tran]: `<span className="sr-only"><Tran text="loading" /></span>`
  - ... and 12 more occurrences

### `assign-server`
- **Value**: "Assign Server"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:121` [Tran]: `<Tran text="assign-server" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:126` [Tran]: `<Tran text="assign-server" />`

### `unassign`
- **Value**: "Remove"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:71` [Tran]: `<Tran text="unassign" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:88` [Tran]: `<Tran text="unassign" />`

### `crashes-for`
- **Value**: "Crashes for {{mod}}"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/page.tsx:24` [Tran]: `<Tran text="crashes-for" args={{ mod }} />`

### `new-version-detected`
- **Value**: "Detect new version, reload to update"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/client.tsx:30` [Tran]: `<Tran text="new-version-detected" />`

### `reload`
- **Value**: "Reload"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/client.tsx:32` [Tran]: `<Tran text="reload" />`

### `show-more`
- **Value**: "Show more"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/components/common/json-display.tsx:67` [Tran]: `<Tran text="show-more" />({json.length - show}`
  - `apps/frontend/components/common/json-display.tsx:133` [Tran]: `<Tran text="show-more" />({Object.entries(json).length - show}`

### `or-report-error-via-discord`
- **Value**: "Or report error via Discord"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/error/report-error-form.tsx:66` [Tran]: `<Tran text="or-report-error-via-discord" />`

### `not-found`
- **Value**: "Not found"
- **Classification**: COMMON_SHARED
- **Occurrences**: 8
- **Domains detected**: server, user
- **Usage locations**:
  - `apps/frontend/components/common/not-found-card.tsx:19` [Tran]: `<Tran text="not-found" />`
  - `apps/frontend/components/server/server-fetch-state.tsx:33` [Tran]: `{isLoading ? <LoadingSpinner /> : <Tran text="not-found" />}`
  - `apps/frontend/components/user/user-component.tsx:29` [string_literal]: `state: 'not-found';`
  - `apps/frontend/components/user/user-component.tsx:55` [string_literal]: `: ({ state: 'not-found' } as const),`
  - `apps/frontend/components/user/user-component.tsx:91` [string_literal]: `: ({ state: 'not-found' } as const),`
  - `apps/frontend/components/user/user-component.tsx:211` [string_literal]: `if (user.state === 'not-found') {`
  - `apps/frontend/components/user/user-component.tsx:274` [string_literal]: `if (user.state === 'not-found') {`
  - `apps/frontend/components/user/user-component.tsx:318` [string_literal]: `if (user.state === 'not-found') {`

### `not-found-description`
- **Value**: "The content you requested could not be found."
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/not-found-card.tsx:22` [Tran]: `<Tran text="not-found-description" />`

### `authorities`
- **Value**: "Authorities"
- **Classification**: COMMON_SHARED
- **Occurrences**: 12
- **Domains detected**: user, server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:276` [string_literal]: `name="authorities"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:280` [Tran]: `<Tran text="authorities" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:482` [string_literal]: `name="authorities"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:486` [Tran]: `<Tran text="authorities" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:46` [string_literal]: `mutate({ authorities: newAuthorities as UpdateUserSchema['authorities'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:68` [Tran]: `<Tran text="authorities" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:202` [string_literal]: `name="authorities"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:206` [Tran]: `<Tran text="authorities" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:274` [Tran]: `<Tran text="authorities" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:307` [string_literal]: `name="authorities"`
  - ... and 2 more occurrences

### `save`
- **Value**: "Save"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:311` [Tran]: `<Tran text="save" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-env-form.tsx:236` [string_literal]: `<Tran text={initial ? 'save' : 'add'} />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/page.tsx:87` [Tran]: `<Tran text="save" />`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:158` [Tran]: `<Tran text="save" />`

### `success`
- **Value**: "Success"
- **Classification**: COMMON_SHARED
- **Occurrences**: 23
- **Domains detected**: user, server, tools, login
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:39` [Tran]: `toast.success(<Tran text="success" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:111` [Tran]: `toast.success(<Tran text="success" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/page.tsx:41` [Tran]: `toast.success(<Tran text="success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:27` [Tran]: `toast.success(<Tran text="success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:110` [Tran]: `toast.success(<Tran text="success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/page.tsx:39` [Tran]: `toast.success(<Tran text="success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/admin-server-setting-form.tsx:68` [Tran]: `toast.success(<Tran text="success" />, {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:377` [Tran]: `toast.success(<Tran text="success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-group-info.tsx:43` [Tran]: `toast.success(<Tran text="success" />);`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-group-info.tsx:61` [Tran]: `toast.success(<Tran text="success" />);`
  - ... and 13 more occurrences

### `report-error`
- **Value**: "Report error"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Usage locations**:
  - `apps/frontend/components/common/session-error-screen.tsx:26` [Tran]: `<Tran text="report-error" />`
  - `apps/frontend/components/error/report-error-dialog.tsx:18` [Tran]: `<Tran text="report-error" />`
  - `apps/frontend/components/error/report-error-form.tsx:49` [Tran]: `<Tran text="report-error" />`

### `logout`
- **Value**: "Logout"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/navbar.tsx:441` [Tran]: `<Tran text="logout" />`
  - `apps/frontend/components/buttons/logout-button.tsx:36` [Tran]: `<Tran text="logout" />`

### `discord-server`
- **Value**: "Discord server"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/error/catch-error.tsx:87` [Tran]: `<Tran text="discord-server" />`

### `source`
- **Value**: "Source"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/node/workflow-node.tsx:132` [string_literal]: `handleType: 'source',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/node/workflow-node.tsx:143` [string_literal]: `type="source"`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-node.tsx:519` [string_literal]: `handleType: 'source',`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-node.tsx:550` [string_literal]: `type="source"`

### `ban`
- **Value**: "Ban"
- **Classification**: COMMON_SHARED
- **Occurrences**: 11
- **Domains detected**: user, server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:126` [Tran]: `<Tran text="ban" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:237` [Tran]: `<Tran text="ban" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:277` [Tran]: `<Tran text="ban" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/tokenize-command.test.ts:28` [string_literal]: `text: 'ban',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/tokenize-command.test.ts:76` [string_literal]: `expect(parsed.commandName).toBe('ban');`
  - `apps/frontend/components/server/ban-button.tsx:68` [Tran]: `<Tran text="ban" />`
  - `apps/frontend/components/server/ban-button.tsx:74` [Tran]: `<Tran text="ban" />`
  - `apps/frontend/components/server/ban-button.tsx:85` [Tran]: `<Tran text="ban" />`
  - `apps/frontend/components/server/player-info-ban-button.tsx:89` [Tran]: `<Tran text="ban" />`
  - `apps/frontend/components/server/player-info-ban-button.tsx:95` [Tran]: `<Tran text="ban" />`
  - ... and 1 more occurrences

### `dimensions`
- **Value**: "Dimensions"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:375` [Tran]: `<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="dimensions" /></div>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog.tsx:473` [Tran]: `<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="dimensions" /></div>`
  - `apps/frontend/components/map/verify-map-dialog.tsx:238` [Tran]: `<Tran text="dimensions" />`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:222` [Tran]: `<Tran text="dimensions" />`

### `power-balance`
- **Value**: "Power Balance"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:386` [Tran]: `{hasPowerData ? <Tran text="power-balance" /> : <Tran text="map.surface-area" />}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog.tsx:477` [Tran]: `<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="power-balance" /></div>`
  - `apps/frontend/components/map/verify-map-dialog.tsx:254` [Tran]: `{hasPowerData ? <Tran text="power-balance" /> : <Tran text="map.surface-area" />}`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:230` [Tran]: `<Tran text="power-balance" />`

### `blocks`
- **Value**: "Blocks"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Domains detected**: schematic, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog.tsx:494` [Tran]: `<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="blocks" /></div>`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:249` [Tran]: `<Tran text="blocks" />`
  - `apps/frontend/components/tools/OutputInfoPanel.tsx:86` [string_literal]: `unit?: string; // 'blocks' | 'tiles' | 'pixels'`

### `anonymous`
- **Value**: "Anonymous"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: map, server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:381` [Tran]: `{author || <Tran text="anonymous" />}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/credit/page.tsx:38` [string_literal]: `<Script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossOrigin="anonymous"></Script>`
  - `apps/frontend/components/map/verify-map-dialog.tsx:249` [Tran]: `{cartographer || <Tran text="anonymous" />}`
  - `apps/frontend/next.config.ts:32` [string_literal]: `crossOrigin: 'anonymous',`

### `submitted-by`
- **Value**: "Submitted by"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/components/map/verify-map-dialog.tsx:192` [Tran]: `<Tran text="submitted-by" />`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:176` [Tran]: `<Tran text="submitted-by" />`

### `no-description`
- **Value**: "No description"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/components/map/verify-map-dialog.tsx:228` [Tran]: `<Tran text="no-description" />`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:212` [Tran]: `<Tran text="no-description" />`

### `single`
- **Value**: "Single"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Domains detected**: wiki, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:47` [string_literal]: `<Accordion type="single" collapsible className="h-full overflow-hidden">`
  - `apps/frontend/app/[locale]/wiki/components/path-node.tsx:29` [string_literal]: `type="single"`
  - `apps/frontend/components/common/json-display.tsx:109` [string_literal]: `<Accordion type="single" collapsible>`
  - `apps/frontend/components/query/planet-selector.tsx:14` [string_literal]: `type: 'single';`
  - `apps/frontend/components/query/planet-selector.tsx:38` [string_literal]: `isSelected={type === 'single' ? value === planet.id : value.includes(planet.id)}`
  - `apps/frontend/components/query/planet-selector.tsx:41` [string_literal]: `type === 'single'`
  - `apps/frontend/components/tag/tag-selector.tsx:128` [string_literal]: `<Tran text={group.duplicate ? 'multi' : 'single'} />`

### `custom-reason-label`
- **Value**: "Rejection Reason (Optional)"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/item/reject-item-dialog.tsx:152` [Tran]: `<Tran text="custom-reason-label" />`

### `custom-reason-placeholder`
- **Value**: "Explain why this item is rejected or select a preset above..."
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/item/reject-item-dialog.tsx:165` [t()]: `placeholder={t('custom-reason-placeholder')}`

### `confirm-reject`
- **Value**: "Confirm Reject"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/item/reject-item-dialog.tsx:193` [Tran]: `<Tran text="confirm-reject" />`

### `unhandled`
- **Value**: "Unhandled"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/global-error.tsx:18` [Tran]: `<h1><Tran text="unhandled" /></h1>`

### `no-network`
- **Value**: "NO NETWORK"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/error/no-network.tsx:18` [Tran]: `return <span><Tran text="no-network" /></span>;`

### `can-not-connect-to-server`
- **Value**: "Can not connect to server"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/error/error-message.tsx:24` [Tran]: `return <p className={cn('text-destructive m-auto p-4 max-w-lg', className)}><Tran text="can-not-connect-to-server" /></p>;`

### `click-to-upload`
- **Value**: "Click to upload"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/forms/media-upload.form.tsx:696` [Tran]: `<span className="underline"><Tran text="click-to-upload" /></span> or drag and drop`

### `no-result`
- **Value**: "No result"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/components/tiptap/nodes/link-syntax-node/suggestion-list.tsx:94` [Tran]: `<div className="item"><Tran text="no-result" /></div>`
  - `apps/frontend/components/tiptap/nodes/link-syntax-node/suggestion-list.tsx:132` [Tran]: `<div className="item"><Tran text="no-result" /></div>`

### `insert-youtube-video`
- **Value**: "Insert YouTube Video"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/youtube-button/youtube-button.tsx:99` [Tran]: `<DialogTitle><Tran text="insert-youtube-video" /></DialogTitle>`

### `enter-youtube-url`
- **Value**: "Enter a YouTube URL to embed the video in your content."
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/youtube-button/youtube-button.tsx:100` [Tran]: `<DialogDescription><Tran text="enter-youtube-url" /></DialogDescription>`

### `more`
- **Value**: "More"
- **Classification**: COMMON_SHARED
- **Occurrences**: 4
- **Domains detected**: mod, server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/mods/page.tsx:104` [string_literal]: `<Badge key="more" variant="secondary" className="text-xs">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/mods/page.tsx:105` [t()]: `+{item.topics.length - 5} {t('more')}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/mods/components/download-mod-list.tsx:133` [string_literal]: `<Badge key="more" variant="secondary" className="text-xs">`
  - `apps/frontend/components/ui/breadcrumb.tsx:97` [Tran]: `<span className="sr-only"><Tran text="more" /></span>`

### `previous-slide`
- **Value**: "Previous slide"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/ui/carousel.tsx:189` [Tran]: `<span className="sr-only"><Tran text="previous-slide" /></span>`

### `next-slide`
- **Value**: "Next slide"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/ui/carousel.tsx:219` [Tran]: `<span className="sr-only"><Tran text="next-slide" /></span>`

### `sidebar`
- **Value**: "Sidebar"
- **Classification**: COMMON_SHARED
- **Occurrences**: 8
- **Usage locations**:
  - `apps/frontend/components/ui/sidebar-client.tsx:140` [string_literal]: `variant = 'sidebar',`
  - `apps/frontend/components/ui/sidebar-client.tsx:147` [string_literal]: `variant?: 'sidebar' | 'floating' | 'inset';`
  - `apps/frontend/components/ui/sidebar-client.tsx:155` [string_literal]: `data-slot="sidebar"`
  - `apps/frontend/components/ui/sidebar-client.tsx:168` [string_literal]: `data-sidebar="sidebar"`
  - `apps/frontend/components/ui/sidebar-client.tsx:169` [string_literal]: `data-slot="sidebar"`
  - `apps/frontend/components/ui/sidebar-client.tsx:180` [Tran]: `<SheetTitle><Tran text="sidebar" /></SheetTitle>`
  - `apps/frontend/components/ui/sidebar-client.tsx:196` [string_literal]: `data-slot="sidebar"`
  - `apps/frontend/components/ui/sidebar-client.tsx:226` [string_literal]: `data-sidebar="sidebar"`

### `displays-the-mobile-sidebar`
- **Value**: "Displays the mobile sidebar."
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/ui/sidebar-client.tsx:181` [Tran]: `<SheetDescription><Tran text="displays-the-mobile-sidebar" /></SheetDescription>`

### `toggle-sidebar`
- **Value**: "Toggle Sidebar"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Usage locations**:
  - `apps/frontend/components/ui/sidebar-client.tsx:254` [Tran]: `<span className="sr-only"><Tran text="toggle-sidebar" /></span>`
  - `apps/frontend/components/ui/sidebar-client.tsx:267` [t()]: `aria-label={t('toggle-sidebar')}`
  - `apps/frontend/components/ui/sidebar-client.tsx:270` [t()]: `title={t('toggle-sidebar')}`

### `sidebar-color`
- **Value**: "Sidebar Color"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:131` [Tran]: `<Label className="text-xs font-medium"><Tran text="sidebar-color" /></Label>`

### `full-size`
- **Value**: "Full size"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/components/map/verify-map-dialog.tsx:141` [Tran]: `<Tran text="full-size" />`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:134` [Tran]: `<Tran text="full-size" />`

### `none`
- **Value**: "None"
- **Classification**: COMMON_SHARED
- **Occurrences**: 42
- **Domains detected**: server, tools, comment, tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/current-map-image.tsx:66` [string_literal]: `<circle cx="12" cy="12" r={radius} stroke="gray" strokeWidth="2" fill="none" opacity="0.2" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/current-map-image.tsx:73` [string_literal]: `fill="none"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/usage-panel.tsx:122` [string_literal]: `<svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-8 w-full">`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/usage-panel.tsx:126` [string_literal]: `fill="none"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/tokenize-command.test.ts:48` [string_literal]: `expect(parsed.activeTarget).toBe('none');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/tokenize-command.ts:20` [string_literal]: `activeTarget: 'command' | 'argument' | 'none';`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/tokenize-command.ts:49` [string_literal]: `activeTarget: 'none',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/canvas-generator/components/advanced-settings.tsx:100` [string_literal]: `<SelectItem value="none">Original (No Filter)</SelectItem>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/canvas-generator/components/canvas-generator.tsx:476` [string_literal]: `<canvas ref={originalCanvasRef} style={{ display: 'none' }} />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/logic-display-generator/workers/logic-generator.worker.ts:24` [string_literal]: `if (settings.dithering.algorithm !== 'none') {`
  - ... and 32 more occurrences

### `tiles`
- **Value**: "tiles"
- **Classification**: COMMON_SHARED
- **Occurrences**: 5
- **Domains detected**: map, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog.tsx:396` [Tran]: `<Tran text="tiles" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/canvas-generator/components/canvas-generator.tsx:645` [string_literal]: `unit="tiles"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/sorter-generator/components/sorter-generator.tsx:821` [string_literal]: `unit="tiles"`
  - `apps/frontend/components/tools/OutputInfoPanel.tsx:86` [string_literal]: `unit?: string; // 'blocks' | 'tiles' | 'pixels'`
  - `apps/frontend/components/tools/OutputInfoPanel.tsx:167` [string_literal]: `unit = 'tiles',`

### `uploading`
- **Value**: "Uploading..."
- **Classification**: COMMON_SHARED
- **Occurrences**: 5
- **Usage locations**:
  - `apps/frontend/components/forms/media-upload.form.tsx:297` [string_literal]: `* @default "uploading"`
  - `apps/frontend/components/forms/media-upload.form.tsx:299` [string_literal]: `status: 'uploading' | 'success' | 'error';`
  - `apps/frontend/components/forms/media-upload.form.tsx:375` [string_literal]: `status: 'uploading',`
  - `apps/frontend/components/forms/media-upload.form.tsx:646` [string_literal]: `{fileItem.status === 'uploading' && (`
  - `apps/frontend/components/forms/media-upload.form.tsx:664` [string_literal]: `{fileItem.status === 'uploading' && <span className="font-semibold text-primary">{fileItem.progress}%</span>}`

### `failed-to-reject`
- **Value**: "Failed to reject item"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/item/reject-item-dialog.tsx:65` [t()]: `description: error?.message || t('failed-to-reject'),`

### `official`
- **Value**: "Official"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/navbar.tsx:202` [Tran]: `{nav.serverIsOfficial && <span className="text-xs text-muted-foreground"><Tran text="official" /></span>}`

### `account`
- **Value**: "Account"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/navbar.tsx:421` [Tran]: `<Tran text="account" />`

### `notifications`
- **Value**: "Notifications"
- **Classification**: COMMON_SHARED
- **Occurrences**: 20
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:75` [string_literal]: `queryKey: ['management', 'notifications', 'history', page],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:87` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['management', 'notifications', 'history'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:108` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['management', 'notifications', 'history'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:31` [string_literal]: `queryKey: ['notifications', 'unread-count'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:44` [string_literal]: `queryKey: ['notifications', 'list', category, unreadOnly],`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:62` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['notifications'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:69` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['notifications'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:77` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['notifications'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:87` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['notifications'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/components/notification-settings-tab.tsx:17` [string_literal]: `const queryKey = ['notifications', 'preferences'];`
  - ... and 10 more occurrences

### `share`
- **Value**: "Share"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:28` [string_literal]: `const SHARE_MY_QUERY_KEY = ['share', 'my'];`
  - `apps/frontend/components/buttons/share-button.tsx:94` [t()]: `aria-label={t('share')}`

### `theme-switcher`
- **Value**: "Theme switcher"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/common/theme-switcher.tsx:33` [t()]: `<Button aria-label={t('theme-switcher')} variant="ghost" size="icon" {...props}>`

### `helpful`
- **Value**: "Helpful"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/prompt-kit/feedback-bar.tsx:39` [t()]: `aria-label={t('helpful')}`

### `not-helpful`
- **Value**: "Not helpful"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/prompt-kit/feedback-bar.tsx:47` [t()]: `aria-label={t('not-helpful')}`

### `navigate-config`
- **Value**: "Navigate config"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/query/api-pagination.tsx:112` [t()]: `<Button variant="ghost" size="icon" aria-label={t('navigate-config')}>`

### `navigate`
- **Value**: "Navigate"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/query/api-pagination.tsx:161` [t()]: `aria-label={t('navigate')}`

### `open-full-size-tooltip`
- **Value**: "Open full size image in new tab"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/components/map/verify-map-dialog.tsx:137` [t()]: `title={t('open-full-size-tooltip')}`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:130` [t()]: `title={t('open-full-size-tooltip')}`

### `edit-name`
- **Value**: "Edit name"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/components/map/verify-map-dialog.tsx:172` [t()]: `triggerTitle={t('edit-name')}`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:165` [t()]: `triggerTitle={t('edit-name')}`

### `edit-description`
- **Value**: "Edit description"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Domains detected**: map, schematic
- **Usage locations**:
  - `apps/frontend/components/map/verify-map-dialog.tsx:213` [t()]: `triggerTitle={t('edit-description')}`
  - `apps/frontend/components/schematic/verify-schematic-dialog.tsx:197` [t()]: `triggerTitle={t('edit-description')}`

### `target`
- **Value**: "Target"
- **Classification**: COMMON_SHARED
- **Occurrences**: 17
- **Domains detected**: server, tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/use-terminal-autocomplete.ts:154` [string_literal]: `if (paramName.includes('player') || paramName.includes('user') || paramName.includes('target')) {`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/node/workflow-node.tsx:159` [string_literal]: `type={'target'}`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-node.tsx:573` [string_literal]: `handleType: 'target',`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-node.tsx:592` [string_literal]: `type={'target'}`
  - `apps/frontend/app/[locale]/tools/logic/components/logic-types.tsx:592` [string_literal]: `'target',`
  - `apps/frontend/app/[locale]/tools/logic/node/block-control-node.tsx:130` [string_literal]: `<LogicFieldLabel name="target" />`
  - `apps/frontend/app/[locale]/tools/logic/node/block-radar-node .tsx:75` [string_literal]: `<LogicFieldLabel name="target" />`
  - `apps/frontend/app/[locale]/tools/logic/node/block-radar-node .tsx:82` [string_literal]: `<LogicFieldLabel name="target" />`
  - `apps/frontend/app/[locale]/tools/logic/node/block-radar-node .tsx:89` [string_literal]: `<LogicFieldLabel name="target" />`
  - `apps/frontend/app/[locale]/tools/logic/node/sensor-node.tsx:84` [string_literal]: `<LogicFieldLabel name="target" />`
  - ... and 7 more occurrences

### `highlight-text`
- **Value**: "Highlight text"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/color-highlight-popover/color-highlight-popover.tsx:68` [t()]: `aria-label={t('highlight-text')}`

### `highlight`
- **Value**: "Highlight"
- **Classification**: COMMON_SHARED
- **Occurrences**: 7
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/color-highlight-button/use-color-highlight.ts:107` [string_literal]: `if (!isMarkInSchema('highlight', editor) || isNodeTypeSelected(editor, ['image'])) {`
  - `apps/frontend/components/tiptap/ui/color-highlight-button/use-color-highlight.ts:111` [string_literal]: `return editor.can().setMark('highlight');`
  - `apps/frontend/components/tiptap/ui/color-highlight-button/use-color-highlight.ts:118` [string_literal]: `return highlightColor ? editor.isActive('highlight', { color: highlightColor }) : editor.isActive('highlight');`
  - `apps/frontend/components/tiptap/ui/color-highlight-button/use-color-highlight.ts:129` [string_literal]: `return editor.chain().focus().unsetMark('highlight').run();`
  - `apps/frontend/components/tiptap/ui/color-highlight-button/use-color-highlight.ts:138` [string_literal]: `if (!isMarkInSchema('highlight', editor)) {`
  - `apps/frontend/components/tiptap/ui/color-highlight-button/use-color-highlight.ts:189` [string_literal]: `const success = editor.chain().focus().toggleMark('highlight', { color: highlightColor }).run();`
  - `apps/frontend/components/tiptap/ui/color-highlight-popover/color-highlight-popover.tsx:69` [t()]: `tooltip={t('highlight')}`

### `remove-highlight`
- **Value**: "Remove highlight"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/color-highlight-popover/color-highlight-popover.tsx:91` [t()]: `const menuItems = React.useMemo(() => [...colors, { label: t('remove-highlight'), value: 'none' }], [colors]);`
  - `apps/frontend/components/tiptap/ui/color-highlight-popover/color-highlight-popover.tsx:134` [t()]: `aria-label={t('remove-highlight')}`

### `highlight-colors`
- **Value**: "Highlight colors"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/color-highlight-popover/color-highlight-popover.tsx:186` [t()]: `<PopoverContent aria-label={t('highlight-colors')}>`

### `format-as-heading`
- **Value**: "Format text as heading"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/heading-dropdown-menu/heading-dropdown-menu.tsx:90` [t()]: `aria-label={t('format-as-heading')}`
  - `apps/frontend/components/tiptap/ui/table-dropdown-menu.tsx/table-dropdown-menu.tsx:130` [t()]: `aria-label={t('format-as-heading')}`

### `heading`
- **Value**: "Heading"
- **Classification**: COMMON_SHARED
- **Occurrences**: 12
- **Domains detected**: comment, post
- **Usage locations**:
  - `apps/frontend/components/comment/comment-content.tsx:31` [string_literal]: `TextAlign.configure({ types: ['heading', 'paragraph'] }),`
  - `apps/frontend/components/comment/comment-section.tsx:320` [string_literal]: `TextAlign.configure({ types: ['heading', 'paragraph'] }),`
  - `apps/frontend/components/post/simple-editor.tsx:395` [string_literal]: `TextAlign.configure({ types: ['heading', 'paragraph'] }),`
  - `apps/frontend/components/tiptap/ui/heading-button/use-heading.ts:73` [string_literal]: `if (!isNodeInSchema('heading', editor) || isNodeTypeSelected(editor, ['image'])) {`
  - `apps/frontend/components/tiptap/ui/heading-button/use-heading.ts:78` [string_literal]: `return level ? editor.can().setNode('heading', { level }) : editor.can().setNode('heading');`
  - `apps/frontend/components/tiptap/ui/heading-button/use-heading.ts:111` [string_literal]: `return level.some((l) => editor.isActive('heading', { level: l }));`
  - `apps/frontend/components/tiptap/ui/heading-button/use-heading.ts:114` [string_literal]: `return level ? editor.isActive('heading', { level }) : editor.isActive('heading');`
  - `apps/frontend/components/tiptap/ui/heading-button/use-heading.ts:167` [string_literal]: `const isActive = levels.some((l) => editor.isActive('heading', { level: l }));`
  - `apps/frontend/components/tiptap/ui/heading-button/use-heading.ts:169` [string_literal]: `const toggle = isActive ? chain.setNode('paragraph') : chain.setNode('heading', { level: toggleLevel });`
  - `apps/frontend/components/tiptap/ui/heading-button/use-heading.ts:194` [string_literal]: `if (!isNodeInSchema('heading', editor)) {`
  - ... and 2 more occurrences

### `paste-link-placeholder`
- **Value**: "Paste a link..."
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/link-popover/link-popover.tsx:113` [t()]: `placeholder={t('paste-link-placeholder')}`

### `apply-link`
- **Value**: "Apply link"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/link-popover/link-popover.tsx:128` [t()]: `title={t('apply-link')}`

### `open-in-new-window`
- **Value**: "Open in new window"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/link-popover/link-popover.tsx:140` [t()]: `title={t('open-in-new-window')}`

### `remove-link`
- **Value**: "Remove link"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/link-popover/link-popover.tsx:151` [t()]: `title={t('remove-link')}`

### `list-options`
- **Value**: "List options"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/list-dropdown-menu/list-dropdown-menu.tsx:91` [t()]: `aria-label={t('list-options')}`

### `list`
- **Value**: "List"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:44` [string_literal]: `queryKey: ['notifications', 'list', category, unreadOnly],`
  - `apps/frontend/components/combo-box/suggestion-input.tsx:45` [string_literal]: `aria-autocomplete="list"`
  - `apps/frontend/components/tiptap/ui/list-dropdown-menu/list-dropdown-menu.tsx:92` [t()]: `tooltip={t('list')}`

### `table`
- **Value**: "Table"
- **Classification**: COMMON_SHARED
- **Occurrences**: 3
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/table-dropdown-menu.tsx/table-dropdown-menu.tsx:131` [t()]: `tooltip={t('table')}`
  - `apps/frontend/components/ui/table.tsx:7` [string_literal]: `function Table({ className, ...props }: React.ComponentProps<'table'>) {`
  - `apps/frontend/components/ui/table.tsx:14` [string_literal]: `data-slot="table"`

### `youtube-url-placeholder`
- **Value**: "https://www.youtube.com/watch?v=..."
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/youtube-button/youtube-button.tsx:105` [t()]: `placeholder={t('youtube-url-placeholder')}`

### `insert-video`
- **Value**: "Insert Video"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui/youtube-button/youtube-button.tsx:123` [Tran]: `<Tran text="insert-video" />`

### `toolbar`
- **Value**: "Toolbar"
- **Classification**: COMMON_SHARED
- **Occurrences**: 2
- **Usage locations**:
  - `apps/frontend/components/tiptap/ui-primitive/toolbar/toolbar.tsx:98` [string_literal]: `role="toolbar"`
  - `apps/frontend/components/tiptap/ui-primitive/toolbar/toolbar.tsx:99` [t()]: `aria-label={t('toolbar')}`

### `inline-field`
- **Value**: "Inline Field"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:250` [Tran]: `<Tran text="inline-field" />`

### `add-field`
- **Value**: "Add Field"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:266` [Tran]: `<Tran text="add-field" />`

### `embed-title-placeholder`
- **Value**: "Embed title (e.g. Player Joined)"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:114` [t()]: `placeholder={t('embed-title-placeholder')}`

### `embed-description-placeholder`
- **Value**: "Embed description text... Use {{player}} for parameters"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:123` [t()]: `placeholder={t('embed-description-placeholder')}`

### `author-name-placeholder`
- **Value**: "Author Name"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:167` [t()]: `placeholder={t('author-name-placeholder')}`

### `author-icon-url-placeholder`
- **Value**: "Author Icon URL"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:173` [t()]: `placeholder={t('author-icon-url-placeholder')}`

### `field-name-placeholder`
- **Value**: "Field Name"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:217` [t()]: `placeholder={t('field-name-placeholder')}`

### `field-value-placeholder`
- **Value**: "Field Value"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/embed-builder.tsx:235` [t()]: `placeholder={t('field-value-placeholder')}`

### `author-icon-placeholder`
- **Value**: "Author Icon"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/components/webhooks/discord-embed-preview.tsx:102` [t()]: `alt={t('author-icon-placeholder')}`

### `occurrences`
- **Value**: "Occurrences"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-metadata.tsx:14` [Tran]: `<span className="text-xs font-medium text-primary uppercase tracking-wider"><Tran text="occurrences" /></span>`

### `first-seen`
- **Value**: "First Seen"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-metadata.tsx:18` [Tran]: `<span className="text-xs font-medium text-primary uppercase tracking-wider"><Tran text="first-seen" /></span>`

### `last-updated`
- **Value**: "Last Updated"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-metadata.tsx:22` [Tran]: `<span className="text-xs font-medium text-primary uppercase tracking-wider"><Tran text="last-updated" /></span>`

### `crash-report`
- **Value**: "Crash Report"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-header.tsx:10` [Tran]: `<h1 className="text-lg font-bold tracking-tight text-primary"><Tran text="crash-report" /></h1>`

### `resolved-by`
- **Value**: "Resolved By"
- **Classification**: COMMON_SHARED
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-header.tsx:21` [Tran]: `<span><Tran text="resolved-by" /></span>`

## Target Namespace: `server` (19 keys)

### `server`
- **Value**: "Server"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 16
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-managers/components/create-server-manager-dialog.tsx:30` [string_literal]: `const { t } = useI18n('server');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-managers/[id]/page.tsx:249` [string_literal]: `const { t } = useI18n('server');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/page.tsx:16` [t()]: `const title = t('server');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/page.tsx:46` [string_literal]: `const { t } = useI18n('server');`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:154` [Tran]: `<Tran className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" text="server" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-webhook-card.tsx:129` [Tran]: `<Tran className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" text="server" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form.tsx:38` [string_literal]: `queryKey: ['server', 'isOwner', server.id],`
  - `apps/frontend/app/[locale]/components/nav-context.tsx:20` [string_literal]: `mode: 'server';`
  - `apps/frontend/app/[locale]/components/nav-context.tsx:88` [string_literal]: `mode: 'server',`
  - `apps/frontend/app/[locale]/components/nav-context.tsx:113` [string_literal]: `if (nav.mode !== 'server') {`
  - ... and 6 more occurrences

### `group`
- **Value**: "Group"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 12
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-group-dialog.tsx:75` [string_literal]: `name="group"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:103` [Tran]: `<Tran className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" text="group" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-env-list.tsx:42` [Tran]: `<Tran text="group" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-webhook-card.tsx:108` [Tran]: `<Tran className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" text="group" />`
  - `apps/frontend/components/prompt-kit/chain-of-thought.tsx:138` [string_literal]: `className={cn("group", className)}`
  - `apps/frontend/components/tiptap/ui-primitive/button/button.tsx:85` [string_literal]: `role="group"`
  - `apps/frontend/components/tiptap/ui-primitive/toolbar/toolbar.tsx:113` [string_literal]: `<div ref={ref} role="group" className={cn('flex items-center gap-1', className)} {...props}>`
  - `apps/frontend/components/ui/button-group.tsx:32` [string_literal]: `role="group"`
  - `apps/frontend/components/ui/carousel.tsx:155` [string_literal]: `role="group"`
  - `apps/frontend/components/ui/input-group.tsx:15` [string_literal]: `role="group"`
  - ... and 2 more occurrences

### `banned`
- **Value**: "Banned"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 3
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/components/player-grid-item.tsx:43` [Tran]: `<span><Tran text="banned" /></span>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/page.tsx:55` [string_literal]: `'banned',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/page.tsx:253` [Tran]: `<Tran text="banned" />`

### `unban`
- **Value**: "Unban"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 3
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/components/server/player-info-unban-button.tsx:82` [Tran]: `<Tran text="unban" />`
  - `apps/frontend/components/server/player-info-unban-button.tsx:88` [Tran]: `<Tran text="unban" />`
  - `apps/frontend/components/server/player-info-unban-button.tsx:102` [Tran]: `<Tran text="unban" />`

### `active`
- **Value**: "Active"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 7
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:50` [string_literal]: `<TabsTrigger value="general" data-state={segment === null ? 'active' : 'inactive'} asChild>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:55` [string_literal]: `<TabsTrigger value="admins" data-state={segment === 'admins' ? 'active' : 'inactive'} asChild>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:60` [string_literal]: `<TabsTrigger value="envs" data-state={segment === 'envs' ? 'active' : 'inactive'} asChild>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:65` [string_literal]: `<TabsTrigger value="webhooks" data-state={segment === 'webhooks' ? 'active' : 'inactive'} asChild>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/command-signature.tsx:57` [Tran]: `<span><Tran text="active" /></span>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/components/player-grid-item.tsx:48` [Tran]: `<span className="text-muted-foreground"><Tran text="active" /></span>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/page.tsx:240` [Tran]: `<Tran text="active" />`

### `servers`
- **Value**: "Servers"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 89
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/sitemap.ts:6` [string_literal]: `const routes = ['schematics', 'maps', 'posts', 'servers', 'upload/schematic', 'upload/map', 'upload/post'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-env-form.tsx:166` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['servers'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:26` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['servers', serverId] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:38` [Tran]: `<Tran text="servers" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:45` [string_literal]: `queryKey={['server-groups', groupId, 'servers']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:109` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['servers', serverId] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-servers.tsx:134` [string_literal]: `queryKey={['servers', 'my']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:41` [string_literal]: `const PORT_QUERY_KEY = ['servers', 'port'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server.ts:9` [string_literal]: `queryKey: ['servers', id],`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server.ts:30` [string_literal]: `const server: ServerDto | undefined = queryClient.getQueryData(['servers', id]);`
  - ... and 79 more occurrences

### `url`
- **Value**: "URL"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 13
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-upload-form.tsx:79` [string_literal]: `type="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list.tsx:320` [string_literal]: `type="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:292` [string_literal]: `name="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/icons/page.tsx:414` [string_literal]: `name="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:217` [string_literal]: `name="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-webhooks.tsx:398` [string_literal]: `name="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-managers/components/create-server-manager-dialog.tsx:100` [string_literal]: `type="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-webhook-card.tsx:302` [string_literal]: `name="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-webhook-card.tsx:483` [string_literal]: `name="url"`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:177` [Tran]: `<Tran text="url" />`
  - ... and 3 more occurrences

### `console`
- **Value**: "Console"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 4
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/terminal-input.tsx:29` [string_literal]: `const { t } = useI18n('console');`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:49` [string_literal]: `id: 'console',`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:51` [Tran]: `label: <Tran text="console" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:163` [string_literal]: `...([toItem('dashboard'), toItem('console')].filter(Boolean) as NavGroupSingleItem[]),`

### `workflow`
- **Value**: "Workflow"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 11
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/node/workflow-node.tsx:48` [string_literal]: `type: 'workflow'; // for React Flow component mapping`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/node/workflow-node.tsx:56` [string_literal]: `type: 'workflow',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/workflow-editor.tsx:98` [string_literal]: `type: 'workflow',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/workflow-editor.tsx:116` [string_literal]: `type: 'workflow',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/workflow-editor.tsx:134` [string_literal]: `type: 'workflow',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/workflow-editor.tsx:152` [string_literal]: `type: 'workflow',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/workflow-editor.tsx:299` [string_literal]: `type: 'workflow',`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/workflows/components/workflow-editor.tsx:319` [string_literal]: `accept: 'workflow',`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:98` [string_literal]: `id: 'workflow',`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:100` [Tran]: `label: <Tran text="workflow" />,`
  - ... and 1 more occurrences

### `preview`
- **Value**: "Preview"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 13
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:148` [string_literal]: `alt="preview"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:177` [string_literal]: `alt="preview"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog.tsx:146` [string_literal]: `alt="preview"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:208` [string_literal]: `alt="preview"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:265` [string_literal]: `alt="preview"`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:471` [string_literal]: `alt="preview"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:125` [Tran]: `<Tran className="font-semibold" text="preview" />:`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:148` [Tran]: `<Tran className="font-semibold" text="preview" />:`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:206` [string_literal]: `alt="preview"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form.tsx:120` [Tran]: `<Tran className="font-semibold" text="preview" />:`
  - ... and 3 more occurrences

### `select-image`
- **Value**: "Select image"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 8
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:123` [Tran]: `<Tran text="select-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:152` [Tran]: `<Tran text="select-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog.tsx:121` [Tran]: `<Tran text="select-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:183` [Tran]: `<Tran text="select-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:240` [Tran]: `<Tran text="select-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:446` [Tran]: `<Tran text="select-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:179` [Tran]: `<Tran text="select-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form.tsx:170` [Tran]: `<Tran text="select-image" />`

### `update-server`
- **Value**: "Update"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/admin-server-setting-form.tsx:213` [Tran]: `{isPending ? <LoadingSpinner /> : <Tran text="update-server" />}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form.tsx:380` [Tran]: `{isPending ? <LoadingSpinner /> : <Tran text="update-server" />}`

### `all`
- **Value**: "All"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 8
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:53` [string_literal]: `const [target, setTarget] = useState<AdminTarget>('all');`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:121` [string_literal]: `targetId: target !== 'all' ? targetId.trim() : undefined,`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:138` [string_literal]: `(target === 'all' || targetId.trim().length > 0);`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:218` [string_literal]: `onClick={() => setTarget('all')}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:221` [string_literal]: `target === 'all'`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:457` [string_literal]: `{target === 'all'`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:616` [string_literal]: `{target === 'all'`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/players/page.tsx:227` [Tran]: `<Tran text="all" />`

### `transfer`
- **Value**: "Transfer"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/credit/page.tsx:168` [Tran]: `<Tran text="transfer" />`

### `current-credit`
- **Value**: "Current credit"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/credit/page.tsx:140` [Tran]: `<Tran text="current-credit" />: {currentCredit}`

### `effective`
- **Value**: "Effective"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-env-list.tsx:54` [string_literal]: `text="effective"`

### `admins`
- **Value**: "Admins"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 8
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-admin-form.tsx:65` [string_literal]: `queryKey={['server-groups', groupId, 'admins']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:55` [string_literal]: `<TabsTrigger value="admins" data-state={segment === 'admins' ? 'active' : 'inactive'} asChild>`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/layout.tsx:57` [Tran]: `<Tran text="admins" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:95` [string_literal]: `queryKey={['server-groups', server.groupId, 'admins']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:145` [string_literal]: `queryKey={['servers', server.id, 'admins']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:219` [string_literal]: `mutationKey: ['servers', server.id, 'admins'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:364` [string_literal]: `mutationKey: ['servers', serverId, 'admins'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form.tsx:424` [string_literal]: `mutationKey: ['servers', serverId, 'admins'],`

### `send`
- **Value**: "Send"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/console/components/terminal-input.tsx:345` [Tran]: `<span><Tran text="send" /></span>`
  - `apps/frontend/components/error/report-error-form.tsx:61` [Tran]: `<Tran text="send" />`

### `selected-image`
- **Value**: "Selected image"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: server
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog.tsx:184` [Tran]: `<Tran text="selected-image" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form.tsx:175` [Tran]: `<Tran text="selected-image" />`

## Target Namespace: `DELETE` (17 keys)

### `ua`
- **Value**: "ua"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `jp`
- **Value**: "jp"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `kr`
- **Value**: "kr"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `cn`
- **Value**: "cn"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `deleted`
- **Value**: "Deleted"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `pending`
- **Value**: "PENDING"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `rejected`
- **Value**: "Rejected"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `verified`
- **Value**: "Verified"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `waves`
- **Value**: "Wave"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `rules`
- **Value**: "rules"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `downloads`
- **Value**: "downloads"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `select-all`
- **Value**: "Select All"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `view-all`
- **Value**: "View All"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `import-success`
- **Value**: "Import Success"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `failed-to-load`
- **Value**: "Failed to load"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `rendering`
- **Value**: "Rendering..."
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

### `optional`
- **Value**: "(optional)"
- **Classification**: UNUSED
- **Occurrences**: 0
- **Usage locations**: *None found in frontend source*

## Target Namespace: `tools` (14 keys)

### `tools`
- **Value**: "Tools"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 8
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/canvas-generator/components/canvas-generator.tsx:502` [string_literal]: `translationPrefix="tools"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/canvas-generator/components/canvas-generator.tsx:678` [string_literal]: `translationPrefix="tools"`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/tools/layout.tsx:24` [Tran]: `<Tran text="tools" />`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:185` [Tran]: `groupName: <Tran text="tools" />,`
  - `apps/frontend/components/tools/CopyDialog.tsx:18` [string_literal]: `/** Translation key prefix (default: 'tools') */`
  - `apps/frontend/components/tools/CopyDialog.tsx:30` [string_literal]: `translationPrefix = 'tools',`
  - `apps/frontend/components/tools/OutputInfoPanel.tsx:174` [string_literal]: `const { t } = useI18n('tools');`
  - `apps/frontend/i18n.config.ts:20` [string_literal]: `'tools',`

### `import`
- **Value**: "Import"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 4
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:68` [string_literal]: `type DialogType = 'import';`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:83` [Tran]: `<MenubarItem onSelect={() => setDialog('import')}><Tran text="import" /></MenubarItem>`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:120` [string_literal]: `<Dialog open={dialog === 'import'} onOpenChange={(value) => setDialog(value ? 'import' : null)}>`
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:122` [Tran]: `<DialogTitle><Tran text="import" /></DialogTitle>`

### `config`
- **Value**: "Config"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 5
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/server-nav.tsx:181` [Tran]: `groupName: <Tran text="config" />,`
  - `apps/frontend/app/[locale]/tools/logic/node/block-control-node.tsx:15` [string_literal]: `export const blockControlModes = ['enabled', 'shoot', 'shootp', 'config', 'color'] as const;`
  - `apps/frontend/app/[locale]/tools/logic/node/block-control-node.tsx:63` [string_literal]: `case 'config': {`
  - `apps/frontend/app/[locale]/tools/logic/node/block-control-node.tsx:140` [string_literal]: `{(mode === 'config' || mode === 'color') && (`
  - `apps/frontend/app/[locale]/tools/logic/node/unit-control-node.tsx:252` [string_literal]: `<LogicFieldLabel name="config" />`

### `previous`
- **Value**: "Previous"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/tools/logic/components/top/top-bar.tsx:148` [Tran]: `<Tran text="previous" />`

### `message`
- **Value**: "Message"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 7
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/crashes/[mod]/[id]/components/crash-details-view.tsx:51` [Tran]: `<Tran text="message" />`
  - `apps/frontend/app/[locale]/tools/logic/node/print-flush-node.tsx:35` [string_literal]: `<LogicInputField name="message" />`
  - `apps/frontend/app/[locale]/tools/logic/node/print-node.tsx:39` [string_literal]: `<LogicFieldLabel name="message" />`
  - `apps/frontend/app/[locale]/tools/logic/node/print-node.tsx:40` [string_literal]: `<LogicInputField name="message" />`
  - `apps/frontend/lib/image-processing/worker.ts:399` [string_literal]: `self.addEventListener('message', (event: MessageEvent<WorkerJob>) => {`
  - `apps/frontend/lib/utils.ts:525` [string_literal]: `if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {`
  - `apps/frontend/lib/utils.ts:537` [string_literal]: `: typeof error === 'object' && 'message' in error && typeof error.message === 'string'`

### `reset`
- **Value**: "Reset "
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 20
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:325` [string_literal]: `<Button variant="secondary" title="reset" onClick={() => form.reset()}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:326` [Tran]: `<Tran text="reset" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:395` [string_literal]: `<Button variant="secondary" title="reset" onClick={() => form.reset()}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/images/page.tsx:396` [Tran]: `<Tran text="reset" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:161` [string_literal]: `<Button variant="secondary" title="reset" onClick={() => form.reset()}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog.tsx:162` [Tran]: `<Tran text="reset" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:144` [string_literal]: `<Button variant="secondary" title="reset" onClick={() => form.reset()}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog.tsx:145` [Tran]: `<Tran text="reset" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:210` [string_literal]: `<Button variant="secondary" title="reset" onClick={() => form.reset()}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:211` [Tran]: `<Tran text="reset" />`
  - ... and 10 more occurrences

### `amount`
- **Value**: "Amount"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/tools/logic/node/unit-control-node.tsx:219` [string_literal]: `<LogicFieldLabel name="amount" />`
  - `apps/frontend/app/[locale]/tools/logic/node/unit-control-node.tsx:297` [string_literal]: `<LogicFieldLabel name="amount" />`

### `unknown`
- **Value**: "Unknown"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 4
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/components/forms/media-upload.form.tsx:195` [string_literal]: `alt={item.url.split('/').pop() || 'unknown'}`
  - `apps/frontend/components/tiptap/nodes/image-upload-node/image-upload-node.tsx:24` [string_literal]: `const filename = url.split('/').pop() || 'unknown';`
  - `apps/frontend/components/tools/OutputInfoPanel.tsx:13` [string_literal]: `return ext || 'unknown';`
  - `apps/frontend/components/webhooks/webhook-card-view.tsx:128` [Tran]: `return <Badge variant="destructive"><Tran text="unknown" /></Badge>;`

### `copy-to-clipboard`
- **Value**: "Copy to clipboard"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/components/tools/SchematicActions.tsx:50` [t()]: `title={t('copy-to-clipboard')}`

### `link`
- **Value**: "Link"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 13
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/navbar.tsx:118` [string_literal]: `if ('link' in item && item.link) {`
  - `apps/frontend/app/[locale]/components/navbar.tsx:267` [string_literal]: `) : 'link' in item ? (`
  - `apps/frontend/app/[locale]/tools/logic/node/get-link-node.tsx:53` [string_literal]: `<LogicFieldLabel name="link" />`
  - `apps/frontend/app/[locale]/tools/logic/node/lookup-node.tsx:90` [string_literal]: `<LogicFieldLabel name="link" />`
  - `apps/frontend/components/tiptap/ui/link-popover/link-popover.tsx:83` [t()]: `aria-label={t('link')}`
  - `apps/frontend/components/tiptap/ui/link-popover/use-link-popover.ts:55` [string_literal]: `return editor.can().setMark('link');`
  - `apps/frontend/components/tiptap/ui/link-popover/use-link-popover.ts:65` [string_literal]: `return editor.isActive('link');`
  - `apps/frontend/components/tiptap/ui/link-popover/use-link-popover.ts:74` [string_literal]: `const linkInSchema = isMarkInSchema('link', editor);`
  - `apps/frontend/components/tiptap/ui/link-popover/use-link-popover.ts:100` [string_literal]: `const { href } = editor.getAttributes('link');`
  - `apps/frontend/components/tiptap/ui/link-popover/use-link-popover.ts:113` [string_literal]: `const { href } = editor.getAttributes('link');`
  - ... and 3 more occurrences

### `upload-alt`
- **Value**: "Upload"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/components/tools/ImageInputPanel.tsx:98` [t()]: `alt={t('upload-alt')}`

### `upload-image`
- **Value**: "Upload image"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/components/tools/ImageUpload.tsx:95` [t()]: `aria-label={t('upload-image')}`

### `copy-failed`
- **Value**: "Failed to copy"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-managers/[id]/page.tsx:260` [t()]: `toast.error(t('copy-failed'), { description: err.message });`
  - `apps/frontend/components/tools/OutputInfoPanel.tsx:242` [t()]: `toast.error(t('copy-failed'));`

### `format`
- **Value**: "Format"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 3
- **Domains detected**: tools
- **Usage locations**:
  - `apps/frontend/app/[locale]/tools/logic/node/format-node.tsx:10` [string_literal]: `label: 'format',`
  - `apps/frontend/app/[locale]/tools/logic/node/format-node.tsx:30` [string_literal]: `<LogicFieldLabel name="format" />`
  - `apps/frontend/app/[locale]/tools/logic/node/format-node.tsx:31` [string_literal]: `<LogicInputField name="format" />`

## Target Namespace: `tags` (6 keys)

### `tag`
- **Value**: "Tag"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 3
- **Domains detected**: tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:323` [Tran]: `label: <Tran text="tag" />,`
  - `apps/frontend/components/tag/tag-update-container.tsx:49` [string_literal]: `mutationKey: ['item', itemType, itemId, 'tag'],`
  - `apps/frontend/i18n.config.ts:42` [string_literal]: `'tag',`

### `create`
- **Value**: "Create"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 7
- **Domains detected**: tags
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:63` [Tran]: `<Tran text="create" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:350` [Tran]: `<Tran text="create" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:516` [Tran]: `<Tran text="create" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog.tsx:28` [string_literal]: `const CREATE_CONTENT_PATCH_MUTATION_KEY = ['content-patches', 'create'];`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-groups/page.tsx:180` [Tran]: `<Tran text="create" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/server-managers/page.tsx:36` [string_literal]: `const [createOpen, setCreateOpen] = useQueryState('create', parseAsBoolean.withDefault(false));`
  - `apps/frontend/components/tag/tag-id-selector.tsx:287` [Tran]: `<Tran text="create" />`

### `confirm-delete`
- **Value**: "Confirm delete"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tags
- **Usage locations**:
  - `apps/frontend/components/tag/tag-update-container.tsx:187` [Tran]: `<Tran className="text-sm" text="confirm-delete" />`

### `multi`
- **Value**: "Multi"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tags
- **Usage locations**:
  - `apps/frontend/components/tag/tag-selector.tsx:128` [string_literal]: `<Tran text={group.duplicate ? 'multi' : 'single'} />`

### `clear-all`
- **Value**: "Clear all"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tags
- **Usage locations**:
  - `apps/frontend/components/tag/tag-id-selector.tsx:146` [Tran]: `<Tran text="clear-all" />`

### `done`
- **Value**: "Done"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: tags
- **Usage locations**:
  - `apps/frontend/components/tag/tag-id-selector.tsx:212` [Tran]: `<Tran text="done" />`

## Target Namespace: `user` (4 keys)

### `management`
- **Value**: "Management"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 6
- **Domains detected**: user
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:75` [string_literal]: `queryKey: ['management', 'notifications', 'history', page],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:87` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['management', 'notifications', 'history'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:108` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['management', 'notifications', 'history'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:44` [string_literal]: `const USERS_MANAGEMENT_QUERY_KEY = ['users', 'management'];`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:235` [Tran]: `label: <Tran text="management" />,`
  - `apps/frontend/app/[locale]/components/server-nav.tsx:171` [Tran]: `groupName: <Tran text="management" />,`

### `role`
- **Value**: "Roles"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 7
- **Domains detected**: user
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:70` [string_literal]: `enabled: target === 'role',`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:248` [string_literal]: `onClick={() => setTarget('role')}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:251` [string_literal]: `target === 'role'`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:279` [string_literal]: `{target === 'role' && (`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:45` [Tran]: `<Tran className="text-xl font-semibold" text="role" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:176` [string_literal]: `const [role, setRole] = useQueryState('role', {`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:268` [Tran]: `label: <Tran text="role" />,`

### `username`
- **Value**: "Username"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: user
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/create-user-form.tsx:48` [Tran]: `<Tran text="username" />`

### `roles`
- **Value**: "Roles"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 10
- **Domains detected**: user
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/notifications/page.tsx:68` [string_literal]: `queryKey: ['roles'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:50` [string_literal]: `<ApiItem queryKey={['roles']} route={api.v4.roles.findAll}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:117` [string_literal]: `mutationKey={['roles', id]}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:120` [string_literal]: `queryKey={['roles']}`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:165` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['roles'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/roles/page.tsx:343` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['roles'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:62` [Tran]: `<Tran text="roles" />`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form.tsx:130` [string_literal]: `<ApiItem queryKey={['roles']} route={api.v4.roles.findAll}>`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/management/users/page.tsx:45` [string_literal]: `const ROLES_QUERY_KEY = ['roles'];`
  - `apps/frontend/components/user/user-component.tsx:16` [string_literal]: `export type UserType = Pick<Session, 'id' | 'name' | 'imageUrl' | 'roles' | 'bannedUntil'>;`

## Target Namespace: `wiki` (4 keys)

### `change-language`
- **Value**: "Change language"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 3
- **Domains detected**: wiki
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:380` [Tran]: `<Tran text="change-language" />`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:386` [Tran]: `<Tran text="change-language" />`
  - `apps/frontend/app/[locale]/wiki/layout.tsx:61` [Tran]: `<Tran text="change-language" />`

### `wiki`
- **Value**: "Wiki"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 9
- **Domains detected**: wiki
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:327` [string_literal]: `mutationKey: ['wiki'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:416` [string_literal]: `mutationKey: ['wiki'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:466` [string_literal]: `mutationKey: ['wiki'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:487` [string_literal]: `mutationKey: ['wiki'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:517` [string_literal]: `mutationKey: ['wiki'],`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:120` [Tran]: `label: <Tran text="wiki" />,`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:329` [Tran]: `label: <Tran text="wiki" />,`
  - `apps/frontend/app/[locale]/wiki/components/wiki.action.ts:13` [string_literal]: `tags: ['wiki', 'post'],`
  - `apps/frontend/i18n.config.ts:15` [string_literal]: `'wiki',`

### `change-language-description`
- **Value**: "Change language"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: wiki
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:389` [Tran]: `<Tran text="change-language-description" />`
  - `apps/frontend/app/[locale]/wiki/layout.tsx:64` [Tran]: `<Tran text="change-language-description" />`

### `update`
- **Value**: "Update"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: wiki
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/wiki/page.tsx:454` [Tran]: `<Tran text="update" />`

## Target Namespace: `search-bar` (4 keys)

### `filter`
- **Value**: "Filter"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 3
- **Domains detected**: search-bar
- **Usage locations**:
  - `apps/frontend/components/search-bar/author-selector.tsx:90` [Tran]: `<Tran text="filter" />`
  - `apps/frontend/components/search-bar/search-bar.tsx:158` [t()]: `<Button className="shrink-0 border bg-card" variant="secondary" 							aria-label={t('filter')} size="icon">`
  - `apps/frontend/components/search-bar/search-bar.tsx:165` [Tran]: `<Tran text="filter" />`

### `select-author`
- **Value**: "Select author"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: search-bar
- **Usage locations**:
  - `apps/frontend/components/search-bar/author-selector.tsx:87` [Tran]: `<Tran text="select-author" />`

### `planets`
- **Value**: "Planets"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 7
- **Domains detected**: search-bar
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog.tsx:73` [string_literal]: `queryKey: ['planets'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-planet-dialog.tsx:32` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['planets'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog.tsx:54` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['planets'] });`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog.tsx:45` [string_literal]: `queryKey: ['planets'],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/data/tags/page.tsx:162` [string_literal]: `queryKey: ['planets'],`
  - `apps/frontend/components/query/planet-selector.tsx:27` [string_literal]: `queryKey: ['planets'],`
  - `apps/frontend/components/search-bar/filter-dialog.tsx:24` [string_literal]: `queryKey: ['planets'],`

### `nothing`
- **Value**: "Nothing"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: search-bar
- **Usage locations**:
  - `apps/frontend/components/search-bar/dropdowns/size-dropdown.tsx:12` [Tran]: `return <DropdownCard><Tran text="nothing" /></DropdownCard>;`

## Target Namespace: `moderation` (4 keys)

### `bugs`
- **Value**: "Bugs"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: moderation
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/bugs/page.tsx:8` [Tran]: `<Tran className="text-2xl font-semibold" text="bugs" />`

### `actions`
- **Value**: "Actions"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: moderation
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/actions/page.tsx:106` [string_literal]: `const ACTIONS_QUERY_KEY = ['actions'];`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:286` [Tran]: `label: <Tran text="actions" />,`

### `reports`
- **Value**: "Reports"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: moderation
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/reports/page.tsx:8` [Tran]: `<h1><Tran text="reports" /></h1>`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:292` [Tran]: `label: <Tran text="reports" />,`

### `media`
- **Value**: "Media"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: moderation
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/media/page.tsx:14` [string_literal]: `const MEDIA_QUERY_KEY = ['media'];`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:298` [Tran]: `label: <Tran text="media" />,`

## Target Namespace: `post` (3 keys)

### `en`
- **Value**: "en"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 2
- **Domains detected**: post
- **Usage locations**:
  - `apps/frontend/components/post/simple-editor.tsx:95` [string_literal]: `language: 'en',`
  - `apps/frontend/lib/i18n.util.ts:6` [string_literal]: `en: 'en',`

### `language`
- **Value**: "Language"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Domains detected**: post
- **Usage locations**:
  - `apps/frontend/components/post/simple-editor.tsx:281` [string_literal]: `name="language"`

### `title`
- **Value**: "Title"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 11
- **Domains detected**: post
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/notifications/page.tsx:134` [t()]: `{t('title', { defaultValue: 'Notifications' })}`
  - `apps/frontend/app/[locale]/components/navbar-notification-bell.tsx:84` [t()]: `aria-label={t('title', { defaultValue: 'Notifications' })}`
  - `apps/frontend/app/[locale]/components/navbar-notification-bell.tsx:100` [t()]: `<span className="text-xs font-semibold tracking-tight text-foreground">{t('title', { defaultValue: 'Notifications' })}</span>`
  - `apps/frontend/app/[locale]/new-post/page.client.tsx:35` [Tran]: `<TabsTrigger value="title"><Tran text="title" /></TabsTrigger>`
  - `apps/frontend/components/buttons/back-button.tsx:9` [string_literal]: `export default function BackButton({ className, children, ...props }: Omit<Parameters<typeof Button>[0], 'title'>) {`
  - `apps/frontend/components/post/post-card.tsx:19` [string_literal]: `'itemId' | 'title' | 'summary' | 'createdAt' | 'createdBy' | 'cover' | 'comments' | 'likes' | 'views'`
  - `apps/frontend/components/post/simple-editor.tsx:100` [string_literal]: `const [tab, setTab] = useQueryState('tabs', { defaultValue: 'title' });`
  - `apps/frontend/components/post/simple-editor.tsx:177` [string_literal]: `<TabsTrigger value="title" type="button">`
  - `apps/frontend/components/post/simple-editor.tsx:196` [string_literal]: `<TabsContent className="mx-auto h-full w-full space-y-6 overflow-hidden px-4 pb-4" value="title">`
  - `apps/frontend/components/post/simple-editor.tsx:206` [string_literal]: `name="title"`
  - ... and 1 more occurrences

## Target Namespace: `notification` (1 keys)

### `content-patch`
- **Value**: "Content patch"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 5
- **Domains detected**: notification
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:113` [Tran]: `label: <Tran text="content-patch" />,`
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:254` [Tran]: `label: <Tran text="content-patch" />,`
  - `apps/frontend/components/notification/notification-utils.ts:45` [string_literal]: `if (itemType === 'content-patch') return `/content-patches/${itemId}`;`
  - `apps/frontend/components/notification/notification-utils.ts:56` [string_literal]: `if (itemType === 'content-patch') return `/content-patches/${itemId}`;`
  - `apps/frontend/i18n.config.ts:38` [string_literal]: `'content-patch',`

## Target Namespace: `login` (1 keys)

### `login`
- **Value**: "Login"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 6
- **Domains detected**: login
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(everyone)/login/page.tsx:15` [Tran]: `<Tran className="text-2xl font-semibold" text="login" />`
  - `apps/frontend/app/[locale]/(with-navbar)/auth/app/login/page.tsx:12` [string_literal]: `const LOGIN_QUERY_KEY = ['login'];`
  - `apps/frontend/app/[locale]/(with-navbar)/auth/app/login/page.tsx:64` [Tran]: `<Tran text="login" />`
  - `apps/frontend/components/buttons/login-button.tsx:18` [Tran]: `<Button {...props}>{children || <Tran text="login" />}</Button>`
  - `apps/frontend/components/buttons/login-button.tsx:23` [Tran]: `<Tran text="login" />`
  - `apps/frontend/i18n.config.ts:23` [string_literal]: `'login',`

## Target Namespace: `comment` (1 keys)

### `count`
- **Value**: "Count"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 8
- **Domains detected**: comment
- **Usage locations**:
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:50` [string_literal]: `queryKey: ['count', ...COMMENTS_ADMIN_QUERY_KEY],`
  - `apps/frontend/app/[locale]/(with-navbar)/(admin)/moderation/comments/page.tsx:74` [string_literal]: `queryClient.invalidateQueries({ queryKey: ['count', ...COMMENTS_ADMIN_QUERY_KEY] });`
  - `apps/frontend/app/[locale]/(with-navbar)/[path]/page.tsx:178` [Tran]: `<Tran className="ml-auto" text="count" />`
  - `apps/frontend/app/[locale]/components/navbar-badge.tsx:13` [string_literal]: `queryKey: ['schematics', 'count', 'verify'],`
  - `apps/frontend/app/[locale]/components/navbar-badge.tsx:27` [string_literal]: `queryKey: ['maps', 'count', 'verify'],`
  - `apps/frontend/app/[locale]/components/navbar-badge.tsx:41` [string_literal]: `queryKey: ['content-patches', 'count', 'verify'],`
  - `apps/frontend/app/[locale]/components/navbar-badge.tsx:129` [string_literal]: `queryKey: ['users', 'count'],`
  - `apps/frontend/components/query/api-pagination.tsx:50` [string_literal]: `queryKey: ['count', ...queryKey, q, size],`

## Target Namespace: `mod` (1 keys)

### `mod-editor`
- **Value**: "Mod editor"
- **Classification**: FEATURE_SPECIFIC
- **Occurrences**: 1
- **Usage locations**:
  - `apps/frontend/app/[locale]/components/nav-groups.tsx:218` [Tran]: `label: <Tran text="mod-editor" />,`

