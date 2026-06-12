UPDATE "PasswordResetRequest"
SET
    "status" = 'NEW',
    "viewedAt" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE
    "status" = 'VIEWED'
    AND "completedAt" IS NULL
    AND "handledAt" IS NULL;
