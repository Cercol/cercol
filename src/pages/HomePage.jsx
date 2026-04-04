/**
 * HomePage — landing screen with project intro and CTA to start the test.
 */
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl text-center">
        {/* Wordmark */}
        <div className="mb-10">
          <span className="text-4xl font-bold tracking-tight text-gray-900">
            Cèrcol
          </span>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-blue-600">
            Personality Assessment
          </p>
        </div>

        {/* Hero */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          Discover your Big Five personality profile
        </h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          A 10-question scientific assessment based on the TIPI instrument.
          Takes about 2 minutes. Your answers are processed entirely in your browser — nothing is stored.
        </p>

        {/* Dimension pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { label: 'Openness', color: 'bg-purple-100 text-purple-700' },
            { label: 'Conscientiousness', color: 'bg-blue-100 text-blue-700' },
            { label: 'Extraversion', color: 'bg-amber-100 text-amber-700' },
            { label: 'Agreeableness', color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Neuroticism', color: 'bg-red-100 text-red-700' },
          ].map(({ label, color }) => (
            <span key={label} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/test')}
          className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-2xl shadow-md transition-colors"
        >
          Start the assessment
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Based on Gosling et al. (2003). Open source.{' '}
          <a
            href="https://github.com/miquelmatoses/cercol"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-600"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </main>
  )
}
