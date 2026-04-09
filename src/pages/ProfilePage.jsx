/**
 * ProfilePage — first-time setup and ongoing editing of the user's profile.
 * Requires authentication. Reads/writes public.profiles via the anon client.
 * RLS policies (001_profiles.sql) allow each user to SELECT/UPDATE their own row.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Card, Button, SectionLabel } from '../components/ui'

// ── Country list (~55 entries, ISO 3166-1 alpha-2 codes) ─────────────────────
const COUNTRIES = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'CA', name: 'Canada' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KR', name: 'South Korea' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MA', name: 'Morocco' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TR', name: 'Turkey' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VN', name: 'Vietnam' },
]

// ── Language list (~38 entries) ───────────────────────────────────────────────
const LANGUAGES = [
  { code: 'ar',    name: 'Arabic' },
  { code: 'bn',    name: 'Bengali' },
  { code: 'bg',    name: 'Bulgarian' },
  { code: 'ca',    name: 'Catalan' },
  { code: 'zh-cn', name: 'Chinese (Mandarin)' },
  { code: 'zh-yue',name: 'Chinese (Cantonese)' },
  { code: 'hr',    name: 'Croatian' },
  { code: 'cs',    name: 'Czech' },
  { code: 'da',    name: 'Danish' },
  { code: 'nl',    name: 'Dutch' },
  { code: 'en',    name: 'English' },
  { code: 'fi',    name: 'Finnish' },
  { code: 'fr',    name: 'French' },
  { code: 'de',    name: 'German' },
  { code: 'el',    name: 'Greek' },
  { code: 'hi',    name: 'Hindi' },
  { code: 'hu',    name: 'Hungarian' },
  { code: 'id',    name: 'Indonesian' },
  { code: 'it',    name: 'Italian' },
  { code: 'ja',    name: 'Japanese' },
  { code: 'ko',    name: 'Korean' },
  { code: 'ms',    name: 'Malay' },
  { code: 'no',    name: 'Norwegian' },
  { code: 'fa',    name: 'Persian' },
  { code: 'pl',    name: 'Polish' },
  { code: 'pt-br', name: 'Portuguese (Brazil)' },
  { code: 'pt',    name: 'Portuguese (European)' },
  { code: 'ro',    name: 'Romanian' },
  { code: 'ru',    name: 'Russian' },
  { code: 'sr',    name: 'Serbian' },
  { code: 'sk',    name: 'Slovak' },
  { code: 'es',    name: 'Spanish' },
  { code: 'sw',    name: 'Swahili' },
  { code: 'sv',    name: 'Swedish' },
  { code: 'th',    name: 'Thai' },
  { code: 'tr',    name: 'Turkish' },
  { code: 'uk',    name: 'Ukrainian' },
  { code: 'ur',    name: 'Urdu' },
  { code: 'val',   name: 'Valencian' },
  { code: 'vi',    name: 'Vietnamese' },
]

const INPUT_CLASS =
  'w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#99b3e0] bg-white disabled:bg-gray-50 disabled:text-gray-400'

export default function ProfilePage() {
  const { t }                              = useTranslation()
  const navigate                           = useNavigate()
  const { user, profile, loading, refreshProfile } = useAuth()

  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]        = useState('')
  const [country,         setCountry]         = useState('')
  const [nativeLanguage,  setNativeLanguage]  = useState('')
  const [saving,          setSaving]          = useState(false)
  const [status,          setStatus]          = useState(null)  // 'saved' | 'error' | null

  // Redirect if not logged in
  useEffect(() => {
    if (loading) return
    if (!user) navigate('/auth', { replace: true })
  }, [user, loading, navigate])

  // Pre-fill form when profile loads
  useEffect(() => {
    if (!profile) return
    setFirstName(profile.first_name   ?? '')
    setLastName(profile.last_name     ?? '')
    setCountry(profile.country        ?? '')
    setNativeLanguage(profile.native_language ?? '')
  }, [profile])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!firstName.trim()) return

    setSaving(true)
    setStatus(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name:       firstName.trim(),
        last_name:        lastName.trim() || null,
        country:          country         || null,
        native_language:  nativeLanguage  || null,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setStatus('error')
    } else {
      setStatus('saved')
      await refreshProfile()
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-gray-400">{t('profile.loading')}</p>
      </main>
    )
  }

  return (
    <main className="py-12">
      <div className="max-w-lg">

        <SectionLabel color="gray" className="mb-1">{t('profile.eyebrow')}</SectionLabel>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('profile.title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('profile.subtitle')}</p>

        <Card className="p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* First name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('profile.firstNameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('profile.firstNamePlaceholder')}
                className={INPUT_CLASS}
                required
                autoComplete="given-name"
              />
            </div>

            {/* Last name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('profile.lastNameLabel')}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('profile.lastNamePlaceholder')}
                className={INPUT_CLASS}
                autoComplete="family-name"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('profile.countryLabel')}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">{t('profile.countryPlaceholder')}</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Native language */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('profile.languageLabel')}
              </label>
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">{t('profile.languagePlaceholder')}</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Status messages */}
            {status === 'saved' && (
              <p className="text-sm text-emerald-600">{t('profile.saved')}</p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-600">{t('profile.error')}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saving || !firstName.trim()}
              >
                {saving ? t('profile.saving') : t('profile.saveButton')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => navigate(-1)}
              >
                {t('profile.cancel')}
              </Button>
            </div>

          </form>
        </Card>

      </div>
    </main>
  )
}
