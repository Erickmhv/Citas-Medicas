import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "./supabase";
import {
  createPatient,
  deactivatePatient,
  fetchPatientById,
  fetchPatients,
  searchPatients,
  updatePatient,
} from "./patients";

type SupabaseFrom = typeof supabase.from;

describe("patients data access", () => {
  beforeEach(() => {
    (supabase.from as SupabaseFrom).mockReset();
  });

  it("fetchPatients aplica filtro y paginacion", async () => {
    const range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const order = vi.fn().mockReturnValue({ range });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchPatients({ query: "", page: 0, pageSize: 25 });

    expect(supabase.from).toHaveBeenCalledWith("patients");
    expect(select).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("is_active", true);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(range).toHaveBeenCalledWith(0, 24);
    expect(result.error).toBeNull();
  });

  it("createPatient inserta el payload", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as SupabaseFrom).mockReturnValue({ insert });

    const payload = {
      full_name: "Ana",
      email: "ana@clinica.com",
      phone: null,
      date_of_birth: null,
    };

    const result = await createPatient(payload);

    expect(supabase.from).toHaveBeenCalledWith("patients");
    expect(insert).toHaveBeenCalledWith(payload);
    expect(result.error).toBeNull();
  });

  it("updatePatient actualiza por id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const payload = {
      full_name: "Ana Perez",
      email: null,
      phone: "123",
      date_of_birth: "1990-01-01",
    };

    const result = await updatePatient("abc", payload);

    expect(update).toHaveBeenCalledWith(payload);
    expect(eq).toHaveBeenCalledWith("id", "abc");
    expect(result.error).toBeNull();
  });

  it("deactivatePatient marca inactivo", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await deactivatePatient("abc");

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "abc");
    expect(result.error).toBeNull();
  });

  it("fetchPatientById consulta por id", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchPatientById("abc");

    expect(select).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("id", "abc");
    expect(maybeSingle).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });

  it("searchPatients usa rango limitado", async () => {
    const range = vi.fn().mockResolvedValue({ data: [], error: null });
    const order = vi.fn().mockReturnValue({ range });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await searchPatients("", 8);

    expect(eq).toHaveBeenCalledWith("is_active", true);
    expect(range).toHaveBeenCalledWith(0, 7);
    expect(result.error).toBeNull();
  });
});
