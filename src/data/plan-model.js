/**
 * Plan model: the helpers the admin panel uses to render the distribution
 * plan. The plan DATA is deliberately not here: it lives in the private ops
 * repository and reaches the panel through `GET /admin/plan` (admin JWT).
 * Until 2026-08-24 the whole plan shipped in this public bundle, which put
 * the project's strategy, outreach letters and self-audits one fetch away
 * from anyone — the login only hid the tab, not the chunk. The functions
 * take the fetched sections/tasks as arguments instead of importing them.
 *
 * Step progress still lives in D1 `authority_status` and overrides the
 * plan's own `done` flags, exactly as before.
 */

/** Every step, flattened, in plan order. */
export const flattenTasks = (sections) =>
  sections.flatMap((s) => s.tasks.map((t) => ({ ...t, section: s.id })))

/** Audience and payoff tags, as used across the plan. */
export const AUDIENCE = { U: 'Usuaris', A: 'Acadèmic' }
export const PAYOFFS = ['Base', 'Trànsit', 'Autoritat', 'GEO', 'Ocupabilitat']
export const EFFORTS = ['Baix', 'Mitjà', 'Alt']

/**
 * The first step that is not done, in plan order. The panel leads with it:
 * a list of a hundred things is a list nobody starts.
 */
export function nextTask(tasks, status = {}) {
  return tasks.find((t) => taskStatus(t, status) !== 'done') || null
}

/**
 * Why a step is the operator's, or null when the daily routine can take it.
 * task.mine overrides, for a step whose action is a prompt but which still
 * waits on a decision only the operator can record.
 */
export const MINE_REASON = {
  email: "L'envies tu",
  link: 'Compte teu',
  do: 'A mà',
}

export function mineReason(task) {
  return task?.mine || MINE_REASON[task?.action?.type] || null
}

/** How many not-yet-done steps are the operator's, out of how many are left. */
export function minePending(tasks, status = {}) {
  const left = tasks.filter((t) => taskStatus(t, status) !== 'done')
  return { mine: left.filter(mineReason).length, left: left.length }
}

/** Effective state: D1 wins, the plan's own flag is the fallback. */
export function taskStatus(task, status = {}) {
  return status[task.id]?.status ?? (task.done ? 'done' : 'todo')
}
