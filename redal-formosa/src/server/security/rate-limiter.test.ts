import { describe, expect, it } from "vitest";

import { InMemoryRateLimiter } from "./rate-limiter";

function limiterWithClock(limit: number, windowMs: number) {
  const clock = { now: 1_000_000 };
  const limiter = new InMemoryRateLimiter({ limit, windowMs, now: () => clock.now });
  return { limiter, clock };
}

describe("InMemoryRateLimiter", () => {
  it("permite hasta el límite y bloquea el excedente", () => {
    const { limiter } = limiterWithClock(3, 60_000);
    expect([1, 2, 3].map(() => limiter.check("a").allowed)).toEqual([true, true, true]);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("informa cuánto cupo queda", () => {
    const { limiter } = limiterWithClock(3, 60_000);
    expect(limiter.check("a").remaining).toBe(2);
    expect(limiter.check("a").remaining).toBe(1);
  });

  it("indica cuántos segundos esperar cuando bloquea", () => {
    const { limiter, clock } = limiterWithClock(1, 60_000);
    limiter.check("a");
    clock.now += 20_000;
    expect(limiter.check("a")).toMatchObject({ allowed: false, retryAfterSeconds: 40 });
  });

  it("libera el cupo al terminar la ventana", () => {
    const { limiter, clock } = limiterWithClock(1, 60_000);
    limiter.check("a");
    expect(limiter.check("a").allowed).toBe(false);
    clock.now += 60_000;
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("cuenta cada clave por separado", () => {
    const { limiter } = limiterWithClock(1, 60_000);
    limiter.check("a");
    expect(limiter.check("a").allowed).toBe(false);
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("no crece sin límite: purga las ventanas vencidas", () => {
    const clock = { now: 0 };
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 10, maxKeys: 3, now: () => clock.now });
    ["a", "b", "c"].forEach((k) => limiter.check(k));
    clock.now = 100;
    expect(() => limiter.check("d")).not.toThrow();
    expect(limiter.check("a").allowed).toBe(true);
  });
});
