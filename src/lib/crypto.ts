import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const hexKey =
    process.env.ENCRYPTION_KEY ||
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  return Buffer.from(hexKey, "hex");
}

/**
 * Encrypt sensitive plain text (such as raw Iqama number) using AES-256-GCM
 */
export function encryptIqamaNumber(plainText: string): string {
  if (!plainText) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted ciphertext into a single string
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt ciphertext back to original Iqama number
 */
export function decryptIqamaNumber(cipherTextWithMeta: string): string {
  if (!cipherTextWithMeta) return "";
  try {
    const parts = cipherTextWithMeta.split(":");
    if (parts.length !== 3) {
      // In case it was stored plain in test
      return cipherTextWithMeta;
    }

    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "DECRYPTION_ERROR";
  }
}

/**
 * Mask Iqama number for secure default display.
 * Example: 2451829304 -> 245****304
 */
export function maskIqamaNumber(iqamaNumber: string): string {
  if (!iqamaNumber) return "—";
  const cleaned = iqamaNumber.trim();
  if (cleaned.length < 5) return cleaned;
  const start = cleaned.slice(0, 3);
  const end = cleaned.slice(-3);
  const middle = "*".repeat(Math.max(3, cleaned.length - 6));
  return `${start}${middle}${end}`;
}
