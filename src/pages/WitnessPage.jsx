/**
 * WitnessPage — public forced-choice adjective instrument for Witness Cèrcol.
 * Accessible at /witness/:token — no auth required.
 *
 * Phases:
 *   loading    — fetching session info
 *   notFound   — token unknown (404)
 *   done       — session already submitted
 *   intro      — show context, subject name (read-only), witness name (editable), CTA
 *   instrument — 20 rounds of forced-choice (5 adjectives, pick best + worst)
 *   submitting — sending scores to API
 *   complete   — thank-you screen
 *   error      — network or API failure
 *
 * Scoring: all client-side, domain scores sent to API on completion.
 * Never called "observer" anywhere — always "Witness".
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getWitnessSession, completeWitnessSession } from '../lib/api'
import { buildRounds, computeWitnessScores } from '../utils/witness-scoring'
import { Card, Button, SectionLabel } from '../components/ui'

const TOTAL_ROUNDS = 20

/**
 * AdjCard — one selectable adjective in a round.
 * Shows a (i) tooltip button with an explanatory phrase on hover/focus.
 */
function AdjCard({ adj, state, lang, onSelect }) {
  const { t } = useTranslation()

  const base = 'flex-1 text-left rounded border px-4 py-3 transition-all cursor-pointer text-sm font-medium'
  let styles = 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
  if (state === 'best')  styles = 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm'
  if (state === 'worst') styles = 'border-red-300 bg-red-50 text-red-800 shadow-sm'

  const tipText = lang === 'ca' ? adj.tip?.ca : adj.tip?.en

  return (
    <div className="flex items-center gap-2">
      <button className={`${base} ${styles}`} onClick={() => onSelect(adj.id)}>
        {lang === 'ca' ? adj.ca : adj.en}
      </button>

      {tipText && (
        <div className="group relative flex-shrink-0">
          {/* (i) trigger button */}
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            aria-label={t('witness.page.tooltipLabel')}
            className="w-5 h-5 rounded-full text-xs font-bold text-gray-400 hover:text-gray-600 border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors select-none"
          >
            i
          </button>

          {/* Tooltip bubble — shown on hover or keyboard focus within the group */}
          <div
            role="tooltip"
            className="absolute right-0 bottom-full mb-2 w-52 bg-gray-900 text-white text-xs rounded px-3 py-2 leading-relaxed z-20 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
          >
            {tipText}
            {/* Arrow pointing down */}
            <span className="absolute right-2.5 top-full border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

export default function WitnessPage() {
  const { token }    = useParams()
  const navigate     = useNavigate()
  const { t, i18n } = useTranslation()
  const lang         = i18n.language

  const [phase,          setPhase]          = useState('loading')
  const [subjectDisplay, setSubjectDisplay] = useState('')   // read-only: who they are describing
  const [witnessName,    setWitnessName]    = useState('')   // editable: the witness's own name
  const [rounds,         setRounds]         = useState([])
  const [currentRound,   setCurrentRound]   = useState(0)

  // Load session on mount
  useEffect(() => {
    getWitnessSession(token)
      .then(({ subject_display, witness_name, completed }) => {
        setSubjectDisplay(subject_display || '')
        setWitnessName(witness_name || '')
        if (completed) {
          setPhase('done')
        } else {
          setPhase('intro')
        }
      })
      .catch((err) => {
        if (err.message?.includes('404')) {
          setPhase('notFound')
        } else {
          setPhase('error')
        }
      })
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStart() {
    const generated = buildRounds(TOTAL_ROUNDS)
    setRounds(generated)
    setCurrentRound(0)
    setPhase('instrument')
  }

  function handleSelect(adjId) {
    setRounds(prev => {
      const updated = [...prev]
      const r = { ...updated[currentRound] }

      if (r.best === adjId) {
        r.best = null
      } else if (r.worst === adjId) {
        r.worst = null
      } else if (r.best === null) {
        r.best = adjId
      } else if (r.worst === null) {
        if (r.best !== adjId) r.worst = adjId
      } else {
        if (r.best !== adjId) r.worst = adjId
      }

      updated[currentRound] = r
      return updated
    })
  }

  function getAdjState(adjId) {
    const r = rounds[currentRound]
    if (!r) return null
    if (r.best === adjId)  return 'best'
    if (r.worst === adjId) return 'worst'
    return null
  }

  function canAdvance() {
    const r = rounds[currentRound]
    return r?.best !== null && r?.worst !== null
  }

  async function handleNext() {
    if (!canAdvance()) return

    if (currentRound < TOTAL_ROUNDS - 1) {
      setCurrentRound(r => r + 1)
      return
    }

    // Last round — compute scores and submit
    setPhase('submitting')

    try {
      const scores = computeWitnessScores(rounds)
      await completeWitnessSession(token, scores)
      setPhase('complete')
    } catch {
      setPhase('error')
    }
  }

  function handleBack() {
    if (currentRound > 0) setCurrentRound(r => r - 1)
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-gray-400">{t('witness.page.loading')}</p>
      </main>
    )
  }

  if (phase === 'notFound') {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('witness.page.notFound.heading')}</h1>
          <p className="text-sm text-gray-500">{t('witness.page.notFound.body')}</p>
        </div>
      </main>
    )
  }

  if (phase === 'done' || phase === 'complete') {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('witness.page.done.heading')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('witness.page.done.body')}</p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-800 underline transition-colors"
          >
            {t('witness.page.done.return')}
          </button>
        </div>
      </main>
    )
  }

  if (phase === 'error') {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('witness.page.errorHeading')}</h1>
          <p className="text-sm text-gray-500">{t('witness.page.errorBody')}</p>
        </div>
      </main>
    )
  }

  if (phase === 'submitting') {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-gray-400">{t('witness.page.submitting')}</p>
      </main>
    )
  }

  if (phase === 'intro') {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-sm shadow-sm p-7 flex flex-col gap-5">
          <div>
            <SectionLabel color="blue" className="mb-3">
              Witness Cèrcol
            </SectionLabel>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {t('witness.page.intro.heading')}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('witness.page.intro.body')}
            </p>
          </div>

          {/* Subject — read-only */}
          <div className="bg-gray-50 rounded px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">{t('witness.page.intro.subjectLabel')}</p>
            <p className="text-base font-semibold text-gray-900">
              {subjectDisplay || '—'}
            </p>
          </div>

          {/* Witness name — editable */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="witness-name-input" className="text-xs text-gray-400">
              {t('witness.page.intro.youAreLabel')}
            </label>
            <input
              id="witness-name-input"
              type="text"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-300 focus:border-[#0047ba] focus:outline-none transition-colors"
              placeholder={t('witness.page.intro.youArePlaceholder')}
            />
          </div>

          <Button variant="primary" onClick={handleStart} className="w-full shadow-sm">
            {t('witness.page.intro.cta')}
          </Button>
        </Card>
      </main>
    )
  }

  // ── Instrument ─────────────────────────────────────────────────────────
  const round    = rounds[currentRound]
  const progress = Math.round(((currentRound + 1) / TOTAL_ROUNDS) * 100)
  const isLastRound = currentRound === TOTAL_ROUNDS - 1

  return (
    <main className="px-4 py-10">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400">
              {t('witness.page.progress', { current: currentRound + 1, total: TOTAL_ROUNDS })}
            </p>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0047ba] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Instruction — uses subject's name, not the witness's */}
        <div>
          <p className="text-base font-semibold text-gray-900 mb-1">
            {t('witness.page.instruction', { name: subjectDisplay })}
          </p>
          <p className="text-xs text-gray-400">{t('witness.page.instructionSub')}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            {t('witness.page.bestLabel')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            {t('witness.page.worstLabel')}
          </span>
        </div>

        {/* Adjective cards */}
        <div className="flex flex-col gap-2">
          {round.adjectives.map((adj) => (
            <AdjCard
              key={adj.id}
              adj={adj}
              state={getAdjState(adj.id)}
              lang={lang}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Note if not yet selected */}
        {!canAdvance() && (
          <p className="text-xs text-center text-gray-400">{t('witness.page.selectBothNote')}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {currentRound > 0 && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              {t('witness.page.back')}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex-1 shadow-sm"
          >
            {isLastRound ? t('witness.page.finish') : t('witness.page.next')}
          </Button>
        </div>

      </div>
    </main>
  )
}
