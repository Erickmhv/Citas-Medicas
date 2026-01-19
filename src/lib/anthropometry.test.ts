import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "./supabase";
import {
  calculateAnthropometry,
  createAnthropometry,
  deactivateAnthropometry,
  fetchAnthropometry,
  updateAnthropometry,
} from "./anthropometry";

type SupabaseFrom = typeof supabase.from;

describe("anthropometry data access", () => {
  beforeEach(() => {
    (supabase.from as SupabaseFrom).mockReset();
  });

  it("fetchAnthropometry filtra por paciente y activos", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqSecond = vi.fn().mockReturnValue({ order });
    const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond });
    const select = vi.fn().mockReturnValue({ eq: eqFirst });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchAnthropometry("patient-1");

    expect(supabase.from).toHaveBeenCalledWith("anthropometric_records");
    expect(eqFirst).toHaveBeenCalledWith("patient_id", "patient-1");
    expect(eqSecond).toHaveBeenCalledWith("is_active", true);
    expect(order).toHaveBeenCalledWith("recorded_at", { ascending: false });
    expect(result.error).toBeNull();
  });

  it("createAnthropometry inserta payload", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as SupabaseFrom).mockReturnValue({ insert });

    const payload = {
      recorded_at: "2024-01-01",
      weight_kg: 70,
      height_cm: 170,
      waist_cm: 80,
      hip_cm: 90,
    };

    const result = await createAnthropometry("patient-1", payload);

    expect(insert).toHaveBeenCalledWith({ patient_id: "patient-1", ...payload });
    expect(result.error).toBeNull();
  });

  it("updateAnthropometry actualiza por id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const payload = {
      recorded_at: "2024-01-02",
      weight_kg: 71,
      height_cm: 170,
      waist_cm: 81,
      hip_cm: 91,
    };

    const result = await updateAnthropometry("rec-1", payload);

    expect(update).toHaveBeenCalledWith(payload);
    expect(eq).toHaveBeenCalledWith("id", "rec-1");
    expect(result.error).toBeNull();
  });

  it("deactivateAnthropometry marca inactivo", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await deactivateAnthropometry("rec-1");

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "rec-1");
    expect(result.error).toBeNull();
  });

  it("calculateAnthropometry calcula valores", () => {
    const result = calculateAnthropometry({
      recorded_at: "2024-01-01",
      weight_kg: 70,
      height_cm: 170,
      waist_cm: 80,
      hip_cm: 90,
    });

    const bmi = result.find((item) => item.key === "bmi");
    expect(bmi?.value).toBeCloseTo(24.22, 2);
  });
});
