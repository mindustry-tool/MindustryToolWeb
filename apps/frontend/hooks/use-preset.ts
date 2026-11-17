import type { ItemTagDto } from '@mindustry-tool/api';
import type { ItemType } from '@mindustry-tool/api';
import { ITEM_TYPES } from '@mindustry-tool/api';
import { itemTagDtoSchema } from '@mindustry-tool/api';
import { useLocalStorage } from 'usehooks-ts';
import { z } from 'zod/v4-mini';

type Preset = { name: string, type: ItemType, tags: ItemTagDto[] };

export function usePreset() {
	const [preset, setPreset] = useLocalStorage<Preset[]>('preset', [], {
		deserializer: (value: string) => {
			const raw = JSON.parse(value) as Preset;
			const parsed = z
				.array(z.object({ name: z.string(), type: z.enum(ITEM_TYPES), tags: z.array(itemTagDtoSchema) }))
				.safeParse(raw);

			if (parsed.success) {
				return parsed.data;
			}

			return [];
		},
	});

	const addPreset = (newPreset: Preset) => {
		const exists = preset.find(p => p.name === newPreset.name && p.type === newPreset.type);
		if (exists) {
			exists.type = newPreset.type;
			exists.tags = newPreset.tags;
			setPreset([...preset]);
		} else {
			setPreset([...preset, newPreset]);
		}
	};

	const deletePreset = (target: Preset) => {
		setPreset(preset.filter(p => p.name !== target.name || p.type !== target.type));
	};

	return { preset, addPreset, deletePreset };
}
