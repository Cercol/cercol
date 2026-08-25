/**
 * PlanPanel — the distribution plan, made operable.
 *
 * The plan lives in the private ops repo and arrives via GET /admin/plan;
 * ninety-one steps, each one carrying why it matters, who it is for, what it
 * pays back, what it costs, and an action. This component only does the four
 * things a document cannot: show what is left, put the next step in front,
 * carry out the action, and remember that a step is done.
 *
 * "Remember" means D1, not localStorage. The plan document kept its ticks in
 * the browser, which is why it said the version living in the admin would keep
 * them in the database. So the state goes through the same authority_status
 * table and the same endpoints the panel already used, keyed by task id.
 *
 * Nothing here is a new visual language: Card, Badge, Button, SectionLabel and
 * the mm-design icons, arranged the way the rest of the admin already arranges
 * lists. The progress moon is the product's own metaphor, not a new one.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { flattenTasks, AUDIENCE, nextTask, taskStatus, mineReason, minePending } from '../data/plan-model'
import { getAuthorityStatus, setAuthorityStatus, fileAuthorityIssue, sendPlanEmail, getAdminPlan, getFacilitatorDrafts, sendFacilitatorDraft } from '../lib/api'
import { Badge, Button, SectionLabel } from './ui'
import {
  CheckIcon, ChevronRightIcon, ExternalLinkIcon,
  FirstQuarterIcon, FullMoonIcon, NewMoonIcon,
} from './MoonIcons'

/** Clicking the status cycles it. Dropped is reachable from the menu, not here. */
const NEXT = { todo: 'doing', doing: 'done', done: 'todo', dropped: 'todo' }

const STATUS_LABEL = { todo: 'per fer', doing: 'en marxa', done: 'fet', dropped: 'descartat' }

/** Effort reads as a cost, so it gets no colour. Payoff does. */
const PAYOFF_VARIANT = { Base: 'default', 'Trànsit': 'free', Autoritat: 'paid', GEO: 'beta', Ocupabilitat: 'default' }

/** Waxing, because that is the direction the plan goes. */
function ProgressMoon({ pct, size = 22 }) {
  const Icon = pct >= 75 ? FullMoonIcon : pct >= 25 ? FirstQuarterIcon : NewMoonIcon
  return <Icon size={size} />
}

