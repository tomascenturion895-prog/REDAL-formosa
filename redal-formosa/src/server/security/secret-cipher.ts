import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** Cifrado reversible de datos sensibles en reposo (por ejemplo, la cuenta bancaria). */
export interface SecretCipher {
  encrypt(plaintext: string): string;
  /** Lanza un Error si el dato fue alterado o se cifró con una clave que ya no existe. */
  decrypt(payload: string): string;
}

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;

export interface KeyRing {
  /** Identificador de la clave con la que se cifra ahora (por ejemplo "v1"). */
  currentId: string;
  /** Todas las claves conocidas, en base64 de 32 bytes. Las viejas siguen sirviendo para descifrar. */
  keys: Record<string, string>;
}

/**
 * AES-256-GCM con IV aleatorio por mensaje. El formato guardado es
 * `<idClave>:<iv>:<tag>:<cifrado>` (base64), lo que permite rotar la clave:
 * se agrega una nueva, se cambia currentId y lo viejo se sigue leyendo.
 * GCM autentica el contenido: cualquier alteración hace fallar el descifrado.
 */
export class AesGcmCipher implements SecretCipher {
  private readonly keys = new Map<string, Buffer>();

  constructor(private readonly ring: KeyRing) {
    for (const [id, base64] of Object.entries(ring.keys)) {
      const key = Buffer.from(base64, "base64");
      if (key.length !== KEY_BYTES) {
        throw new Error(`La clave "${id}" debe tener ${KEY_BYTES} bytes (base64). Generala con: openssl rand -base64 32`);
      }
      this.keys.set(id, key);
    }
    if (!this.keys.has(ring.currentId)) throw new Error(`No existe la clave actual "${ring.currentId}"`);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.keys.get(this.ring.currentId)!, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    return [this.ring.currentId, iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(":");
  }

  decrypt(payload: string): string {
    const [id, iv, tag, encrypted] = payload.split(":");
    const key = id ? this.keys.get(id) : undefined;
    if (!key || !iv || !tag || encrypted === undefined) throw new Error("Dato cifrado con formato o clave desconocidos");

    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
  }
}
