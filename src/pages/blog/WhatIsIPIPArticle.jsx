/**
 * WhatIsIPIPArticle — blog article at /blog/what-is-the-ipip.
 * SEO context: academic names (IPIP, Big Five, OCEAN, NEO, AB5C) are permitted here.
 * No i18n — English only.
 */
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui'
import ArticleLayout from './ArticleLayout'

const REFERENCES = [
  {
    key: 'goldberg2006',
    text: 'Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40, 84–96.',
    url: 'https://doi.org/10.1177/1073191106293419',
  },
  {
    key: 'johnson2014',
    text: 'Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory. Journal of Research in Personality, 51, 78–89.',
    url: 'https://doi.org/10.1016/j.jrp.2014.05.003',
  },
  {
    key: 'gosling2003',
    text: 'Gosling, S. D., Rentfrow, P. J., & Swann, W. B., Jr. (2003). A very brief measure of the Big Five personality domains. Journal of Research in Personality, 37, 504–528.',
    url: 'https://doi.org/10.1016/S0092-6566(03)00046-1',
  },
  {
    key: 'ipip',
    text: 'International Personality Item Pool — public-domain personality item library.',
    url: 'https://ipip.ori.org',
  },
]

export default function WhatIsIPIPArticle() {
  return (
    <ArticleLayout
      title="What is the IPIP and why does it matter?"
      description="The International Personality Item Pool is the most widely used public-domain personality item library in science. This is why it matters — and why Cèrcol uses it."
      date="2026-05-08"
      readingTime="5 min"
    >

      {/* ── Introduction ─────────────────────────────────────────── */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Most personality tests are proprietary. The questions, scoring algorithms, and
        normative data are owned by a publisher, and using them in any context —
        research, organisational assessment, software products — requires a licence.
        Some publishers do not disclose their scoring algorithms at all, which makes
        independent verification impossible. This is a structural problem for science:
        if the measurement instrument cannot be independently audited, the findings it
        produces cannot be fully trusted.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The International Personality Item Pool (IPIP) was created to solve this
        problem. It is a public-domain library of more than 3,000 personality
        assessment items, freely available to any researcher, organisation, or developer
        for any purpose, without restriction or fee. Its existence has transformed
        personality research by making open, reproducible measurement possible at scale.
      </p>

      {/* ── History ──────────────────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        History and motivation
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The IPIP was created by Lewis Goldberg at the Oregon Research Institute in the
        1990s. Goldberg was one of the central figures in developing the Big Five
        (OCEAN) model of personality, and he was acutely aware of the problem that
        proprietary instruments posed for cumulative science: different labs using
        different proprietary items made it difficult to compare findings across studies.
        His solution was to develop an open library of items validated against established
        personality constructs, and to place them in the public domain.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The IPIP is available at{' '}
        <a
          href="https://ipip.ori.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-800 transition-colors"
        >
          ipip.ori.org
        </a>
        . Goldberg et al. (2006) documented the IPIP's development, validation
        approach, and its role as the foundation for future public-domain personality
        measurement. The paper is one of the most cited in the personality assessment
        literature.
      </p>

      {/* ── What it contains ─────────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        What the IPIP contains
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The IPIP contains more than 3,000 items validated against established personality
        constructs. The primary structure is the Big Five (OCEAN): Extraversion,
        Agreeableness, Conscientiousness, Neuroticism, and Openness to Experience.
        Beyond the five broad domains, the IPIP covers thirty NEO facets (the narrow
        sub-dimensions within each broad domain), the AB5C circumplex markers (Hofstee
        et al., 1992), and a range of other personality constructs relevant to specific
        research questions.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Johnson (2014) developed the IPIP-NEO-120, a 120-item public-domain instrument
        measuring all thirty NEO facets across the five domains. This instrument is
        widely used in research because it provides the full facet-level detail of the
        proprietary NEO PI-R without any licence restriction. At 120 items, it takes
        around fifteen to twenty minutes to complete. Johnson also developed the
        IPIP-NEO-60, a shorter 60-item version that provides reliable facet scores in
        about eight to ten minutes.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Gosling, Rentfrow, and Swann (2003) created the Ten Item Personality Inventory
        (TIPI) — a very brief 10-item measure of the Big Five — using IPIP markers.
        The TIPI is the shortest validated Big Five instrument and is useful when time
        constraints are severe. New Moon Cèrcol uses a 10-item instrument in the same
        tradition, providing a quick snapshot of the five dimensions.
      </p>

      {/* ── Why public domain matters ────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Why public domain matters
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The practical implications of public-domain measurement are significant. First,
        there is no licence fee: organisations, researchers, and developers can use IPIP
        items without paying per assessment or per user. For organisations conducting
        large-scale assessments, this removes a substantial cost barrier. For researchers
        in lower-resource settings, it removes an access barrier.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Second, the scoring is transparent. Every item's contribution to every dimension
        is documented. Anyone can audit the algorithm and verify that it behaves as
        claimed. This is not possible with proprietary instruments whose scoring
        methods are not disclosed.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Third, results are comparable across studies. When a researcher in Barcelona
        and a researcher in Copenhagen both use the IPIP-NEO-120, their findings are
        directly comparable because they are using identical items with identical
        scoring. This comparability is essential for the kind of cumulative science
        that meta-analyses depend on.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        This stands in contrast to proprietary instruments such as the NEO PI-R,
        BFI-2, DISC, or StrengthsFinder, which require licences and in some cases
        do not publish their scoring algorithms. Studies using these instruments cannot
        be fully audited by independent researchers.
      </p>

      {/* ── Scientific validation ────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Scientific validation of IPIP instruments
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        IPIP items have been validated in thousands of peer-reviewed studies across
        more than fifty countries and dozens of languages. Cross-cultural validity
        research has generally found that the Big Five factor structure recovers well
        across different languages and cultural contexts when IPIP items are carefully
        translated. This does not mean that every IPIP item works equally well in every
        language — translation quality matters, and psychological meaning must be
        preserved precisely — but the underlying factor structure is robust.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The IPIP-NEO-60 and IPIP-NEO-120 are among the most widely used personality
        instruments in academic research. Their psychometric properties — reliability,
        factor structure, and criterion validity — have been documented extensively.
        Johnson (2014) provides the primary technical documentation for the IPIP-NEO-120;
        Maples-Keller et al. (2019) developed a 60-item version using item response
        theory methods.
      </p>

      {/* ── Why Cèrcol uses the IPIP ─────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Why Cèrcol uses the IPIP
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Every item in Cèrcol is drawn from the IPIP. No proprietary content is used
        anywhere in the assessment. This means that any user can, in principle, look
        up every item on ipip.ori.org and verify exactly what construct it is measuring
        and how it contributes to the scoring algorithm. The scoring algorithm itself
        is open source.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The practical consequence of this commitment is full accountability. Cèrcol's
        results can be compared directly with findings from any other study using the
        same IPIP items — which includes the bulk of the personality research literature
        from the past two decades. When Cèrcol reports that a user scores in the 75th
        percentile on Conscientiousness (Discipline), that finding is grounded in the
        same measurement tradition as findings in peer-reviewed journals.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        For the full technical documentation of Cèrcol's scoring methodology —
        including which items are used in each instrument, how facet scores are
        calculated, and how the role taxonomy is derived — see the{' '}
        <Link to="/science" className="underline hover:text-gray-800 transition-colors">
          science page
        </Link>
        .
      </p>

      {/* ── References ───────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4">References</h2>
        <div className="flex flex-col gap-2">
          {REFERENCES.map((ref) => (
            <Card key={ref.key} className="px-4 py-3 text-xs text-gray-500 leading-relaxed">
              {ref.url ? (
                <>
                  {ref.text.replace(/\.$/, '')} —{' '}
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-700 transition-colors"
                  >
                    {ref.url.startsWith('https://doi.org/')
                      ? ref.url.replace('https://doi.org/', 'doi:')
                      : ref.url}
                  </a>
                </>
              ) : (
                ref.text
              )}
            </Card>
          ))}
        </div>
      </section>

    </ArticleLayout>
  )
}
