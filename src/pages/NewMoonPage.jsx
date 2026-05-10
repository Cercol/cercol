/**
 * NewMoonPage — New Moon Cèrcol: 10-item quick assessment.
 * Uses the TIPI instrument, Likert 1-7 scale.
 * On completion, navigates to /new-moon/results.
 *
 * Gate (pre-test, logged-in users only):
 *   'checking'  — fetching existing results
 *   'completed' — user already has a newMoon result → offer View / Redo
 *   'ready'     — no existing result, show test normally
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TIPI_ITEMS, SCALE_LABELS } from '../data/new-moon'
import { useScaleLabels } from '../hooks/useScaleLabels'
import { useInstrumentKeyboard } from '../hooks/useInstrumentKeyboard'
import { computeRadarScores } from '../utils/new-moon-scoring'
import { useFeedbackContext } from '../context/FeedbackContext'
import { useAuth } from '../context/AuthContext'
import { getMyResults, anonymiseResult } from '../lib/api'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import { Button, Card, SectionLabel } from '../components/ui'
import { colors } from '../design/tokens'
import { NewMoonIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/MoonIcons'

const SCALE_POINTS = 7

/** Redo confirmation modal — warns user their previous result will be anonymised */
function RedoConfirmModal({ t, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          {t('myResults.redoConfirm.title')}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {t('myResults.redoConfirm.body')}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {t('myResults.redoConfirm.cancel')}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? '…' : t('myResults.redoConfirm.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NewMoonPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setItemContext } = useFeedbackContext()
  const { user, loading: authLoading } = useAuth()

  // ── Gate state ─────────────────────────────────────────────────
  const [gateState,       setGateState]       = useState('checking')
  const [existingResult,  setExistingResult]  = useState(null)
  const [redoConfirming,  setRedoConfirming]  = useState(false)
  const [redoLoading,     setRedoLoading]     = useState(false)
  const [redoError,       setRedoError]       = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setGateState('ready'); return }

    getMyResults()
      .then(results => {
        const existing = results.find(r => r.instrument === 'newMoon')
        if (existing) {
          setExistingResult(existing)
          setGateState('completed')
        } else {
          setGateState('ready')
        }
      })
      .catch(() => setGateState('ready'))
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRedo() {
    if (!existingResult) return
    setRedoLoading(true)
    setRedoError(false)
    try {
      await anonymiseResult(existingResult.id)
      setRedoConfirming(false)
      setExistingResult(null)
      setGateState('ready')
    } catch {
      setRedoError(true)
    } finally {
      setRedoLoading(false)
    }
  }

  // ── Test state ─────────────────────────────────────────────────
  const [showIntro, setShowIntro] = useState(true)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)

  const item = TIPI_ITEMS[current]
  const answered = answers[item.id] ?? null
  const isLast = current === TIPI_ITEMS.length - 1

  // Publish current item to FeedbackContext so FeedbackButton can include it
  useEffect(() => {
    if (gateState !== 'ready') return
    setItemContext({ itemId: item.id, itemText: item.text.en })
    return () => setItemContext({ itemId: null, itemText: null })
  }, [item.id, gateState]) // eslint-disable-line react-hooks/exhaustive-deps

  // Translate scale labels using i18n (scale7 namespace), fall back to English
  const scaleLabels = useScaleLabels('scale7', SCALE_LABELS)

  function handleAnswer(value) {
    setAnswers((prev) => ({ ...prev, [item.id]: value }))
  }

  function handleNext() {
    if (!answered) return
    const updatedAnswers = { ...answers, [item.id]: answered }
    if (isLast) {
      const scores = computeRadarScores(updatedAnswers)
      navigate('/new-moon/results', { state: { scores, fromTest: true } })
    } else {
      setCurrent((i) => i + 1)
    }
  }

  function handleBack() {
    if (current > 0) setCurrent((i) => i - 1)
  }

  const handleNextRef = useRef(handleNext)
  const handleBackRef = useRef(handleBack)
  handleNextRef.current = handleNext
  handleBackRef.current = handleBack

  const showIntroRef = useRef(showIntro)
  showIntroRef.current = showIntro

  useInstrumentKeyboard({
    itemId:         item.id,
    scalePoints:    SCALE_POINTS,
    showIntroRef,
    enabled:        gateState === 'ready',
    onNumber:       (n) => setAnswers((prev) => ({ ...prev, [item.id]: n })),
    onNextRef:      handleNextRef,
    onBackRef:      handleBackRef,
    onDismissIntro: () => setShowIntro(false),
  })

  // ── Gate screens ───────────────────────────────────────────────
  if (gateState === 'checking') {
    return <main className="min-h-[calc(100vh-4rem)]" />
  }

  if (gateState === 'completed') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <Card className="shadow-sm p-8 text-center">
            <NewMoonIcon size={36} className="mb-4 mx-auto" style={{ color: colors.red }} />
            <h1 className="text-xl font-bold text-gray-900 mb-3">
              {t('newMoon.alreadyCompleted.heading')}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {t('newMoon.alreadyCompleted.body')}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/new-moon/results', {
                  state: {
                    scores: {
                      presence:   existingResult.presence,
                      bond:       existingResult.bond,
                      discipline: existingResult.discipline,
                      depth:      existingResult.depth,
                      vision:     existingResult.vision,
                    },
                    fromTest: false,
                  }
                })}
              >
                {t('newMoon.alreadyCompleted.cta')}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => { setRedoConfirming(true); setRedoError(false) }}
              >
                {t('newMoon.alreadyCompleted.redo')}
              </Button>
            </div>
            {redoError && (
              <p className="mt-3 text-xs text-red-500">{t('myResults.deleteError')}</p>
            )}
          </Card>
        </div>

        {redoConfirming && (
          <RedoConfirmModal
            t={t}
            onConfirm={handleRedo}
            onCancel={() => setRedoConfirming(false)}
            loading={redoLoading}
          />
        )}
      </main>
    )
  }

  // ── Intro screen ───────────────────────────────────────────────
  if (showIntro) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">
          <div>
            <NewMoonIcon size={40} className="mb-3 mx-auto" style={{ color: colors.red }} />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('newMoon.intro.heading')}</h1>
            <p className="text-sm text-gray-400">{t('newMoon.intro.meta')}</p>
          </div>
          <div className="bg-white rounded border border-gray-200 px-5 py-4 w-full text-left flex flex-col gap-3">
            <div>
              <SectionLabel color="gray" className="mb-1">Scale</SectionLabel>
              <p className="text-sm text-gray-700">{t('newMoon.intro.scale')}</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {t('newMoon.intro.guidance')}
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowIntro(false)} className="w-full">
            {t('newMoon.intro.cta')}
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center py-10 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Progress */}
        <ProgressBar
          current={current + 1}
          total={TIPI_ITEMS.length}
          label={t('newMoon.progress', { current: current + 1, total: TIPI_ITEMS.length })}
        />

        {/* Question */}
        <QuestionCard
          item={item}
          index={current + 1}
          value={answered}
          onChange={handleAnswer}
          scalePoints={SCALE_POINTS}
          scaleLabels={scaleLabels}
          prefixKey="newMoon.itemPrefix"
        />

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <Button variant="secondary" size="lg" onClick={handleBack} className="flex-1 sm:flex-none gap-1.5">
              <ArrowLeftIcon size={14} />{t('newMoon.back')}
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!answered}
            className="flex-1 gap-1.5"
          >
            <ArrowRightIcon size={14} />{isLast ? t('newMoon.seeResults') : t('newMoon.next')}
          </Button>
        </div>
      </div>
    </main>
  )
}
