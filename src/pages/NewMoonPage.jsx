/**
 * NewMoonPage — New Moon Cèrcol: 10-item quick assessment.
 * Uses the TIPI instrument, Likert 1-7 scale.
 * On completion, navigates to /new-moon/results.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TIPI_ITEMS, SCALE_LABELS } from '../data/new-moon'
import { computeRadarScores } from '../utils/new-moon-scoring'
import { useFeedbackContext } from '../context/FeedbackContext'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import { Button, Card, SectionLabel } from '../components/ui'
import { colors } from '../design/tokens'
import { NewMoonIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/MoonIcons'

const SCALE_POINTS = 7

export default function NewMoonPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setItemContext } = useFeedbackContext()
  const [showIntro, setShowIntro] = useState(true)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)

  const item = TIPI_ITEMS[current]
  const answered = answers[item.id] ?? null
  const isLast = current === TIPI_ITEMS.length - 1

  // Publish current item to FeedbackContext so FeedbackButton can include it
  useEffect(() => {
    setItemContext({ itemId: item.id, itemText: item.text.en })
    return () => setItemContext({ itemId: null, itemText: null })
  }, [item.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Translate scale labels using i18n (scale7 namespace), fall back to English
  const scaleLabels = Object.fromEntries(
    Object.entries(SCALE_LABELS).map(([k, fallback]) => {
      const translated = t(`scale7.${k}`)
      return [k, translated !== `scale7.${k}` ? translated : fallback]
    })
  )

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
  }, [item.id])

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
