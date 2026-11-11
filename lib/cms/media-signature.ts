import { readImageDimensions } from "./media";

/** Validate container boundaries and required image payload, not pixel decoding. */
export function matchesImageType(bytes: Uint8Array, type: string): boolean {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dimensions = () => {
    const size = readImageDimensions(bytes);
    return Boolean(size && size.width > 0 && size.height > 0);
  };
  if (type === "image/png") {
    if (bytes.length < 45 || ![137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte)) return false;
    let offset = 8;
    let image = false;
    while (offset + 12 <= bytes.length) {
      const length = view.getUint32(offset);
      if (length > bytes.length - offset - 12) return false;
      const chunk = ascii(offset + 4, offset + 8);
      if (offset === 8 && (chunk !== "IHDR" || length !== 13 || !dimensions())) return false;
      if (chunk === "IDAT" && length > 0) image = true;
      offset += length + 12;
      if (chunk === "IEND") return image && length === 0 && offset === bytes.length;
    }
    return false;
  }
  if (type === "image/gif") {
    if (bytes.length < 14 || !["GIF87a", "GIF89a"].includes(ascii(0, 6))) return false;
    if (!view.getUint16(6, true) || !view.getUint16(8, true)) return false;
    let offset = 13 + ((bytes[10]! & 128) ? 3 * (2 ** ((bytes[10]! & 7) + 1)) : 0);
    let image = false;
    while (offset < bytes.length) {
      const marker = bytes[offset++];
      if (marker === 0x3b) return image && offset === bytes.length;
      if (marker === 0x21) offset++;
      else if (marker === 0x2c) {
        if (offset + 9 >= bytes.length) return false;
        if (!view.getUint16(offset + 4, true) || !view.getUint16(offset + 6, true)) return false;
        const packed = bytes[offset + 8]!;
        offset += 9 + ((packed & 128) ? 3 * (2 ** ((packed & 7) + 1)) : 0);
        if (offset >= bytes.length || bytes[offset]! < 2 || bytes[offset]! > 8) return false;
        offset++;
        image = true;
      } else return false;
      let payload = false;
      while (true) {
        if (offset >= bytes.length) return false;
        const size = bytes[offset++]!;
        if (size === 0) break;
        if (size > bytes.length - offset) return false;
        payload = true;
        offset += size;
      }
      if (marker === 0x2c && !payload) return false;
    }
    return false;
  }
  if (type === "image/jpeg") {
    if (bytes.length < 24 || bytes[0] !== 255 || bytes[1] !== 216 || !dimensions()) return false;
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 255) return false;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (offset + 2 > bytes.length) return false;
      const size = view.getUint16(offset);
      if (size < 2 || size > bytes.length - offset) return false;
      offset += size;
      if (marker === 0xda) return offset < bytes.length - 2 && bytes[bytes.length - 2] === 255 && bytes[bytes.length - 1] === 217;
    }
    return false;
  }
  if (type === "image/webp") {
    if (bytes.length < 30 || ascii(0, 4) !== "RIFF" || ascii(8, 12) !== "WEBP" || view.getUint32(4, true) + 8 !== bytes.length || !dimensions()) return false;
    let offset = 12;
    let image = false;
    while (offset + 8 <= bytes.length) {
      const chunk = ascii(offset, offset + 4);
      const size = view.getUint32(offset + 4, true);
      if (size > bytes.length - offset - 8) return false;
      if ((chunk === "VP8 " && size > 10) || (chunk === "VP8L" && size > 5) || (chunk === "ANMF" && size > 16)) image = true;
      offset += 8 + size + (size % 2);
    }
    return image && offset === bytes.length;
  }
  if (type === "image/avif") {
    let offset = 0;
    let brand = false;
    let metadata = false;
    let image = false;
    while (offset + 8 <= bytes.length) {
      const size = view.getUint32(offset);
      if (size < 8 || size > bytes.length - offset) return false;
      const box = ascii(offset + 4, offset + 8);
      if (offset === 0 && box !== "ftyp") return false;
      if (box === "ftyp") {
        if (size < 16 || size % 4) return false;
        brand = ["avif", "avis"].includes(ascii(offset + 8, offset + 12));
        for (let i = offset + 16; i < offset + size; i += 4) brand ||= ["avif", "avis"].includes(ascii(i, i + 4));
      }
      if (box === "meta" && size > 12) metadata = true;
      if (box === "mdat" && size > 8) image = true;
      offset += size;
    }
    return offset === bytes.length && brand && metadata && image;
  }
  return false;
}
