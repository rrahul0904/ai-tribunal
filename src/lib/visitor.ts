import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export async function getVisitorId({ create = false }: { create?: boolean } = {}) {
  const jar = await cookies();
  const current = jar.get("tribunal_visitor")?.value;
  if (current) return current;
  return create ? randomUUID() : undefined;
}
