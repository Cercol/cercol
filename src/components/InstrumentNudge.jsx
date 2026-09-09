/**
 * InstrumentNudge — CTA card shown after completing an instrument,
 * pointing the user to the next logical one in the sequence.
 *
 * Props:
 *   target  — 'firstQuarter' | 'fullMoon'
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, Button, SectionLabel } from './ui'
import { FirstQuarterIcon, FullMoonIcon } from './MoonIcons'
import { trackEvent } from '../lib/api'

const CONFIG = {
  firstQuarter: {
    Icon:  FirstQuarterIcon,
    route: '/first-quarter',
  },
  fullMoon: {
    Icon:  FullMoonIcon,
    route: '/full-moon',
    // The witness funnel's entry point (witness_cta is its exit): a solo
    // finisher clicking through to the instrument that adds Witnesses.
    event: 'witness_invite_cta',
  },
}

export default function InstrumentNudge({ target }) {
  const { t }    = useTranslation()
  const navigate = useNavigate()
  const { Icon, route, event } = CONFIG[target]

  function handleClick() {
    if (event) trackEvent(event, { path: window.location.pathname })
    navigate(route)
  }

  return (
    <Card accent="blue" className="p-5">
      <div className="flex items-start gap-3">
        <Icon
          size={22}
          className="text-[var(--mm-color-blue)] shrink-0 mt-0.5"
        />
        <div className="flex-1">
          <SectionLabel color="blue" className="mb-1">
            {t('nudge.nextUp')}
          </SectionLabel>
          <h3 className="font-bold text-gray-900 mb-1">
            {t(`nudge.${target}.heading`)}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {t(`nudge.${target}.body`)}
          </p>
          <Button
            variant="primary"
            onClick={handleClick}
            className="shadow-sm"
          >
            {t(`nudge.${target}.cta`)}
          </Button>
        </div>
      </div>
    </Card>
  )
}
