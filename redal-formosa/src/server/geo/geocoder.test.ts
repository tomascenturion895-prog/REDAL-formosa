import { describe, expect, it, vi } from "vitest";

import { NominatimGeocoder, buildSearchQuery } from "./geocoder";

describe("buildSearchQuery", () => {
  it("limpia palabras que confunden al buscador", () => {
    expect(buildSearchQuery("Formosa Capital Calle santiago del estero 480")).toBe("santiago del estero 480, Formosa, Argentina");
  });

  it("agrega la provincia una sola vez", () => {
    expect(buildSearchQuery("Belgrano 1200, Formosa")).toBe("Belgrano 1200, Formosa, Argentina");
  });

  it("conserva barrios y espacios extra se colapsan", () => {
    expect(buildSearchQuery("  Av. 25 de Mayo   350   barrio Centro ")).toBe("Av. 25 de Mayo 350 barrio Centro, Formosa, Argentina");
  });
});

function geocoderWith(fetchImpl: typeof fetch) {
  return new NominatimGeocoder({ userAgent: "Test/1.0", baseUrl: "https://ejemplo.test", fetchImpl });
}

const ok = (body: unknown) => vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }) as unknown as typeof fetch;

describe("NominatimGeocoder", () => {
  it("devuelve coordenadas numéricas y etiqueta", async () => {
    const fetchImpl = ok([{ lat: "-26.189", lon: "-58.226", display_name: "Santiago del Estero, Formosa" }]);
    const results = await geocoderWith(fetchImpl).search("Santiago del Estero 480");
    expect(results).toEqual([{ lat: -26.189, lng: -58.226, label: "Santiago del Estero, Formosa" }]);

    const [url, init] = vi.mocked(fetchImpl).mock.calls[0];
    expect(String(url)).toContain("countrycodes=ar");
    expect(String(url)).toContain("bounded=1");
    expect((init as RequestInit).headers).toMatchObject({ "User-Agent": "Test/1.0" });
  });

  it("descarta filas con datos inválidos", async () => {
    const results = await geocoderWith(ok([{ lat: "x", lon: "1", display_name: "a" }, { lat: "1", lon: "2" }])).search("algo");
    expect(results).toEqual([]);
  });

  it("traduce los fallos a errores esperables", async () => {
    const down = vi.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;
    await expect(geocoderWith(down).search("algo")).rejects.toMatchObject({ code: "unavailable" });

    const offline = vi.fn().mockRejectedValue(new Error("red")) as unknown as typeof fetch;
    await expect(geocoderWith(offline).search("algo")).rejects.toMatchObject({ code: "unavailable" });
  });
});
