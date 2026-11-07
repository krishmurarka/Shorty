const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function encodeBase62(id: bigint): string {
  if (id < 0n) throw new RangeError("IDs must be non-negative.");
  if (id === 0n) return "0";

  let code = "";
  while (id > 0n) {
    code = ALPHABET[Number(id % 62n)] + code;
    id /= 62n;
  }
  return code;
}
