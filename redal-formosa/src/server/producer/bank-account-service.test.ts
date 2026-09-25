import { randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/lib/supabase/types";
import { AesGcmCipher } from "@/server/security/secret-cipher";
import { BankAccountService } from "./bank-account-service";

// Base en memoria: solo la tabla profiles con update/select por id.
function fakeDb(profiles: Record<string, unknown>[]): Db {
  const from = () => {
    let patch: Record<string, unknown> | null = null;
    let id: unknown;
    const find = () => profiles.find((p) => p.id === id);
    const builder = {
      update: (values: Record<string, unknown>) => {
        patch = values;
        return builder;
      },
      select: () => builder,
      eq: (_col: string, value: unknown) => {
        id = value;
        return builder;
      },
      maybeSingle: () => Promise.resolve({ data: find() ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown) => {
        if (patch) Object.assign(find() ?? {}, patch);
        return Promise.resolve({ data: null, error: null }).then(resolve);
      },
    };
    return builder;
  };
  return { from } as unknown as Db;
}

const VALID_CBU = "0170001512345678901233";

describe("BankAccountService", () => {
  let profiles: Record<string, unknown>[];
  let service: BankAccountService;

  beforeEach(() => {
    profiles = [{ id: "u1", bank_account: null }];
    const cipher = new AesGcmCipher({ currentId: "v1", keys: { v1: randomBytes(32).toString("base64") } });
    service = new BankAccountService(fakeDb(profiles), cipher);
  });

  it("guarda la cuenta cifrada: en la base no queda el CBU en texto plano", async () => {
    await service.save("u1", { cbu: VALID_CBU, banco: "galicia", titular: "María Núñez" });

    const stored = profiles[0].bank_account as string;
    expect(stored.startsWith("v1:")).toBe(true);
    expect(stored).not.toContain(VALID_CBU);
    expect(stored).not.toContain("María");
  });

  it("puede leerla de vuelta descifrada", async () => {
    await service.save("u1", { cbu: VALID_CBU, banco: "galicia", titular: "  María Núñez  " });
    expect(await service.load("u1")).toEqual({ cbu: VALID_CBU, banco: "galicia", titular: "María Núñez" });
  });

  it("load devuelve null si no hay cuenta cargada", async () => {
    expect(await service.load("u1")).toBeNull();
  });

  it("rechaza un CBU con dígito verificador incorrecto", async () => {
    await expect(service.save("u1", { cbu: "0170001612345678901233", banco: "galicia", titular: "Ana" })).rejects.toMatchObject({
      code: "bad_request",
    });
    expect(profiles[0].bank_account).toBeNull();
  });

  it("rechaza banco desconocido, titular vacío y cuerpos inválidos", async () => {
    await expect(service.save("u1", { cbu: VALID_CBU, banco: "banco-falso", titular: "Ana" })).rejects.toMatchObject({ code: "bad_request" });
    await expect(service.save("u1", { cbu: VALID_CBU, banco: "galicia", titular: " " })).rejects.toMatchObject({ code: "bad_request" });
    await expect(service.save("u1", null)).rejects.toMatchObject({ code: "bad_request" });
    await expect(service.save("u1", { cbu: 123, banco: "galicia", titular: "Ana" })).rejects.toMatchObject({ code: "bad_request" });
  });
});
