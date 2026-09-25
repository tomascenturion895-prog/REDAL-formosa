import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";

import { AesGcmCipher } from "./secret-cipher";

const newKey = () => randomBytes(32).toString("base64");

describe("AesGcmCipher", () => {
  const key = newKey();
  const cipher = new AesGcmCipher({ currentId: "v1", keys: { v1: key } });

  it("descifra lo que cifró, incluidos acentos", () => {
    const secret = JSON.stringify({ cbu: "0170001512345678901233", titular: "María Núñez" });
    expect(cipher.decrypt(cipher.encrypt(secret))).toBe(secret);
  });

  it("no deja el texto original a la vista", () => {
    const payload = cipher.encrypt("0170001512345678901233");
    expect(payload).not.toContain("0170001512345678901233");
    expect(payload.startsWith("v1:")).toBe(true);
  });

  it("el mismo texto produce cifrados distintos (IV aleatorio)", () => {
    expect(cipher.encrypt("igual")).not.toBe(cipher.encrypt("igual"));
  });

  it("detecta si el contenido fue alterado", () => {
    const [id, iv, tag, data] = cipher.encrypt("dato").split(":");
    const tampered = [id, iv, tag, Buffer.from("otro-contenido").toString("base64")].join(":");
    expect(() => cipher.decrypt(tampered)).toThrow();
    expect(data).toBeDefined();
  });

  it("no descifra con otra clave", () => {
    const other = new AesGcmCipher({ currentId: "v1", keys: { v1: newKey() } });
    expect(() => other.decrypt(cipher.encrypt("dato"))).toThrow();
  });

  it("rechaza formatos inválidos", () => {
    expect(() => cipher.decrypt("basura")).toThrow(/desconocidos/);
    expect(() => cipher.decrypt("v9:a:b:c")).toThrow(/desconocidos/);
  });

  it("rota claves: lo cifrado con la vieja se sigue leyendo y lo nuevo usa la actual", () => {
    const v2 = newKey();
    const oldPayload = cipher.encrypt("viejo");
    const rotated = new AesGcmCipher({ currentId: "v2", keys: { v1: key, v2 } });

    expect(rotated.decrypt(oldPayload)).toBe("viejo");
    expect(rotated.encrypt("nuevo").startsWith("v2:")).toBe(true);
  });

  it("exige claves de 32 bytes y una clave actual existente", () => {
    expect(() => new AesGcmCipher({ currentId: "v1", keys: { v1: "corta" } })).toThrow(/32 bytes/);
    expect(() => new AesGcmCipher({ currentId: "v2", keys: { v1: key } })).toThrow(/clave actual/);
  });
});
