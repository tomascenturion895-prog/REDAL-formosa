import { describe, expect, it } from "vitest";

import { directionsUrl, filterPoints, toMapPoints } from "./map";

const row = (over: Partial<Parameters<typeof toMapPoints>[0][number]> = {}) => ({
  id: "e1",
  nombre: "Miel Pura",
  direccion: "Ruta 11 km 5",
  telefono: null,
  latitud: -26.18,
  longitud: -58.18,
  ...over,
});

describe("toMapPoints", () => {
  it("convierte emprendimientos con ubicación a puntos", () => {
    expect(toMapPoints([row()])).toEqual([
      { id: "e1", nombre: "Miel Pura", direccion: "Ruta 11 km 5", telefono: null, position: { lat: -26.18, lng: -58.18 } },
    ]);
  });

  it("descarta los que no tienen ubicación o la tienen inválida", () => {
    const points = toMapPoints([
      row({ id: "sin-lat", latitud: null }),
      row({ id: "sin-lng", longitud: null }),
      row({ id: "cero", latitud: 0, longitud: 0 }),
      row({ id: "fuera", latitud: 95, longitud: -58 }),
      row({ id: "nan", latitud: Number.NaN }),
      row({ id: "ok" }),
    ]);
    expect(points.map((p) => p.id)).toEqual(["ok"]);
  });
});

describe("filterPoints", () => {
  const points = toMapPoints([
    row({ id: "a", nombre: "Chácra La Esperanza", direccion: "Clorinda" }),
    row({ id: "b", nombre: "Artesanías Pilagá", direccion: "Las Lomitas" }),
  ]);

  it("ignora mayúsculas y acentos", () => {
    expect(filterPoints(points, "CHACRA").map((p) => p.id)).toEqual(["a"]);
    expect(filterPoints(points, "artesanias").map((p) => p.id)).toEqual(["b"]);
  });

  it("también busca en la dirección", () => {
    expect(filterPoints(points, "lomitas").map((p) => p.id)).toEqual(["b"]);
  });

  it("sin texto devuelve todos, y sin coincidencias, ninguno", () => {
    expect(filterPoints(points, "  ")).toHaveLength(2);
    expect(filterPoints(points, "zzz")).toEqual([]);
  });
});

describe("directionsUrl", () => {
  it("arma el enlace de ruta con las coordenadas", () => {
    expect(directionsUrl({ lat: -26.18, lng: -58.18 })).toBe("https://www.google.com/maps/dir/?api=1&destination=-26.18,-58.18");
  });
});