function StatusButton({ status, busy, onClick }) {
  const done = status === 'done'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Canvia l'estat"
      className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
        done
          ? 'border-[var(--mm-color-green)] text-[var(--mm-color-green)]'
          : status === 'doing'
            ? 'border-[var(--mm-color-blue)] text-[var(--mm-color-blue)]'
            : 'border-gray-300 text-gray-600 hover:border-gray-400'
      }`}
    >
      {done && <CheckIcon size={12} />}
      {STATUS_LABEL[status]}
    </button>
  )
}

/** Copy that reports itself, because a copy button with no feedback gets pressed twice. */
function CopyButton({ text, label = 'Copia', variant = 'secondary' }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }}
    >
      {copied ? 'copiat' : label}
    </Button>
  )
}

/**
 * The prose inside `do` and `link` actions is authored in the repository and
 * reviewed in the pull request like any other source. It never comes from a
 * request, a database or a visitor, so there is nothing here to sanitise.
 */
function PlanProse({ html }) {
  return (
    <div
      className="text-xs leading-relaxed text-gray-600 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-1 [&_b]:font-semibold [&_p]:mt-1 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function mailto({ to, subject, body }) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** One block per action type. This is the part that makes the plan a panel. */
function Action({ action, taskId, sent, onSend, busy }) {
  if (!action) return null

  if (action.type === 'prompt') {
    return (
      <div className="mt-3">
        <SectionLabel color="gray" className="mb-2">Prompt</SectionLabel>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">{action.text}</pre>
        {action.note && <p className="mt-2 text-xs text-gray-500">{action.note}</p>}
        <div className="mt-2"><CopyButton text={action.text} label="Copia el prompt" /></div>
      </div>
    )
  }

  if (action.type === 'do') {
    return (
      <div className="mt-3">
        <SectionLabel color="gray" className="mb-2">Com es fa</SectionLabel>
        <PlanProse html={action.html} />
      </div>
    )
  }

  if (action.type === 'email') {
    return (
      <div className="mt-3">
        <SectionLabel color="gray" className="mb-2">Correu a {action.to}</SectionLabel>
        <p className="mb-2 text-xs font-medium text-gray-700">{action.subject}</p>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">{action.body}</pre>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {sent ? (
            <span className="text-xs text-[var(--mm-color-green)]">{sent}</span>
          ) : (
            <Button size="sm" disabled={busy} onClick={() => onSend(taskId, action)}>
              {busy ? 'enviant…' : 'Envia des de miquel@cercol.team'}
            </Button>
          )}
          <a
            href={mailto(action)}
            className="text-xs text-[var(--mm-color-blue)] hover:underline"
          >
            o obri al client de correu
          </a>
          <CopyButton text={action.body} label="Copia el cos" variant="ghost" />
        </div>
      </div>
    )
  }

  if (action.type === 'link') {
    return (
      <div className="mt-3">
        {action.html && <PlanProse html={action.html} />}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={action.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-[var(--mm-color-blue)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--mm-color-blue)] transition-colors hover:bg-[var(--mm-color-blue)] hover:text-white"
          >
            <ExternalLinkIcon size={12} /> {action.label || 'Obri'}
          </a>
          <CopyButton text={action.copy} label={action.copyLabel || 'Copia'} />
        </div>
      </div>
    )
  }

  return null
}

/**
 * The step the daily routine will never take. Deliberately unlike the payoff
 * badges beside it: those say what a step is worth, this says who has to be
 * at the keyboard, so it reads as a different kind of fact and not as one
 * more attribute. It carries the reason inline rather than in a tooltip,
 * because most of the plan is read on a phone and there is no hover there.
 */
function MinePill({ reason }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mm-color-red)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--mm-color-red)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--mm-color-red)]" aria-hidden="true" />
      Només tu · {reason}
    </span>
  )
}

function TaskRow({ task, row, status, busy, open, onToggleOpen, onCycle, onFile, onSend }) {
  return (
    <li id={`plan-${task.id}`} className={status === 'done' ? 'opacity-60' : ''}>
      <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <span className={`mt-0.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}>
            <ChevronRightIcon size={12} />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-gray-900">{task.title}</span>
              {mineReason(task) && <MinePill reason={mineReason(task)} />}
              {task.aud.map((a) => (
                <span key={a} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">{AUDIENCE[a] || a}</span>
              ))}
              {task.pay.map((p) => (
                <Badge key={p} variant={PAYOFF_VARIANT[p] || 'default'} className="!px-1.5 !py-0.5 !text-[10px]">{p}</Badge>
              ))}
              <span className="text-[11px] text-gray-400">esforç {task.eff.toLowerCase()}</span>
            </span>
            {!open && <span className="mt-1 line-clamp-2 block max-w-3xl text-xs leading-relaxed text-gray-600">{task.why}</span>}
          </span>
        </button>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {row.issue_number ? (
            <a
              href={`https://github.com/cercol/cercol-ops/issues/${row.issue_number}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:border-gray-400"
            >
              #{row.issue_number}
            </a>
          ) : (
            <button
              type="button"
              onClick={onFile}
              disabled={busy}
              title="Obri una incidència perquè la rutina diària la trobe"
              className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-gray-400 disabled:opacity-50"
            >
              envia a fer
            </button>
          )}
          <StatusButton status={status} busy={busy} onClick={onCycle} />
        </div>
      </div>

      {open && (
        <div className="pb-4 pl-6">
          <p className="max-w-3xl text-xs leading-relaxed text-gray-600">{task.why}</p>
          <Action
            action={task.action}
            taskId={task.id}
            sent={row.notes?.startsWith('sent ') ? row.notes : null}
            busy={busy}
            onSend={onSend}
          />
        </div>
      )}
    </li>
  )
}

/**
 * The routine's facilitator drafts (t74): read them here, send each with one
 * click. The click is the approval; nothing in this list is ever sent by a
 * machine on its own, because these are personal addresses.
 */
function FacilitatorDrafts() {
  const [drafts, setDrafts] = useState(null)
  const [busy, setBusy] = useState({})
  const [openDraft, setOpenDraft] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    getFacilitatorDrafts().then(({ drafts }) => setDrafts(drafts)).catch((e) => setError(e.message))
  }, [])

  const sendOne = async (d) => {
    setBusy((b) => ({ ...b, [d.file]: true }))
    try {
      await sendFacilitatorDraft(d.file)
      setDrafts((ds) => ds.map((x) => (x.file === d.file ? { ...x, sent_at: new Date().toISOString() } : x)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => ({ ...b, [d.file]: false }))
    }
  }

  if (error) return <p className="text-xs text-[var(--mm-color-red)]">Esborranys de facilitadors: {error}</p>
  if (!drafts || !drafts.length) return null

  const pending = drafts.filter((d) => !d.sent_at).length
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <SectionLabel color="blue" className="mb-1">Facilitadors · esborranys de la rutina</SectionLabel>
      <p className="mb-3 text-xs leading-relaxed text-gray-500">
        {pending ? `${pending} per revisar.` : 'Tots enviats o revisats.'} El clic és l'aprovació: cap d'estos correus ix mai sol.
      </p>
      <ul className="flex flex-col divide-y divide-gray-100 border-y border-gray-100">
        {drafts.map((d) => (
          <li key={d.file} className="py-2">
            <button
              type="button"
              onClick={() => setOpenDraft((o) => ({ ...o, [d.file]: !o[d.file] }))}
              className="flex w-full items-baseline gap-2 text-left"
            >
              <span className="text-sm font-medium text-gray-900">{d.name || d.email}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-gray-500">{d.email} · {d.lang}</span>
              {d.sent_at
                ? <span className="shrink-0 text-xs text-[var(--mm-color-green)]">enviat</span>
                : <span className="shrink-0 text-xs text-[var(--mm-color-blue)]">per revisar</span>}
            </button>
            {openDraft[d.file] && (
              <div className="mt-2">
                <p className="mb-1 text-xs font-medium text-gray-700">{d.subject}</p>
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">{d.text}</pre>
                {!d.sent_at && (
                  <div className="mt-2">
                    <Button size="sm" disabled={busy[d.file]} onClick={() => sendOne(d)}>
                      {busy[d.file] ? 'enviant…' : 'Envia des de miquel@cercol.team'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PlanPanel() {
  const [state, setState] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState({})
  const [open, setOpen] = useState({})
  const [openSections, setOpenSections] = useState({})
  const [pendingOnly, setPendingOnly] = useState(true)
  const [mineOnly, setMineOnly] = useState(false)

  // The plan itself comes from the private ops repo through the Worker; it
  // deliberately does not ship in this bundle.
  const [sections, setSections] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ items }, planSections] = await Promise.all([getAuthorityStatus(), getAdminPlan()])
      setState(Object.fromEntries(items.map((r) => [r.id, r])))
      setSections(planSections)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const tasks = useMemo(() => flattenTasks(sections), [sections])
  const next = useMemo(() => nextTask(tasks, state), [tasks, state])
  const mine = useMemo(() => minePending(tasks, state), [tasks, state])

  // The section holding the next step opens itself. Ten collapsed sections
  // with nothing open is a plan you have to go looking into.
  useEffect(() => {
    if (next) setOpenSections((s) => (s[next.section] === undefined ? { ...s, [next.section]: true } : s))
  }, [next])

  const done = tasks.filter((t) => taskStatus(t, state) === 'done').length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const cycle = async (task) => {
    const current = taskStatus(task, state)
    setBusy((b) => ({ ...b, [task.id]: true }))
    try {
      const row = await setAuthorityStatus(task.id, { status: NEXT[current] })
      setState((s) => ({ ...s, [task.id]: row }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => ({ ...b, [task.id]: false }))
    }
  }

  const fileIt = async (task) => {
    setBusy((b) => ({ ...b, [task.id]: true }))
    try {
      const { number } = await fileAuthorityIssue({
        id: task.id,
        name: task.title,
        why: task.why,
        ask: task.action?.type === 'do' ? undefined : task.action?.note,
        url: task.action?.url,
        contact: task.action?.to,
      })
      setState((s) => ({ ...s, [task.id]: { ...(s[task.id] || {}), issue_number: number, status: taskStatus(task, s) === 'done' ? 'done' : 'doing' } }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => ({ ...b, [task.id]: false }))
    }
  }

  const send = async (taskId, action) => {
    setBusy((b) => ({ ...b, [taskId]: true }))
    try {
      const res = await sendPlanEmail(taskId, { to: action.to, subject: action.subject, text: action.body })
      setState((s) => ({ ...s, [taskId]: { ...(s[taskId] || {}), notes: res.notes, status: 'doing' } }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => ({ ...b, [taskId]: false }))
    }
  }

  const jumpToNext = () => {
    if (!next) return
    setOpenSections((s) => ({ ...s, [next.section]: true }))
    setOpen((o) => ({ ...o, [next.id]: true }))
    requestAnimationFrame(() => {
      document.getElementById(`plan-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Where the plan stands, and the one step to take next. */}
      <div className="rounded border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <ProgressMoon pct={pct} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{done} de {tasks.length} passes fetes · {pct}%</p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded bg-gray-100">
              <div className="h-full rounded bg-[var(--mm-color-green)]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {error && <p className="text-xs text-[var(--mm-color-red)]">{error}</p>}
        </div>

        {next && (
          <button
            type="button"
            onClick={jumpToNext}
            className="mt-4 flex w-full items-start gap-2 rounded border-l-[3px] border-[var(--mm-color-blue)] bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
          >
            <span className="min-w-0">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[var(--mm-color-blue)]">Següent passa</span>
              <span className="block text-sm font-medium text-gray-900">{next.title}</span>
              <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-gray-600">{next.why}</span>
            </span>
          </button>
        )}
      </div>

      <FacilitatorDrafts />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={pendingOnly ? 'primary' : 'secondary'} size="sm" onClick={() => setPendingOnly(true)}>Pendents</Button>
        <Button variant={pendingOnly ? 'secondary' : 'primary'} size="sm" onClick={() => setPendingOnly(false)}>Totes</Button>
        <Button variant={mineOnly ? 'primary' : 'secondary'} size="sm" onClick={() => setMineOnly((v) => !v)}>Només meves</Button>
        <span className="text-xs text-gray-500">{mine.mine} de {mine.left} pendents no les farà la rutina</span>
      </div>

      {loading && <p className="text-sm text-gray-400">Carregant…</p>}

      {!loading && sections.map((section) => {
        const all = section.tasks
        const sectionDone = all.filter((t) => taskStatus(t, state) === 'done').length
        const shown = all.filter(
          (t) => (!pendingOnly || taskStatus(t, state) !== 'done') && (!mineOnly || mineReason(t)),
        )
        const isOpen = openSections[section.id] ?? false
        if ((pendingOnly || mineOnly) && !shown.length && !isOpen) return null

        return (
          <section key={section.id}>
            <button
              type="button"
              onClick={() => setOpenSections((s) => ({ ...s, [section.id]: !isOpen }))}
              className="flex w-full items-start gap-2 border-l-[3px] border-gray-200 pl-3 text-left"
            >
              <span className={`mt-1 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                <ChevronRightIcon size={12} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                  <span className="text-xs text-gray-400">{sectionDone}/{all.length}</span>
                </span>
                {section.sub && <span className="mt-0.5 block max-w-2xl text-xs leading-relaxed text-gray-500">{section.sub}</span>}
              </span>
            </button>

            {isOpen && (
              <ul className="mt-3 flex flex-col divide-y divide-gray-100 border-y border-gray-100">
                {shown.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    row={state[task.id] || {}}
                    status={taskStatus(task, state)}
                    busy={busy[task.id]}
                    open={!!open[task.id]}
                    onToggleOpen={() => setOpen((o) => ({ ...o, [task.id]: !o[task.id] }))}
                    onCycle={() => cycle(task)}
                    onFile={() => fileIt(task)}
                    onSend={send}
                  />
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
