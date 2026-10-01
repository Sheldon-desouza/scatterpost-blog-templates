/**
 * Verifies the `X-Scatterpost-Signature` header scatterpost sends on a
 * push-mode publish, `t=<unix>,v1=<hex hmac_sha256(secret, "<t>.<body>")>`.
 *
 * Self-contained (no dependency on the scatterpost monorepo), so this
 * template has no runtime dependency on a private package and still
 * works if it is copied out into its own repository.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 300;

export interface VerifySignatureOptions {
  toleranceSeconds?: number;
  now?: () => Date;
}

function signPayload(secret: string, timestamp: number, body: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

/**
 * Verifies `header` against the exact raw body string it was sent with.
 * Returns `false` (never throws) on an expired timestamp, a tampered
 * body, a wrong secret, or a malformed header, so a route handler can
 * just `if (!verifySignature(...))`.
 */
export function verifySignature(
  secret: string,
  header: string,
  body: string,
  options: VerifySignatureOptions = {},
): boolean {
  const toleranceSeconds = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  const now = options.now ?? (() => new Date());

  const match = /^t=(\d+),v1=([0-9a-f]+)$/.exec(header.trim());
  if (!match) {
    return false;
  }
  const [, timestampRaw, signature] = match;
  const timestamp = Number(timestampRaw);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const nowSeconds = Math.floor(now().getTime() / 1000);
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return false;
  }

  const expected = signPayload(secret, timestamp, body);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature ?? "", "hex");
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, actualBuffer);
}
