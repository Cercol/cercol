/**
 * AuthorityPanel — where Cèrcol should appear, and what state each door is in.
 *
 * The catalogue comes from src/data/authority-targets.js, researched and
 * reviewable in the repository. The state comes from D1. This component only
 * joins them and gives the operator the three things a panel like this needs:
 * open the page, file it as work, mark it done.
 *
 * Filing writes a GitHub issue, which is the same queue the daily brief fills
 * and the daily routine works from. That is deliberate: a second to-do list
 * is a to-do list nobody reads.
 *
 * Grouped by stage rather than by beat, because the finding that shaped the
 * research is that almost nothing here is blocked by how many people have
 * taken the test, and the panel should say so every time it is opened.
 */
import { useCallback, useEffect, useState } from 'react'

import { AUTHORITY_TARGETS, STAGES, orderedTargets } from '../data/authority-targets'
import { getAuthorityStatus, setAuthorityStatus, fileAuthorityIssue } from '../lib/api'
import { colors } from '../design/tokens'
import { CheckIcon, ExternalLinkIcon } from './MoonIcons'

const STAGE_COPY = {
  now: {
    title: 'Reachable today',
    note: 'With 41 responses and what already exists. Nothing here waits for anything.',
    accent: colors.green,
  },
  consent: {
    title: 'Blocked on consent',
    note: 'Consent cannot be applied retroactively, so every response collected before the notice ships is one that can never be published. This is the only group that gets worse while it waits.',
    accent: colors.red,
  },
  data: {
    title: 'Blocked on data',
    note: 'Waiting on responses, and in most cases on complete self-plus-Witness pairs, which are the rarer asset.',
    accent: colors.blue,
  },
}

const DIFFICULTY = { form: 'a form', person: 'a person decides', long: 'a person, and a bar we do not clear yet' }
const NEXT = { todo: 'doing', doing: 'done', done: 'todo', dropped: 'todo' }

function StatusButton({ status, onClick, busy }) {
  const done = status === 'done'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        done
          ? 'border-transparent bg-[var(--mm-color-green)] text-white'
          : status === 'doing'
            ? 'border-[var(--mm-color-blue)] text-[var(--mm-color-blue)]'
            : 'border-gray-300 text-gray-600 hover:border-gray-400'
      }`}
    >
      {done && <CheckIcon size={12} />}
      {status}
    </button>
  )
}

export default function AuthorityPanel() {
  const [state, setState] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { items } = await getAuthorityStatus()
      setState(Object.fromEntries(items.map((r) => [r.id, r])))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const mark = async (target) => {
    const current = state[target.id]?.status || 'todo'
    setBusy((b) => ({ ...b, [target.id]: true }))
    try {
      const row = await setAuthorityStatus(target.id, { status: NEXT[current] })
      setState((s) => ({ ...s, [target.id]: row }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => ({ ...b, [target.id]: false }))
    }
  }

  const fileIt = async (target) => {
    setBusy((b) => ({ ...b, [target.id]: true }))
    try {
      const { number } = await fileAuthorityIssue(target)
      setState((s) => ({ ...s, [target.id]: { ...(s[target.id] || {}), issue_number: number, status: s[target.id]?.status === 'done' ? 'done' : 'doing' } }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => ({ ...b, [target.id]: false }))
    }
  }

  const done = AUTHORITY_TARGETS.filter((t) => state[t.id]?.status === 'done').length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-gray-500">
          {done} of {AUTHORITY_TARGETS.length} done
        </p>
        {error && <p className="text-xs text-[var(--mm-color-red)]">{error}</p>}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {!loading && STAGES.map((stage) => {
        const targets = orderedTargets(AUTHORITY_TARGETS.filter((t) => t.stage === stage))
        if (!targets.length) return null
        const copy = STAGE_COPY[stage]
        return (
          <section key={stage}>
            <div className="mb-3 border-l-[3px] pl-3" style={{ borderColor: copy.accent }}>
              <h3 className="text-sm font-semibold text-gray-800">{copy.title}</h3>
              <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-gray-500">{copy.note}</p>
            </div>

            <ul className="flex flex-col divide-y divide-gray-100 border-y border-gray-100">
              {targets.map((t) => {
                const row = state[t.id] || {}
                const status = row.status || 'todo'
                return (
                  <li key={t.id} className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4 ${status === 'done' ? 'opacity-60' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-medium text-gray-900">{t.name}</span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">{t.beat}</span>
                        <span className="text-[11px] text-gray-400">{DIFFICULTY[t.difficulty]}</span>
                      </div>
                      <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-600">{t.why}</p>
                      {t.ask && <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-500"><span className="font-medium">Takes:</span> {t.ask}</p>}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {t.contact && (
                        <a
                          href={`mailto:${t.contact}`}
                          className="text-xs text-[var(--mm-color-blue)] hover:underline"
                        >
                          {t.contact}
                        </a>
                      )}
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-gray-400"
                      >
                        <ExternalLinkIcon size={12} /> open
                      </a>
                      {row.issue_number ? (
                        <a
                          href={`https://github.com/cercol/cercol/issues/${row.issue_number}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:border-gray-400"
                        >
                          #{row.issue_number}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileIt(t)}
                          disabled={busy[t.id]}
                          className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-gray-400 disabled:opacity-50"
                        >
                          file as issue
                        </button>
                      )}
                      <StatusButton status={status} busy={busy[t.id]} onClick={() => mark(t)} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
