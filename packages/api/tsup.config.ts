import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'types/index': 'src/types/index.ts',
      'constants/index': 'src/constants/index.ts',
      'schemas/index': 'src/schema/index.ts',
      'schema/index': 'src/schema/index.ts',
      'routes/index': 'src/routes/index.ts',
      'client/index': 'src/client/index.ts',
      'utils/index': 'src/utils/index.ts',
      'events/index': 'src/events/index.ts',
      'config/index': 'src/config/index.ts',
    },
    tsconfig: 'tsconfig.build.json',
    format: ['esm'],
    outDir: 'dist',
    treeshake: true,
    dts: true,
    sourcemap: true,
    clean: false,
  },
  {
    entry: {
      index: 'src/index.ts',
      'types/index': 'src/types/index.ts',
      'constants/index': 'src/constants/index.ts',
      'schemas/index': 'src/schema/index.ts',
      'schema/index': 'src/schema/index.ts',
      'routes/index': 'src/routes/index.ts',
      'client/index': 'src/client/index.ts',
      'utils/index': 'src/utils/index.ts',
      'events/index': 'src/events/index.ts',
      'config/index': 'src/config/index.ts',
    },
    tsconfig: 'tsconfig.build.json',
    format: ['cjs'],
    outDir: 'dist',
    sourcemap: true,
    clean: false,
  },
]);
