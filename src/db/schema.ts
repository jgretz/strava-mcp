import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import type { AuthToken } from '../types.ts';

// Single-row token store for the hosted Strava MCP. The MCP mints this token
// via OAuth and rotates it on refresh; persisting it here lets it survive
// machine restarts (fly machines are ephemeral) without re-authorizing.
export const stravaTokens = pgTable('strava_tokens', {
  id: text('id').primaryKey(), // always 'default' — single-row table
  token: jsonb('token').$type<AuthToken>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Short-lived CSRF state for the OAuth handshake. DB-backed (not in-memory)
// so the authorize request and the callback can land on different machines.
export const stravaOauthStates = pgTable('strava_oauth_states', {
  state: text('state').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
