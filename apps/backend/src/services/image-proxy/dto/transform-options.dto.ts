export class TransformOptionsDto {
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'jpeg' | 'webp';

  constructor({
    width,
    height,
    format,
  }: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpg' | 'jpeg' | 'webp';
  }) {
    this.width = width;
    this.height = height;
    this.format = format;
  }

  needTransform(): boolean {
    return this.width !== undefined || this.height !== undefined || this.format !== undefined;
  }
}
