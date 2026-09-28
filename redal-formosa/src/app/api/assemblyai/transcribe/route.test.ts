import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { transcribeMock, assemblyTranscribeMock } = vi.hoisted(() => ({
  transcribeMock: vi.fn(),
  assemblyTranscribeMock: vi.fn(),
}));

vi.mock("@/server/container", async () => {
  const { InMemoryRateLimiter } = await import("@/server/security/rate-limiter");
  return {
    limiters: { voiceSearch: new InMemoryRateLimiter({ limit: 3, windowMs: 60_000 }) },
    getSpeechToText: () => ({ transcribe: transcribeMock }),
  };
});

vi.mock("assemblyai", () => ({
  AssemblyAI: class {
    transcripts = { transcribe: assemblyTranscribeMock };
  },
}));

import { POST } from "./route";

let ipCounter = 0;

function request(audio: Blob | null, ip = `10.0.0.${++ipCounter}`) {
  const form = new FormData();
  if (audio) form.append("audio", audio, "audio.webm");
  return new Request("http://localhost/api/assemblyai/transcribe", {
    method: "POST",
    body: form,
    headers: { "x-forwarded-for": ip },
  });
}

const smallAudio = () => new Blob([new Uint8Array(1024)], { type: "audio/webm;codecs=opus" });

describe("POST /api/assemblyai/transcribe", () => {
  beforeEach(() => {
    vi.stubEnv("ASSEMBLYAI_API_KEY", "");
    transcribeMock.mockReset();
    assemblyTranscribeMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rechaza pedidos sin audio", async () => {
    const response = await POST(request(null));
    expect(response.status).toBe(400);
  });

  it("rechaza audios de más de 2 MB", async () => {
    const response = await POST(request(new Blob([new Uint8Array(2 * 1024 * 1024 + 1)], { type: "audio/webm" })));
    expect(response.status).toBe(400);
    expect(transcribeMock).not.toHaveBeenCalled();
  });

  it("sin clave de AssemblyAI transcribe con Whisper y deduce la extensión del tipo", async () => {
    transcribeMock.mockResolvedValue("miel de abeja");

    const response = await POST(request(smallAudio()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: "miel de abeja" });
    expect(transcribeMock).toHaveBeenCalledWith(expect.any(Blob), "audio.webm");
  });

  it("con clave de AssemblyAI usa ese proveedor", async () => {
    vi.stubEnv("ASSEMBLYAI_API_KEY", "clave-de-prueba");
    assemblyTranscribeMock.mockResolvedValue({ status: "completed", text: "mandioca fresca" });

    const response = await POST(request(smallAudio()));

    expect(await response.json()).toEqual({ text: "mandioca fresca" });
    expect(assemblyTranscribeMock).toHaveBeenCalledWith(expect.objectContaining({ language_code: "es" }));
    expect(transcribeMock).not.toHaveBeenCalled();
  });

  it("si AssemblyAI falla, responde 503 sin filtrar el detalle del proveedor", async () => {
    vi.stubEnv("ASSEMBLYAI_API_KEY", "clave-de-prueba");
    assemblyTranscribeMock.mockResolvedValue({ status: "error", error: "Invalid API key sk-secreto" });

    const response = await POST(request(smallAudio()));

    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("sk-secreto");
  });

  it("limita la cantidad de pedidos por IP con cualquiera de los dos proveedores", async () => {
    transcribeMock.mockResolvedValue("ok");
    const ip = "203.0.113.9";

    for (let i = 0; i < 3; i++) expect((await POST(request(smallAudio(), ip))).status).toBe(200);

    const blocked = await POST(request(smallAudio(), ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).not.toBeNull();
  });

  it("el límite también rige para AssemblyAI (antes no tenía ninguno)", async () => {
    vi.stubEnv("ASSEMBLYAI_API_KEY", "clave-de-prueba");
    assemblyTranscribeMock.mockResolvedValue({ status: "completed", text: "ok" });
    const ip = "203.0.113.10";

    for (let i = 0; i < 3; i++) await POST(request(smallAudio(), ip));

    expect((await POST(request(smallAudio(), ip))).status).toBe(429);
    expect(assemblyTranscribeMock).toHaveBeenCalledTimes(3);
  });
});
