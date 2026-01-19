import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "./supabase";
import {
  createConsultation,
  deactivateConsultation,
  fetchConsultations,
  updateConsultation,
} from "./consultations";

type SupabaseFrom = typeof supabase.from;

describe("consultations data access", () => {
  beforeEach(() => {
    (supabase.from as SupabaseFrom).mockReset();
  });

  it("fetchConsultations filtra por paciente y activos", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqSecond = vi.fn().mockReturnValue({ order });
    const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond });
    const select = vi.fn().mockReturnValue({ eq: eqFirst });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchConsultations("patient-1");

    expect(supabase.from).toHaveBeenCalledWith("consultations");
    expect(eqFirst).toHaveBeenCalledWith("patient_id", "patient-1");
    expect(eqSecond).toHaveBeenCalledWith("is_active", true);
    expect(order).toHaveBeenCalledWith("consultation_date", { ascending: false });
    expect(result.error).toBeNull();
  });

  it("createConsultation inserta payload", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as SupabaseFrom).mockReturnValue({ insert });

    const payload = {
      patient_id: "patient-1",
      consultation_date: "2024-01-01",
      observations: "Obs",
      plan_summary: null,
    };

    const result = await createConsultation(payload);

    expect(insert).toHaveBeenCalledWith(payload);
    expect(result.error).toBeNull();
  });

  it("updateConsultation actualiza por id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const payload = {
      consultation_date: "2024-01-02",
      observations: null,
      plan_summary: "Plan",
    };

    const result = await updateConsultation("consult-1", payload);

    expect(update).toHaveBeenCalledWith(payload);
    expect(eq).toHaveBeenCalledWith("id", "consult-1");
    expect(result.error).toBeNull();
  });

  it("deactivateConsultation marca inactivo", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await deactivateConsultation("consult-1");

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "consult-1");
    expect(result.error).toBeNull();
  });
});
