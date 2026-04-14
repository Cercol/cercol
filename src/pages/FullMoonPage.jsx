/**
 * FullMoonPage — Cèrcol Full Moon: 120-item assessment (IPIP-NEO-120)
 * grouped into 5 blocks of 24, one per domain.
 * Block order: depth, presence, vision, bond, discipline
 *
 * Gate (pre-test):
 *   - Not logged in → redirect to /auth
 *   - Logged in, not premium → paywall screen with Stripe CTA
 *   - ?payment=success → poll profiles.premium until set (up to ~12s)
 *   - Premium confirmed → show test
 *
 * Test states (post-gate):
 *   answering  — showing a question within a block
 *   transition — brief screen between blocks
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FM_ITEMS, FM_SCALE_LABELS } from '../data/full-moon'
import { computeFMScores } from '../utils/full-moon-scoring'
import { useFeedbackContext } from '../context/FeedbackContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { createCheckoutSession } from '../lib/api'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import { Card, Button, SectionLabel } from '../components/ui'
import { colors } from '../design/tokens'
import { FullMoonIcon, ArrowLeftIcon, ArrowRightIcon, DimensionIcon } from '../components/MoonIcons'
import { DOMAIN_BG_CLASSES, DOMAIN_ICON_CLASSES } from '../design/tokens'

const DOMAIN_ORDER = ['depth', 'presence', 'vision', 'bond', 'discipline']

const BLOCKS = DOMAIN_ORDER.map((domain) =>
  FM_ITEMS.filter((item) => item.domain === domain)
)

const ITEMS_PER_BLOCK = 24
const TOTAL_ITEMS = FM_ITEMS.length
const TOTAL_BLOCKS = BLOCKS.length
const SCALE_POINTS = 5

const MAX_POLL_ATTEMPTS = 8
const POLL_INTERVAL_MS  = 1500


export default function FullMoonPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const { setItemContext } = useFeedbackContext()
  const { user, loading: authLoading } = useAuth()

  // ── Gate state ─────────────────────────────────────────────────
  // 'checking'   — waiting for auth + premium check
  // 'paywall'    — logged in, not premium
  // 'processing' — payment=success in URL, polling for premium
  // 'completed'  — premium, but user already has a fullMoon result
  // 'ready'      — premium confirmed, no prior result, show test
  const [gateState,       setGateState]       = useState('checking')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError,   setCheckoutError]   = useState(null)
  const [pollTimedOut,    setPollTimedOut]     = useState(false)
  const pollTimerRef = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/auth')
      return
    }

    let cancelled = false

    async function checkPremium(attempt = 0) {
      const { data } = await supabase
        .from('profiles')
        .select('premium')
        .eq('id', user.id)
        .single()

      if (cancelled) return

      if (data?.premium) {
        // Check if the user already has a Full Moon result
        const { data: existing } = await supabase
          .from('results')
          .select('id')
          .eq('user_id', user.id)
          .eq('instrument', 'fullMoon')
          .limit(1)
        if (cancelled) return
        setGateState(existing?.length ? 'completed' : 'ready')
        return
      }

      const paymentInUrl = searchParams.get('payment') === 'success'
      if (paymentInUrl && attempt < MAX_POLL_ATTEMPTS) {
        setGateState('processing')
        pollTimerRef.current = setTimeout(() => checkPremium(attempt + 1), POLL_INTERVAL_MS)
        return
      }

      if (paymentInUrl && attempt >= MAX_POLL_ATTEMPTS) {
        setPollTimedOut(true)
        setGateState('processing')
        return
      }

      setGateState('paywall')
    }

    checkPremium()
    return () => {
      cancelled = true
      clearTimeout(pollTimerRef.current)
    }
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUnlock() {
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch {
      setCheckoutError(t('fm.paywall.error'))
      setCheckoutLoading(false)
    }
  }

  // ── Test state ─────────────────────────────────────────────────
  const [showIntro,       setShowIntro]       = useState(true)
  const [blockIdx,        setBlockIdx]        = useState(0)
  const [itemInBlockIdx,  setItemInBlockIdx]  = useState(0)
  const [answers,         setAnswers]         = useState({})
  const [showTransition,  setShowTransition]  = useState(false)

  const currentBlock = BLOCKS[blockIdx]
  const item         = currentBlock[itemInBlockIdx]
  const answered     = answers[item?.id] ?? null

  const isLastItemInBlock  = itemInBlockIdx === ITEMS_PER_BLOCK - 1
  const isLastBlock        = blockIdx === TOTAL_BLOCKS - 1
  const isLastItemOverall  = isLastItemInBlock && isLastBlock

  const overallCurrent = blockIdx * ITEMS_PER_BLOCK + itemInBlockIdx + 1
  const domainKey      = DOMAIN_ORDER[blockIdx]
  const nextDomainKey  = DOMAIN_ORDER[blockIdx + 1]

  // Publish item to FeedbackContext (only when test is running)
  useEffect(() => {
    if (gateState !== 'ready') return
    if (showTransition) {
      setItemContext({ itemId: null, itemText: null })
    } else {
      setItemContext({ itemId: item.id, itemText: item.text.en })
    }
    return () => setItemContext({ itemId: null, itemText: null })
  }, [item?.id, showTransition, gateState]) // eslint-disable-line react-hooks/exhaustive-deps

  const scaleLabels = Object.fromEntries(
    Object.entries(FM_SCALE_LABELS).map(([k, fallback]) => {
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
      const { domains, facets } = computeFMScores(updatedAnswers)
      navigate('/full-moon/results', { state: { domains, facets, fromTest: true } })
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

  const handleNextRef               = useRef(handleNext)
  const handleBackRef               = useRef(handleBack)
  const handleContinueToNextBlockRef = useRef(handleContinueToNextBlock)
  handleNextRef.current               = handleNext
  handleBackRef.current               = handleBack
  handleContinueToNextBlockRef.current = handleContinueToNextBlock

  const showIntroRef = useRef(showIntro)
  showIntroRef.current = showIntro

  useEffect(() => {
    function onKeyDown(e) {
      if (gateState !== 'ready') return
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
  }, [item.id, showTransition, gateState])

  // ── Gate screens ───────────────────────────────────────────────
  if (gateState === 'checking') {
    return <main className="min-h-[calc(100vh-4rem)]" />
  }

  if (gateState === 'processing') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md text-center">
          {pollTimedOut ? (
            <>
              <p className="text-gray-700 font-medium mb-2">{t('fm.paywall.processingTimeout')}</p>
              <p className="text-sm text-gray-400">{t('fm.paywall.processingTimeoutNote')}</p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">{t('fm.paywall.processing')}</p>
          )}
        </div>
      </main>
    )
  }

  if (gateState === 'completed') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <Card className="shadow-sm p-8 text-center">
            <FullMoonIcon size={36} className="mb-4 mx-auto" style={{ color: colors.blue }} />
            <h1 className="text-xl font-bold text-gray-900 mb-3">
              {t('fm.alreadyCompleted.heading')}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {t('fm.alreadyCompleted.body')}
            </p>
            <Button variant="primary" onClick={() => navigate('/full-moon/report')} className="w-full">
              {t('fm.alreadyCompleted.cta')}
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  if (gateState === 'paywall') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <Card className="shadow-sm p-8">

            <div className="text-center mb-6">
              <FullMoonIcon size={36} className="mb-3 mx-auto" style={{ color: colors.blue }} />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('fm.paywall.heading')}
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t('fm.paywall.body')}
              </p>
            </div>

            <div className="bg-gray-50 rounded px-4 py-3 mb-6">
              <p className="text-sm font-medium text-gray-700 text-center">
                {t('fm.paywall.includes')}
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleUnlock}
              disabled={checkoutLoading}
              className={`w-full shadow-sm${checkoutLoading ? ' cursor-not-allowed' : ''}`}
            >
              {checkoutLoading ? t('fm.paywall.loading') : t('fm.paywall.cta')}
            </Button>

            {checkoutError && (
              <p className="mt-3 text-sm text-red-500 text-center">{checkoutError}</p>
            )}

            <p className="mt-4 text-xs text-gray-400 text-center">
              {t('fm.paywall.permanentNote')}
            </p>
          </Card>
        </div>
      </main>
    )
  }

  // ── Intro screen ───────────────────────────────────────────────
  if (showIntro) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">
          <div>
            <FullMoonIcon size={40} className="mb-3 mx-auto" style={{ color: colors.blue }} />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('fm.intro.heading')}</h1>
            <p className="text-sm text-gray-400">{t('fm.intro.meta')}</p>
          </div>
          <div className="bg-white rounded border border-gray-200 px-5 py-4 w-full text-left flex flex-col gap-3">
            <div>
              <SectionLabel color="gray" className="mb-1">Scale</SectionLabel>
              <p className="text-sm text-gray-700">{t('fm.intro.scale')}</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {t('fm.intro.guidance')}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
              {t('fm.intro.partNote')}
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowIntro(false)} className="w-full">
            {t('fm.intro.cta')}
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
              {t('fm.transition.blockDone', { name: t(`fmDomains.${domainKey}.name`) })}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">{t('fm.transition.nextUp')}</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-3 h-3 rounded-full ${DOMAIN_BG_CLASSES[nextDomainKey]}`} />
              <h2 className="text-2xl font-bold text-gray-900">
                {t(`fmDomains.${nextDomainKey}.name`)}
              </h2>
            </div>
            <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
              {t(`fmDomains.${nextDomainKey}.blockIntro`)}
            </p>
          </div>

          <Button variant="primary" size="lg" onClick={handleContinueToNextBlock}>
            {t('fm.transition.cta', { name: t(`fmDomains.${nextDomainKey}.name`) })}
          </Button>

          <p className="text-xs text-gray-400">
            {t('fm.overallProgress', { current: overallCurrent, total: TOTAL_ITEMS })}
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
              {t(`fmDomains.${domainKey}.name`)} · {t('fm.blockLabel', { current: blockIdx + 1, total: TOTAL_BLOCKS })}
            </span>
          </div>
          <p className="text-sm text-gray-500 pl-5">
            {t(`fmDomains.${domainKey}.description`)}
          </p>
        </div>

        {/* Block progress bar */}
        <ProgressBar
          current={itemInBlockIdx + 1}
          total={ITEMS_PER_BLOCK}
          label={t('fm.blockProgress', {
            current: itemInBlockIdx + 1,
            total: ITEMS_PER_BLOCK,
          })}
        />

        {/* Overall progress indicator */}
        <p className="text-xs text-gray-400 -mt-3 text-right">
          {t('fm.overallProgress', { current: overallCurrent, total: TOTAL_ITEMS })}
        </p>

        {/* Question */}
        <QuestionCard
          item={item}
          index={itemInBlockIdx + 1}
          value={answered}
          onChange={handleAnswer}
          scalePoints={SCALE_POINTS}
          scaleLabels={scaleLabels}
          prefixKey="fm.itemPrefix"
        />

        {/* Navigation */}
        <div className="flex gap-3">
          {(blockIdx > 0 || itemInBlockIdx > 0) && (
            <Button variant="secondary" size="lg" onClick={handleBack} className="flex-1 sm:flex-none gap-1.5">
              <ArrowLeftIcon size={14} />{t('fm.back')}
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!answered}
            className="flex-1 gap-1.5"
          >
            <ArrowRightIcon size={14} />{isLastItemOverall ? t('fm.seeResults') : t('fm.next')}
          </Button>
        </div>
      </div>
    </main>
  )
}
