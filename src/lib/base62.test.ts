import assert from "node:assert/strict";
import test from "node:test";
import { encodeBase62 } from "./base62";

test("encodes Base62 boundaries using a stable case-sensitive alphabet", () => {
  for (const [input, expected] of [
    [0n, "0"], [1n, "1"], [61n, "z"], [62n, "10"],
    [3843n, "zz"], [3844n, "100"],
  ] as const) {
    assert.equal(encodeBase62(input), expected);
  }
});

test("preserves bigint precision through the maximum Postgres bigint", () => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (const input of [9007199254740993n, 9223372036854775807n]) {
    const encoded = encodeBase62(input);
    const decoded = [...encoded].reduce(
      (value, char) => value * 62n + BigInt(alphabet.indexOf(char)), 0n,
    );
    assert.equal(decoded, input);
    assert.ok(encoded.length <= 11);
  }
});

test("produces distinct codes for distinct sequential IDs", () => {
  const codes = new Set(Array.from({ length: 10_000 }, (_, id) => encodeBase62(BigInt(id))));
  assert.equal(codes.size, 10_000);
});

test("rejects negative IDs", () => {
  assert.throws(() => encodeBase62(-1n), RangeError);
});
