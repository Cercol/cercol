/**
 * SaveResultCard — shown on a results page when the taker has no account.
 *
 * The anonymous-to-account bridge (plan step tg13): the result on screen was
 * just logged with no owner, and this card is the only place that says what
 * an account gives (keep the result, invite Witnesses, join groups) at the
 * moment the taker is most invested. The click books its own event name so
 * the offer's pull is countable; the actual adoption of the result happens
 * after sign-in, in AuthContext via claimMyResults.
 *
 * Renders nothing while the session is still resolving or when a user is
 * already signed in (their result was linked at logging time).
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, Button, SectionLabel } from './ui'
import { UserIcon } from './MoonIcons'
import { trackEvent } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function SaveResultCard({ instrument }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  if (loading || user) return null

  function handleSave() {
    trackEvent('save_result_cta', { instrument })
    navigate('/auth')
  }

  return (
    <Card accent="blue" className="p-5">
      <div className="flex items-start gap-3">
        <UserIcon
          size={22}
          className="text-[var(--mm-color-blue)] shrink-0 mt-0.5"
        />
        <div className="flex-1">
          <SectionLabel color="blue" className="mb-1">
            {t('saveResult.label')}
          </SectionLabel>
          <h3 className="font-bold text-gray-900 mb-1">
            {t('saveResult.heading')}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {t('saveResult.body')}
          </p>
          <Button
            variant="primary"
            onClick={handleSave}
            className="shadow-sm"
          >
            {t('saveResult.cta')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
