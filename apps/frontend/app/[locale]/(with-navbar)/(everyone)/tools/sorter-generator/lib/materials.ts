import type { BlockType, MindustryMaterial } from './types';

/**
 * Mindustry v7 materials with their corresponding RGB hex colors
 * Colors are based on the actual in-game item colors for accurate sorter art generation
 */
export const MINDUSTRY_MATERIALS: MindustryMaterial[] = [
    { name: 'copper', displayName: 'Copper', color: '#d99d73', icon: 'item-copper-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-1a07-724e-b37c-159a9cc6c94e.png' },
    { name: 'lead', displayName: 'Lead', color: '#8c7fa9', icon: 'item-lead-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-1a52-77e1-89bd-00b2e638c02c.png' },
    { name: 'metaglass', displayName: 'Metaglass', color: '#ebeef5', icon: 'item-metaglass-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-1a5e-7784-93e3-dd06b536413c.png' },
    { name: 'graphite', displayName: 'Graphite', color: '#6e7080', icon: 'item-graphite-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-1a42-716b-a251-1b0736513b05.png' },
    { name: 'sand', displayName: 'Sand', color: '#f7cba4', icon: 'item-sand-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19c4-777c-9eac-d316d5523343.png' },
    { name: 'coal', displayName: 'Coal', color: '#272727', icon: 'item-coal-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-1a1d-723a-9cec-a2b1639a82f9.png' },
    { name: 'titanium', displayName: 'Titanium', color: '#8da1e3', icon: 'item-titanium-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19da-75ef-b78f-5101cb3169f6.png' },
    { name: 'thorium', displayName: 'Thorium', color: '#f9a3c7', icon: 'item-thorium-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19d2-71ee-b469-524349fa5d95.png' },
    { name: 'scrap', displayName: 'Scrap', color: '#777777', icon: 'item-scrap-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19b0-7096-8d98-03120348b286.png' },
    { name: 'silicon', displayName: 'Silicon', color: '#53565c', icon: 'item-silicon-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19b6-765f-83f6-e588755662a0.png' },
    { name: 'plastanium', displayName: 'Plastanium', color: '#cbd97f', icon: 'item-plastanium-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-195f-75ab-903a-3eb09f3ae819.png' },
    { name: 'phase-fabric', displayName: 'Phase Fabric', color: '#f4ba6e', icon: 'item-phase-fabric-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-199c-71a9-86b2-0583f9cb9455.png' },
    { name: 'surge-alloy', displayName: 'Surge Alloy', color: '#f3e979', icon: 'item-surge-alloy-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19ca-761d-8117-3852571ba5ba.png' },
    { name: 'spore-pod', displayName: 'Spore Pod', color: '#7457ce', icon: 'item-spore-pod-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19bd-725b-9e78-bfd8d415d1db.png' },
    { name: 'blast-compound', displayName: 'Blast Compound', color: '#ff795e', icon: 'item-blast-compound-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19f5-735a-a656-17a4019bbbe4.png' },
    { name: 'pyratite', displayName: 'Pyratite', color: '#ffaa5f', icon: 'item-pyratite-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19aa-7684-8357-976a475c65ec.png' },
    { name: 'beryllium', displayName: 'Beryllium', color: '#8ca47e', icon: 'item-beryllium-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19e8-72d3-ad65-a9fb23437018.png' },
    { name: 'tungsten', displayName: 'Tungsten', color: '#6a7569', icon: 'item-tungsten-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19fb-7252-8ca3-39c76f29ec25.png' },
    { name: 'oxide', displayName: 'Oxide', color: '#c8c9bf', icon: 'item-oxide-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-198e-7506-b56a-7ee5d028e920.png' },
    { name: 'carbide', displayName: 'Carbide', color: '#90a2c7', icon: 'item-carbide-ui', imageUrl: 'https://image.mindustry-tool.com/media/0199ba91-19ef-7756-a8ef-e9851a2b70eb.png' },
];

export const BLOCK_TYPES: { value: BlockType; label: string; imageUrl: string }[] = [
    { value: 'sorter', label: 'Sorter', imageUrl: 'https://image.mindustry-tool.com/media/0199baa1-1782-72cf-abd1-e7551fa5f4aa.png' },
    { value: 'inverted-sorter', label: 'Inverted Sorter', imageUrl: 'https://image.mindustry-tool.com/media/0199baa1-1779-71af-a652-47ddbe1b23b9.png' },
    { value: 'duct-router', label: 'Duct Router', imageUrl: 'https://image.mindustry-tool.com/media/0199b9be-19fa-725c-b2a4-ba23d9fdb2fb.png' },
];
