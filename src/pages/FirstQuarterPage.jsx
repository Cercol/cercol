/**
 * FirstQuarterPage — Cèrcol First Quarter: 60-item assessment (IPIP-NEO-60)
 * grouped into 5 blocks of 12, one per domain.
 * Block order: depth, presence, vision, bond, discipline
 *
 * States:
 *   answering  — showing a question within a block
 *   transition — brief screen between blocks
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FQ_ITEMS, FQ_SCALE_LABELS } from '../data/first-quarter'
import { computeFQScores } from '../utils/first-quarter-scoring'
import { useFeedbackContext } from '../context/FeedbackContext'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'

const DOMAIN_ORDER = ['depth', 'presence', 'vision', 'bond', 'discipline']

const BLOCKS = DOMAIN_ORDER.map((domain) =>
  FQ_ITEMS.filter((item) => item.domain === domain)
)

const ITEMS_PER_BLOCK = 12
const TOTAL_ITEMS = FQ_ITEMS.length
const TOTAL_BLOCKS = BLOCKS.length
const SCALE_POINTS = 5

const DOMAIN_ACCENT = {
  depth:      'bg-red-500',
  presence:   'bg-amber-400',
  vision:     'bg-purple-500',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
}

export default function FirstQuarterPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { setItemContext } = useFeedbackContext()

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
    if (showTransition) {
      setItemContext({ itemId: null, itemText: null })
    } else {
      setItemContext({ itemId: item.id, itemText: item.text.en })
    }
    return () => setItemContext({ itemId: null, itemText: null })
  }, [item?.id, showTransition]) // eslint-disable-line react-hooks/exhaustive-deps

  const scaleLabels = Object.fromEntries(
    Object.entries(FQ_SCALE_LABELS).map(([k, fallback]) => {
      const translated = t(`scale.${k}`)
      return [k, translated !== `scale.${k}` ? translated : fallback]
    })
  )

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

  useEffect(() => {
    function onKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

      if (showTransition) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleContinueToNextBlockRef.current()
        }
        return
      }

      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= SCALE_POINTS) {
        setAnswers((prev) => ({ ...prev, [item.id]: n }))
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleNextRef.current()
        return
      }
      if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        handleBackRef.current()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [item.id, showTransition])

  // ── Transition screen ──────────────────────────────────────────
  if (showTransition) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${DOMAIN_ACCENT[domainKey]}`} />
            <span className="text-sm font-semibold text-gray-500">
              {t('fq.transition.blockDone', { name: t(`fqDomains.${domainKey}.name`) })}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">{t('fq.transition.nextUp')}</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-3 h-3 rounded-full ${DOMAIN_ACCENT[nextDomainKey]}`} />
              <h2 className="text-2xl font-bold text-gray-900">
                {t(`fqDomains.${nextDomainKey}.name`)}
              </h2>
            </div>
            <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
              {t(`fqDomains.${nextDomainKey}.blockIntro`)}
            </p>
          </div>

          <button
            onClick={handleContinueToNextBlock}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-sm transition-colors"
          >
            {t('fq.transition.cta', { name: t(`fqDomains.${nextDomainKey}.name`) })}
          </button>

          <p className="text-xs text-gray-400">
            {t('fq.overallProgress', { current: overallCurrent, total: TOTAL_ITEMS })}
          </p>
        </div>
      </main>
    )
  }

  // ── Answering screen ───────────────────────────────────────────
  const isFirstItemOfFirstBlock = blockIdx === 0 && itemInBlockIdx === 0

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Block header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOMAIN_ACCENT[domainKey]}`} />
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

        {/* Instructions banner — first item only */}
        {isFirstItemOfFirstBlock && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
            {t('fq.instructions')}
          </div>
        )}

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
            <button
              onClick={handleBack}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              {t('fq.back')}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answered}
            className={[
              'flex-1 py-3 rounded-xl font-semibold text-white transition-colors',
              answered
                ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            {isLastItemOverall ? t('fq.seeResults') : t('fq.next')}
          </button>
        </div>
      </div>
    </main>
  )
}
