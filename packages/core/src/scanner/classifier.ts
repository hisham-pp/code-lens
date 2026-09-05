import { isBinary, isGenerated, isMinified, isVendor } from './classifier-checks.js';

export interface FileClassification {
  isBinary: boolean;
  isGenerated: boolean;
  isMinified: boolean;
  isVendor: boolean;
}

export class FileClassifier {
  public static isBinary = isBinary;
  public static isGenerated = isGenerated;
  public static isMinified = isMinified;
  public static isVendor = isVendor;

  public static classify(
    relativePath: string,
    buffer: Buffer,
    content?: string,
  ): FileClassification {
    const isBin = isBinary(buffer);
    const isVend = isVendor(relativePath);

    if (isBin) {
      return {
        isBinary: true,
        isGenerated: false,
        isMinified: false,
        isVendor: isVend,
      };
    }

    const text = content ?? buffer.toString('utf-8');
    return {
      isBinary: false,
      isGenerated: isGenerated(text, relativePath),
      isMinified: isMinified(text, relativePath),
      isVendor: isVend,
    };
  }
}
