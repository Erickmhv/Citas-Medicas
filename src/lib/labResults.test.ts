import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "./supabase";
import {
  calculateHomaIr,
  createLabResult,
  deactivateLabResult,
  fetchLabResultById,
  fetchLabResults,
  updateLabResult,
} from "./labResults";

type SupabaseFrom = typeof supabase.from;

describe("labResults data access", () => {
  beforeEach(() => {
    (supabase.from as SupabaseFrom).mockReset();
  });

  it("fetchLabResults obtiene resultados por paciente", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqActive = vi.fn().mockReturnValue({ order });
    const eqPatient = vi.fn().mockReturnValue({ eq: eqActive });
    const select = vi.fn().mockReturnValue({ eq: eqPatient });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchLabResults("patient-123");

    expect(supabase.from).toHaveBeenCalledWith("lab_results");
    expect(select).toHaveBeenCalled();
    expect(eqPatient).toHaveBeenCalledWith("patient_id", "patient-123");
    expect(eqActive).toHaveBeenCalledWith("is_active", true);
    expect(order).toHaveBeenCalledWith("result_date", { ascending: false });
    expect(result.error).toBeNull();
  });

  it("fetchLabResultById consulta por id", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchLabResultById("result-abc");

    expect(select).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("id", "result-abc");
    expect(maybeSingle).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });

  it("createLabResult inserta el payload con patient_id", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as SupabaseFrom).mockReturnValue({ insert });

    const payload = {
      result_date: "2024-01-15",
      notes: "Resultados normales",
      result_data: { glucosa_ayunas: 90, insulina: 10 },
    };

    const result = await createLabResult("patient-123", payload);

    expect(supabase.from).toHaveBeenCalledWith("lab_results");
    expect(insert).toHaveBeenCalledWith({
      patient_id: "patient-123",
      ...payload,
    });
    expect(result.error).toBeNull();
  });

  it("updateLabResult actualiza por id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const payload = {
      result_date: "2024-01-20",
      notes: "Actualizacion",
      result_data: { glucosa_ayunas: 95 },
    };

    const result = await updateLabResult("result-abc", payload);

    expect(update).toHaveBeenCalledWith(payload);
    expect(eq).toHaveBeenCalledWith("id", "result-abc");
    expect(result.error).toBeNull();
  });

  it("deactivateLabResult marca inactivo", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await deactivateLabResult("result-abc");

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "result-abc");
    expect(result.error).toBeNull();
  });
});

describe("calculateHomaIr", () => {
  it("calcula HOMA-IR correctamente", () => {
    const result = calculateHomaIr(100, 10);
    expect(result).toBeCloseTo(2.47, 2);
  });

  it("retorna null si glucosa es null", () => {
    const result = calculateHomaIr(null, 10);
    expect(result).toBeNull();
  });

  it("retorna null si insulina es null", () => {
    const result = calculateHomaIr(100, null);
    expect(result).toBeNull();
  });

  it("retorna null si glucosa es cero o negativa", () => {
    expect(calculateHomaIr(0, 10)).toBeNull();
    expect(calculateHomaIr(-5, 10)).toBeNull();
  });

  it("retorna null si insulina es cero o negativa", () => {
    expect(calculateHomaIr(100, 0)).toBeNull();
    expect(calculateHomaIr(100, -5)).toBeNull();
  });

  it("calcula valores normales (HOMA-IR < 2.5)", () => {
    const result = calculateHomaIr(90, 8);
    expect(result).toBeLessThan(2.5);
  });

  it("calcula valores altos (HOMA-IR > 2.5)", () => {
    const result = calculateHomaIr(120, 15);
    expect(result).toBeGreaterThan(2.5);
  });
});
