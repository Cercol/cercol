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
import { INSTRUMENT_DOMAIN_ORDER } from '../data/domains'
import { computeFQScores } from '../utils/first-quarter-scoring'
import { useFeedbackContext } from '../context/FeedbackContext'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import { Button, SectionLabel } from '../components/ui'
import { colors, DOMAIN_BG_CLASSES, DOMAIN_ICON_CLASSES } from '../design/tokens'
import { FirstQuarterIcon, ArrowLeftIcon, ArrowRightIcon, DimensionIcon } from '../components/MoonIcons'

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
  const { t, i18n } = useTranslation()
  const { setItemContext } = useFeedbackContext()

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

  const showIntroRef = useRef(showIntro)
  showIntroRef.current = showIntro

  useEffect(() => {
    function onKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

      if (showIntroRef.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setShowIntro(false)
        }
        return
      }

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
