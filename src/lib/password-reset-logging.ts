type PasswordResetLogData = {
  actorId?: string | null;
  error?: unknown;
  requestId?: string;
  userId?: string;
};

function serializeError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function logPasswordResetEvent(event: string, data: PasswordResetLogData = {}) {
  const payload = {
    actorId: data.actorId ?? undefined,
    error: data.error === undefined ? undefined : serializeError(data.error),
    event,
    requestId: data.requestId,
    timestamp: new Date().toISOString(),
    userId: data.userId,
  };
  const serialized = JSON.stringify(payload);

  if (data.error === undefined) {
    console.info(`[password-reset] ${serialized}`);
  } else {
    console.error(`[password-reset] ${serialized}`);
  }
}
