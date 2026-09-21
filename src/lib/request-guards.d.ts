import type { Hearing } from "./core.mjs";
export function requireSameOrigin(requestUrl: string, originHeader: string | null, allowedOrigin?: string): true;
export function normalizeHearingMessage(value: unknown, maxLength?: number): string;
export function assertHearingOwner<T extends Hearing>(hearing: T | undefined, visitorId: string | undefined): T;
export function normalizeVerdict(value: unknown): "SPARE" | "DELETE";
