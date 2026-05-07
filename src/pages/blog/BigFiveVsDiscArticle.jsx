/**
 * BigFiveVsDiscArticle — blog article at /blog/big-five-vs-disc-vs-belbin.
 * SEO context: academic names (Big Five, DISC, Belbin, OCEAN, IPIP) are permitted here.
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
    key: 'nestsiarovich2020',
    text: 'Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. PLoS ONE, 15(3), e0230069.',
    url: 'https://doi.org/10.1371/journal.pone.0230069',
  },
  {
    key: 'barrick1991',
    text: 'Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. Personnel Psychology, 44(1), 1–26.',
    url: 'https://doi.org/10.1111/j.1744-6570.1991.tb00688.x',
  },
  {
    key: 'furnham1993',
    text: 'Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. Journal of Occupational and Organizational Psychology, 66(3), 245–257.',
    url: 'https://doi.org/10.1111/j.2044-8325.1993.tb00535.x',
  },
  {
    key: 'ipip',
    text: 'International Personality Item Pool — public-domain personality item library.',
    url: 'https://ipip.ori.org',
  },
]

export default function BigFiveVsDiscArticle() {
  return (
    <ArticleLayout
      title="Big Five vs DISC vs Belbin: a scientist's comparison"
      description="Three of the most popular personality frameworks in organisations compared honestly. One has 50+ years of cross-cultural peer-reviewed evidence. Here is what the research actually says."
      date="2026-05-08"
      readingTime="8 min"
    >

      {/* ── Introduction ─────────────────────────────────────────── */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The personality assessment industry is large and growing. Organisations spend
        substantial money on tools that promise insight into who people are and how they
        will perform. Many of these tools lack independent peer-reviewed validation.
        Certification programmes, facilitator networks, and marketing materials are not
        substitutes for published, replicated psychometric research. This article
        compares three widely used frameworks — the Big Five (OCEAN), DISC, and Belbin
        Team Roles — on scientific grounds, not commercial ones.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The comparison is not designed to declare a winner for all purposes. DISC and
        Belbin have genuine uses. The goal is to be honest about what each framework
        measures, where its evidence base comes from, and what its limitations are —
        so that the people making decisions about which tool to use can do so with
        accurate information.
      </p>

      {/* ── The Big Five (OCEAN) ──────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        The Big Five (OCEAN): the scientific standard
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The Big Five, also called OCEAN, is a model of personality structure derived
        from the lexical hypothesis: the idea that the most important personality
        differences are encoded in natural language, and that systematic factor analysis
        of personality-descriptive adjectives reveals a stable, cross-culturally
        replicable structure. The five dimensions are Openness to Experience,
        Conscientiousness, Extraversion, Agreeableness, and Neuroticism. In Cèrcol,
        these are called Vision, Discipline, Presence, Bond, and Depth respectively.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        What distinguishes the Big Five from other frameworks is not a single study but
        a cumulative body of evidence spanning more than five decades and more than fifty
        cultures. Goldberg et al. (2006) documented the International Personality Item
        Pool (IPIP) — a public-domain library of more than 3,000 validated items — as
        the basis for open, reproducible Big Five measurement across research contexts.
        The IPIP is freely available at{' '}
        <a
          href="https://ipip.ori.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-800 transition-colors"
        >
          ipip.ori.org
        </a>
        . Because IPIP items are public domain, any researcher can audit the
        measurement, replicate a study, or build an independent implementation — without
        a licence fee.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Barrick and Mount's (1991) meta-analysis of 162 independent samples established
        that Conscientiousness (Discipline in Cèrcol) predicts job performance across
        occupational groups more consistently than any other Big Five dimension. This
        finding has been replicated in dozens of subsequent meta-analyses. The Big Five
        does have limitations: the five broad dimensions are not team roles, and
        additional modelling is required to map trait profiles onto team behaviour
        (Nestsiarovich & Pons, 2020). But the limitations are published, debated, and
        visible — which is itself a sign of scientific maturity.
      </p>

      {/* ── DISC ─────────────────────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        DISC: a communication framework, not a psychometric model
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        DISC describes four behavioural styles: Dominance, Influence, Steadiness, and
        Conscientiousness. It was developed by William Moulton Marston in his 1928 book
        <em> Emotions of Normal People</em>, which proposed a theory of emotional
        response in normal individuals. Marston's original model was not designed as a
        psychometric personality instrument; it was a theoretical framework about how
        people respond to their environment under different conditions.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        DISC is widely used in corporate training and coaching, and many practitioners
        find it useful as a language for talking about communication differences.
        However, it is not derived from the Big Five factor structure, and independent
        validity studies — particularly studies conducted by researchers not affiliated
        with DISC publishers — are substantially fewer than those for Big Five
        instruments. Most DISC validation research is proprietary or internal to the
        publishing organisations. The DISC dimensions do not map cleanly onto the
        peer-reviewed Big Five factor structure, which means that findings from Big Five
        research do not automatically transfer to DISC interpretations.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        This does not make DISC useless. It can serve as a practical communication
        tool, particularly for teams that want a simple shared vocabulary for
        behavioural differences. The important thing is to be clear about what it is
        and is not: it is not a psychometric model of personality in the tradition of
        the Big Five, and claims about its validity should be evaluated against
        independent, published research rather than publisher-provided materials.
      </p>

      {/* ── Belbin ───────────────────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Belbin Team Roles: preferred behaviour, not trait measurement
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Meredith Belbin's nine team roles — Plant, Resource Investigator,
        Co-ordinator, Shaper, Monitor Evaluator, Teamworker, Implementer, Completer
        Finisher, and Specialist — were developed through observation of management
        teams at Henley Business School in the 1970s. Belbin was primarily interested
        in what behaviours teams needed to be effective, and the roles were constructed
        to describe preferred team behaviour rather than underlying personality traits.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Belbin is widely used, particularly in UK organisations, and remains influential
        in team development practice. The important distinction is that the Belbin Team
        Inventory is a behavioural self-report instrument, not a psychometric personality
        measure in the same tradition as Big Five instruments. Furnham, Steele, and
        Pendleton (1993) conducted one of the more rigorous independent assessments of
        the Belbin inventory and found that Belbin scores do correlate with Big Five
        dimensions, but the relationship is complex and the psychometric properties of
        the inventory are not straightforward.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Cèrcol takes a different approach to peer assessment than Belbin. Where Belbin
        asks people to self-report their preferred team roles, Cèrcol's Witness
        instrument uses a forced-choice adjective task to collect peer perception data
        on Big Five dimensions — reducing social desirability bias and anchoring the
        assessment in the peer-reviewed psychometric tradition. Cèrcol deliberately
        does not use the term "observer" — the peer assessor is always called Witness,
        and the instrument is called Witness Cèrcol.
      </p>

      {/* ── Why Cèrcol uses IPIP ─────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Why Cèrcol uses the Big Five and the IPIP
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Cèrcol uses IPIP items exclusively for three reasons: they are public domain
        (no licence fee, fully auditable), they are scientifically grounded in the Big
        Five factor structure (every item is citable and has documented validity data),
        and they are reproducible (any researcher can independently verify or challenge
        the results). The scoring algorithm is open source. Anyone can review it.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        This approach means that Cèrcol's personality profiles can be compared directly
        with findings from thousands of published studies using the same items. It also
        means that the limitations are transparent: the role taxonomy derived from
        personality profiles is in beta and has not yet been empirically validated
        against team outcomes. That is published openly on the{' '}
        <Link
          to="/science"
          className="underline hover:text-gray-800 transition-colors"
        >
          science page
        </Link>
        .
      </p>

      {/* ── Bottom line ──────────────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Bottom line
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        No single tool answers all questions. DISC is useful as a communication
        framework for teams that want a simple shared vocabulary. Belbin is useful
        for discussions about preferred team behaviours and role coverage. Neither
        has the depth of independent peer-reviewed evidence that the Big Five, measured
        via the IPIP, has accumulated over fifty years of research across fifty cultures.
        If scientific validity, replicability, and full independent audit are the
        criteria, the Big Five measured via the IPIP is the only choice that meets all
        three.
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
