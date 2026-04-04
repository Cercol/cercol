/**
 * TestPage — Cèrcol Test: 30-item assessment grouped into 5 blocks of 6.
 * Block order mirrors domain order in cercol-big-five.js:
 *   Presence · Bond · Discipline · Depth · Vision
 *
 * States:
 *   answering  — showing a question within a block
 *   transition — brief screen between blocks
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CBF_ITEMS, DOMAIN_META, SCALE_LABELS } from '../data/cercol-big-five'
import { computeScores } from '../utils/cbf-scoring'
import { useFeedbackContext } from '../context/FeedbackContext'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import LanguageToggle from '../components/LanguageToggle'

// Domain order (mirrors cercol-big-five.js)
const DOMAIN_ORDER = [
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'negativeEmotionality',
  'openMindedness',
]

// Group CBF items into 5 blocks of 6, one per domain
const BLOCKS = DOMAIN_ORDER.map((domain) =>
  CBF_ITEMS.filter((item) => item.domain === domain)
)

const ITEMS_PER_BLOCK = 6
const TOTAL_ITEMS = CBF_ITEMS.length
const TOTAL_BLOCKS = BLOCKS.length
const SCALE_POINTS = 5

// Domain → Tailwind accent color for block header dot
const DOMAIN_ACCENT = {
  extraversion:         'bg-amber-400',
  agreeableness:        'bg-emerald-500',
  conscientiousness:    'bg-blue-600',
  negativeEmotionality: 'bg-red-500',
  openMindedness:       'bg-purple-500',
}

export default function TestPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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

  // Publish current item to FeedbackContext (cleared during transition + on unmount)
  useEffect(() => {
    if (showTransition) {
      setItemContext({ itemId: null, itemText: null })
    } else {
      setItemContext({ itemId: item.id, itemText: item.text.en })
    }
    return () => setItemContext({ itemId: null, itemText: null })
  }, [item?.id, showTransition]) // eslint-disable-line react-hooks/exhaustive-deps

  // Translate scale labels using i18n (scale namespace), fall back to English
  const scaleLabels = Object.fromEntries(
    Object.entries(SCALE_LABELS).map(([k, fallback]) => {
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
      const { domains, facets } = computeScores(updatedAnswers)
      navigate('/results', { state: { domains, facets, fromTest: true } })
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

  // Keep refs to handlers so the keydown effect always calls the latest version
  const handleNextRef = useRef(handleNext)
  const handleBackRef = useRef(handleBack)
  handleNextRef.current = handleNext
  handleBackRef.current = handleBack

  // Keyboard navigation — disabled during transition screens
  useEffect(() => {
    function onKeyDown(e) {
      if (showTransition) return
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

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
          {/* Completed block badge */}
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${DOMAIN_ACCENT[domainKey]}`} />
            <span className="text-sm font-semibold text-gray-500">
              {t('test.transition.blockDone', { name: t(`domains.${domainKey}.label`) })}
            </span>
          </div>

          {/* Next block */}
          <div>
            <p className="text-sm text-gray-400 mb-1">{t('test.transition.nextUp')}</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-3 h-3 rounded-full ${DOMAIN_ACCENT[nextDomainKey]}`} />
              <h2 className="text-2xl font-bold text-gray-900">
                {t(`domains.${nextDomainKey}.label`)}
              </h2>
            </div>
            <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
              {t(`domains.${nextDomainKey}.blockIntro`)}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleContinueToNextBlock}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-sm transition-colors"
          >
            {t('test.transition.cta', { name: t(`domains.${nextDomainKey}.label`) })}
          </button>

          {/* Overall progress */}
          <p className="text-xs text-gray-400">
            {t('test.overallProgress', { current: overallCurrent, total: TOTAL_ITEMS })}
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{t('nav.brand')}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm font-medium text-gray-500">{t('test.subtitle')}</span>
          </div>
          <LanguageToggle />
        </div>

        {/* Block header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOMAIN_ACCENT[domainKey]}`} />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {t(`domains.${domainKey}.label`)} · {t('test.subtitle')} {blockIdx + 1} / {TOTAL_BLOCKS}
            </span>
          </div>
          <p className="text-sm text-gray-500 pl-5">
            {t(`domains.${domainKey}.description`)}
          </p>
        </div>

        {/* Block progress bar */}
        <ProgressBar
          current={itemInBlockIdx + 1}
          total={ITEMS_PER_BLOCK}
          label={t('test.blockProgress', {
            current: itemInBlockIdx + 1,
            total: ITEMS_PER_BLOCK,
          })}
        />

        {/* Overall progress indicator */}
        <p className="text-xs text-gray-400 -mt-3 text-right">
          {t('test.overallProgress', { current: overallCurrent, total: TOTAL_ITEMS })}
        </p>

        {/* Instructions banner — first item only */}
        {isFirstItemOfFirstBlock && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
            {t('test.instructions')}
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
        />

        {/* Navigation */}
        <div className="flex gap-3">
          {(blockIdx > 0 || itemInBlockIdx > 0) && (
            <button
              onClick={handleBack}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              {t('test.back')}
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
            {isLastItemOverall ? t('test.seeResults') : t('test.next')}
          </button>
        </div>
      </div>
    </main>
  )
}
