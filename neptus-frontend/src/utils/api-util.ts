export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://neptus-homolog.up.railway.app/api";

export function toApiId(id: string | number): number {
  const numericId = typeof id === "number" ? id : Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(`ID invalido para API: ${id}`);
  }

  return numericId;
}

export function toOptionalApiId(id?: string | number | null): number | null {
  if (id === undefined || id === null || id === "") {
    return null;
  }

  return toApiId(id);
}
