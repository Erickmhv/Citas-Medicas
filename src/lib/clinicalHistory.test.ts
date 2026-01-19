import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "./supabase";
import {
  createClinicalHistory,
  deactivateClinicalHistory,
  fetchClinicalHistory,
  updateClinicalHistory,
} from "./clinicalHistory";

type SupabaseFrom = typeof supabase.from;

describe("clinical history data access", () => {
  beforeEach(() => {
    (supabase.from as SupabaseFrom).mockReset();
  });

  it("fetchClinicalHistory filtra por paciente y activos", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqSecond = vi.fn().mockReturnValue({ order });
    const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond });
    const select = vi.fn().mockReturnValue({ eq: eqFirst });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchClinicalHistory("patient-1");

    expect(supabase.from).toHaveBeenCalledWith("clinical_history");
    expect(eqFirst).toHaveBeenCalledWith("patient_id", "patient-1");
    expect(eqSecond).toHaveBeenCalledWith("is_active", true);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result.error).toBeNull();
  });

  it("createClinicalHistory inserta notas", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as SupabaseFrom).mockReturnValue({ insert });

    const result = await createClinicalHistory("patient-1", "Notas");

    expect(insert).toHaveBeenCalledWith({ patient_id: "patient-1", notes: "Notas" });
    expect(result.error).toBeNull();
  });

  it("updateClinicalHistory actualiza por id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await updateClinicalHistory("entry-1", "Nuevo texto");

    expect(update).toHaveBeenCalledWith({ notes: "Nuevo texto" });
    expect(eq).toHaveBeenCalledWith("id", "entry-1");
    expect(result.error).toBeNull();
  });

  it("deactivateClinicalHistory marca inactivo", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await deactivateClinicalHistory("entry-1");

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "entry-1");
    expect(result.error).toBeNull();
  });
});
