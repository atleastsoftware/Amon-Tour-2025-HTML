export type NotificationStatus = "accepted" | "failed" | "not_configured";
export function syncKeys(env?: Record<string, string | undefined>): string[];
export function initialAdminPassword(env?: Record<string, string | undefined>): string | undefined;
export function notificationMessage(request: object, env?: Record<string, string | undefined>): object;
export function persistCustomTour<T extends object>(persist: () => Promise<T>, options?: {
  env?: Record<string, string | undefined>; fetcher?: typeof fetch;
}): Promise<{ request: T; notification: NotificationStatus }>;
export function customTourCsv(requests: readonly object[], since?: string): string;
