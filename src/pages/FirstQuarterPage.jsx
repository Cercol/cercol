/**
 * FirstQuarterPage — Cèrcol First Quarter: 60-item assessment (IPIP-NEO-60)
 * grouped into 5 blocks of 12, one per domain.
 * Block order: depth, presence, vision, bond, discipline
 *
 * Gate (pre-test, logged-in users only):
 *   'checking'  — fetching existing results
 *   'completed' — user already has a firstQuarter result → offer View / Redo
 *   'ready'     — no existing result, show test normally
 *
 * Test states:
 *   answering  — showing a question within a block
 *   transition — brief screen between blocks
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FQ_ITEMS, FQ_SCALE_LABELS } from '../data/first-quarter'
import { useScaleLabels } from '../hooks/useScaleLabels'
import { useInstrumentKeyboard } from '../hooks/useInstrumentKeyboard'
import { INSTRUMENT_DOMAIN_ORDER } from '../data/domains'
import { computeFQScores } from '../utils/first-quarter-scoring'
import { useFeedbackContext } from '../context/FeedbackContext'
import { useAuth } from '../context/AuthContext'
import { getMyResults, anonymiseResult } from '../lib/api'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import { Button, Card, SectionLabel } from '../components/ui'
import { colors, DOMAIN_BG_CLASSES, DOMAIN_ICON_CLASSES } from '../design/tokens'
import { FirstQuarterIcon, ArrowLeftIcon, ArrowRightIcon, DimensionIcon } from '../components/MoonIcons'

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

const DOMAIN_ORDER = INSTRUMENT_DOMAIN_ORDER

const BLOCKS = DOMAIN_ORDER.map((domain) =>
  FQ_ITEMS.filter((item) => item.domain === domain)
)

const ITEMS_PER_BLOCK = 12
const TOTAL_ITEMS = FQ_ITEMS.length
const TOTAL_BLOCKS = BLOCKS.length
const SCALE_POINTS = 5


export default function FirstQuarterPage() {
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
        const existing = results.find(r => r.instrument === 'firstQuarter')
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
  const [blockIdx, setBlockIdx] = useState(0)
  const [itemInBlockIdx, setItemInBlockIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showTransition, setShowTransition] = useState(false)

  const currentBlock = BLOCKS[blockIdx]
  const item = currentBlock[itemInBlockIdx]
  const answered = answers[item?.id] ?? null

  const isLastItemInBlock = itemInBlockIdx === ITEMS_PER_BLOCK - 1
  const isLastBlock = blockIdx === TOTAL_BLOCKS - 1
  const isLastItemOverall = isLastItemInBlock && isLastBlock

  const overallCurrent = blockIdx * ITEMS_PER_BLOCK + itemInBlockIdx + 1
  const domainKey = DOMAIN_ORDER[blockIdx]
  const nextDomainKey = DOMAIN_ORDER[blockIdx + 1]

  // Publish current item to FeedbackContext
  useEffect(() => {
    if (gateState !== 'ready') return
    if (showTransition) {
      setItemContext({ itemId: null, itemText: null })
    } else {
      setItemContext({ itemId: item.id, itemText: item.text.en })
    }
    return () => setItemContext({ itemId: null, itemText: null })
  }, [item?.id, showTransition, gateState]) // eslint-disable-line react-hooks/exhaustive-deps

  const scaleLabels = useScaleLabels('scale', FQ_SCALE_LABELS)

  function handleAnswer(value) {
    setAnswers((prev) => ({ ...prev, [item.id]: value }))
  }

  function handleNext() {
    if (!answered) return
    const updatedAnswers = { ...answers, [item.id]: answered }

    if (isLastItemOverall) {
      const { domains, facets } = computeFQScores(updatedAnswers)
      navigate('/first-quarter/results', { state: { domains, facets, fromTest: true } })
      return
    }

    if (isLastItemInBlock) {
      setAnswers(updatedAnswers)
      setShowTransition(true)
    } else {
      setItemInBlockIdx((i) => i + 1)
    }
  }

  function handleBack() {
    if (itemInBlockIdx > 0) {
      setItemInBlockIdx((i) => i - 1)
    } else if (blockIdx > 0) {
      setShowTransition(false)
      setBlockIdx((b) => b - 1)
      setItemInBlockIdx(ITEMS_PER_BLOCK - 1)
    }
  }

  function handleContinueToNextBlock() {
    setShowTransition(false)
    setBlockIdx((b) => b + 1)
    setItemInBlockIdx(0)
  }

  const handleNextRef = useRef(handleNext)
  const handleBackRef = useRef(handleBack)
  const handleContinueToNextBlockRef = useRef(handleContinueToNextBlock)
  handleNextRef.current = handleNext
  handleBackRef.current = handleBack
  handleContinueToNextBlockRef.current = handleContinueToNextBlock

  const showIntroRef = useRef(showIntro)
  showIntroRef.current = showIntro

  const showTransitionRef = useRef(showTransition)
  showTransitionRef.current = showTransition

  useInstrumentKeyboard({
    itemId:              item.id,
    scalePoints:         SCALE_POINTS,
    showIntroRef,
    showTransitionRef,
    enabled:             gateState === 'ready',
    onNumber:            (n) => setAnswers((prev) => ({ ...prev, [item.id]: n })),
    onNextRef:           handleNextRef,
    onBackRef:           handleBackRef,
    onDismissIntro:      () => setShowIntro(false),
    onContinueBlockRef:  handleContinueToNextBlockRef,
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
            <FirstQuarterIcon size={36} className="mb-4 mx-auto" style={{ color: colors.green }} />
            <h1 className="text-xl font-bold text-gray-900 mb-3">
              {t('fq.alreadyCompleted.heading')}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {t('fq.alreadyCompleted.body')}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/first-quarter/results', {
                  state: {
                    domains: {
                      presence:   existingResult.presence,
                      bond:       existingResult.bond,
                      discipline: existingResult.discipline,
                      depth:      existingResult.depth,
                      vision:     existingResult.vision,
                    },
                    facets:   existingResult.facets ?? null,
                    fromTest: false,
                  }
                })}
              >
                {t('fq.alreadyCompleted.cta')}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => { setRedoConfirming(true); setRedoError(false) }}
              >
                {t('fq.alreadyCompleted.redo')}
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
            <FirstQuarterIcon size={40} className="mb-3 mx-auto" style={{ color: colors.green }} />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('fq.intro.heading')}</h1>
            <p className="text-sm text-gray-400">{t('fq.intro.meta')}</p>
          </div>
          <div className="bg-white rounded border border-gray-200 px-5 py-4 w-full text-left flex flex-col gap-3">
            <div>
              <SectionLabel color="gray" className="mb-1">Scale</SectionLabel>
              <p className="text-sm text-gray-700">{t('fq.intro.scale')}</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {t('fq.intro.guidance')}
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowIntro(false)} className="w-full">
            {t('fq.intro.cta')}
          </Button>
        </div>
      </main>
    )
  }

  // ── Transition screen ──────────────────────────────────────────
  if (showTransition) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-xl flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${DOMAIN_BG_CLASSES[domainKey]}`} />
            <span className="text-sm font-semibold text-gray-500">
              {t('fq.transition.blockDone', { name: t(`fqDomains.${domainKey}.name`) })}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">{t('fq.transition.nextUp')}</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-3 h-3 rounded-full ${DOMAIN_BG_CLASSES[nextDomainKey]}`} />
              <h2 className="text-2xl font-bold text-gray-900">
                {t(`fqDomains.${nextDomainKey}.name`)}
              </h2>
            </div>
            <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
              {t(`fqDomains.${nextDomainKey}.blockIntro`)}
            </p>
          </div>

          <Button variant="primary" size="lg" onClick={handleContinueToNextBlock}>
            {t('fq.transition.cta', { name: t(`fqDomains.${nextDomainKey}.name`) })}
          </Button>

          <p className="text-xs text-gray-400">
            {t('fq.overallProgress', { current: overallCurrent, total: TOTAL_ITEMS })}
          </p>
        </div>
      </main>
    )
  }

  // ── Answering screen ───────────────────────────────────────────
  return (
    <main className="flex flex-col items-center py-10 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Block header */}
        <div className="bg-white rounded border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2 mb-0.5">
            <DimensionIcon domain={domainKey} size={16} className={`shrink-0 ${DOMAIN_ICON_CLASSES[domainKey]}`} />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {t(`fqDomains.${domainKey}.name`)} · {t('fq.blockLabel', { current: blockIdx + 1, total: TOTAL_BLOCKS })}
            </span>
          </div>
          <p className="text-sm text-gray-500 pl-5">
            {t(`fqDomains.${domainKey}.description`)}
          </p>
        </div>

        {/* Block progress bar */}
        <ProgressBar
          current={itemInBlockIdx + 1}
          total={ITEMS_PER_BLOCK}
          label={t('fq.blockProgress', {
            current: itemInBlockIdx + 1,
            total: ITEMS_PER_BLOCK,
          })}
        />

        {/* Overall progress indicator */}
        <p className="text-xs text-gray-400 -mt-3 text-right">
          {t('fq.overallProgress', { current: overallCurrent, total: TOTAL_ITEMS })}
        </p>

        {/* Question */}
        <QuestionCard
          item={item}
          index={itemInBlockIdx + 1}
          value={answered}
          onChange={handleAnswer}
          scalePoints={SCALE_POINTS}
          scaleLabels={scaleLabels}
          prefixKey="fq.itemPrefix"
        />

        {/* Navigation */}
        <div className="flex gap-3">
          {(blockIdx > 0 || itemInBlockIdx > 0) && (
            <Button variant="secondary" size="lg" onClick={handleBack} className="flex-1 sm:flex-none gap-1.5">
              <ArrowLeftIcon size={14} />{t('fq.back')}
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!answered}
            className="flex-1 gap-1.5"
          >
            <ArrowRightIcon size={14} />{isLastItemOverall ? t('fq.seeResults') : t('fq.next')}
          </Button>
        </div>
      </div>
    </main>
  )
}
