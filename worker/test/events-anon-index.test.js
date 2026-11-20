// Spec: worker/schema/007_events_anon_idx.sql
//
// Joining events to a set of visitors must look each visitor up by anon_id.
// Without the index SQLite re-reads the whole date window once per visitor:
// 15.1 M rows read by a single query on 2026-11-16, three times D1's daily
// free limit. This holds the plan, not the timing.
import { describe, it, expect } from 'vitest'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'

const dir = new URL('../schema/', import.meta.url)

function schemaDb() {
  const db = new DatabaseSync(':memory:')
  for (const f of readdirSync(dir).sort()) db.exec(readFileSync(new URL(f, dir), 'utf8'))
  return db
}

const plan = (db, sql) => db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all().map((r) => r.detail).join('\n')

describe('events per-visitor lookups', () => {
  const db = schemaDb()

  it('joins readers to their events through the anon_id index', () => {
    const p = plan(db, `
      WITH r AS (SELECT DISTINCT anon_id FROM events
                  WHERE name='article_view' AND created_at>=date('now','-28 days') AND anon_id IS NOT NULL)
      SELECT ev.anon_id, COUNT(*) FROM events ev JOIN r ON r.anon_id=ev.anon_id
       WHERE ev.created_at>=date('now','-28 days') GROUP BY ev.anon_id`)
    expect(p).toMatch(/SEARCH ev USING (COVERING )?INDEX events_anon_created_idx \(anon_id=\?/)
  })

  it("finds a visitor's first event through the anon_id index", () => {
    const p = plan(db, `
      SELECT (SELECT e.name FROM events e WHERE e.anon_id=s.anon_id ORDER BY e.created_at LIMIT 1)
        FROM (SELECT DISTINCT anon_id FROM events WHERE name='test_start') s`)
    expect(p).toMatch(/SEARCH e USING (COVERING )?INDEX events_anon_created_idx \(anon_id=\?/)
  })
})
