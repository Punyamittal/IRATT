export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, {
      credentials: "same-origin",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("CONNECTION ERROR — Please try again.", 0);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.error || "CONNECTION ERROR — Please try again.", response.status, data);
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.payload && typeof error.payload === "object") {
    const payload = error.payload as { fieldErrors?: Record<string, string> };
    return payload.fieldErrors ?? {};
  }
  return {};
}

export async function downloadExport(format: "csv" | "xlsx") {
  const response = await fetch(`/api/admin/export?format=${format}`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new ApiError("CONNECTION ERROR — Please try again.", response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `isrs-working-database.${format === "xlsx" ? "xlsx" : "csv"}`;
  link.click();
  URL.revokeObjectURL(url);
}
