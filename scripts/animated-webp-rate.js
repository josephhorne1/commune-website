const fourCharacterCode = (bytes, offset) =>
  String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3]
  );

const readUint24 = (bytes, offset) =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);

const writeUint24 = (bytes, offset, value) => {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
  bytes[offset + 2] = (value >> 16) & 0xff;
};

export function retimeAnimatedWebp(buffer, playbackRate) {
  const source = new Uint8Array(buffer);
  const bytes = new Uint8Array(source);
  const rate = Math.max(1, Number(playbackRate) || 1);

  if (
    bytes.length < 20 ||
    fourCharacterCode(bytes, 0) !== "RIFF" ||
    fourCharacterCode(bytes, 8) !== "WEBP"
  ) {
    throw new TypeError("Expected an animated WebP RIFF buffer.");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let frameCount = 0;

  while (offset + 8 <= bytes.length) {
    const chunk = fourCharacterCode(bytes, offset);
    const chunkSize = view.getUint32(offset + 4, true);
    const payloadOffset = offset + 8;
    if (payloadOffset + chunkSize > bytes.length) break;

    if (chunk === "ANMF" && chunkSize >= 16) {
      const durationOffset = payloadOffset + 12;
      const duration = readUint24(bytes, durationOffset);
      const nextDuration = Math.max(12, Math.round(duration / rate));
      writeUint24(bytes, durationOffset, nextDuration);
      frameCount += 1;
    }

    offset = payloadOffset + chunkSize + (chunkSize % 2);
  }

  if (!frameCount) throw new TypeError("Animated WebP frames were not found.");
  return bytes.buffer;
}

export function playbackRateTier(speed) {
  const value = Math.max(1, Number(speed) || 1);
  if (value < 1.45) return 1;
  if (value < 2.4) return 1.5;
  if (value < 3.6) return 2;
  if (value < 5) return 3;
  return 4;
}
