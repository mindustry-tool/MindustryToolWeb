import { api } from '@mindustry-tool/api';
import { ExtractActionValue } from '@mindustry-tool/api';

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

export type Api = UnionToIntersection<ExtractActionValue<typeof api>>;
