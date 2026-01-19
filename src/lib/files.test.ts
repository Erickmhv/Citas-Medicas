import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    },
  },
}));

import { supabase } from "./supabase";
import {
  deactivateFile,
  fetchPatientFiles,
  getFileDownloadUrl,
  updateFileMeta,
  uploadPatientFile,
} from "./files";

type SupabaseFrom = typeof supabase.from;

const mockStorageFrom = () => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: "http://signed" }, error: null });
  (supabase.storage.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    upload,
    createSignedUrl,
  });
  return { upload, createSignedUrl };
};

describe("files data access", () => {
  beforeEach(() => {
    (supabase.from as SupabaseFrom).mockReset();
    (supabase.storage.from as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it("fetchPatientFiles filtra por paciente y activos", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqSecond = vi.fn().mockReturnValue({ order });
    const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond });
    const select = vi.fn().mockReturnValue({ eq: eqFirst });
    (supabase.from as SupabaseFrom).mockReturnValue({ select });

    const result = await fetchPatientFiles("patient-1");

    expect(supabase.from).toHaveBeenCalledWith("files");
    expect(eqFirst).toHaveBeenCalledWith("patient_id", "patient-1");
    expect(eqSecond).toHaveBeenCalledWith("is_active", true);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result.error).toBeNull();
  });

  it("uploadPatientFile sube y registra metadata", async () => {
    const { upload } = mockStorageFrom();
    const insert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({ data: { clinic_id: "clinic-1" }, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ insert, select });
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    supabase.auth.getUser = getUser;

    const fakeFile = {
      name: "archivo.pdf",
      type: "application/pdf",
      size: 1234,
    } as File;

    const result = await uploadPatientFile({
      patientId: "patient-1",
      file: fakeFile,
      isLab: true,
      description: "Resultado",
    });

    expect(upload).toHaveBeenCalled();
    expect(insert).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });

  it("updateFileMeta actualiza metadata", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await updateFileMeta("file-1", {
      file_name: "Nuevo",
      is_lab: false,
      description: "Nota",
    });

    expect(update).toHaveBeenCalledWith({ file_name: "Nuevo", is_lab: false, description: "Nota" });
    expect(eq).toHaveBeenCalledWith("id", "file-1");
    expect(result.error).toBeNull();
  });

  it("deactivateFile marca inactivo", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    (supabase.from as SupabaseFrom).mockReturnValue({ update });

    const result = await deactivateFile("file-1");

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "file-1");
    expect(result.error).toBeNull();
  });

  it("getFileDownloadUrl devuelve enlace firmado", async () => {
    const { createSignedUrl } = mockStorageFrom();

    const result = await getFileDownloadUrl("path/test.pdf");

    expect(createSignedUrl).toHaveBeenCalledWith("path/test.pdf", 60);
    expect(result.url).toBe("http://signed");
  });
});
