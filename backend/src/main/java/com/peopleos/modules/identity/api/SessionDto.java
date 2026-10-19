package com.peopleos.modules.identity.api;

import java.time.Instant;
import java.util.UUID;

/** The management ID is independent of the bearer session ID. */
public record SessionDto(UUID id, Instant createdAt, Instant lastAccessedAt, Instant expiresAt, boolean current) { }
