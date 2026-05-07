/**
 * BalancedTeamArticle — blog article at /blog/how-to-build-a-balanced-team.
 * SEO context: academic names (Big Five, OCEAN, IPIP) are permitted here.
 * No i18n — English only.
 */
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui'
import ArticleLayout from './ArticleLayout'

const REFERENCES = [
  {
    key: 'bell2007',
    text: 'Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. Journal of Applied Psychology, 92(3), 595–615.',
    url: 'https://doi.org/10.1037/0021-9010.92.3.595',
  },
  {
    key: 'barrick1991',
    text: 'Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. Personnel Psychology, 44(1), 1–26.',
    url: 'https://doi.org/10.1111/j.1744-6570.1991.tb00688.x',
  },
  {
    key: 'nestsiarovich2020',
    text: 'Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. PLoS ONE, 15(3), e0230069.',
    url: 'https://doi.org/10.1371/journal.pone.0230069',
  },
]

export default function BalancedTeamArticle() {
  return (
    <ArticleLayout
      title="How to build a balanced team using personality science"
      description="What does the research say about personality composition and team performance? A practical guide grounded in meta-analytic evidence from Bell (2007) and Barrick & Mount (1991)."
      date="2026-05-08"
      readingTime="7 min"
    >

      {/* ── Introduction ─────────────────────────────────────────── */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Does personality composition actually matter for team performance? The intuitive
        answer is yes: we all notice when a team lacks someone who follows through on
        details, or when a group is so conflict-averse that critical problems go
        unaddressed. But intuition is not evidence. The research on personality and team
        performance is more nuanced than either sceptics or enthusiasts tend to suggest.
        This article summarises what the meta-analytic literature says — and, equally
        importantly, what it does not say.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The central finding from decades of research is this: personality does predict
        performance, both at the individual and team level, but the effect sizes are
        meaningful rather than deterministic. Personality explains some of the variance
        in outcomes — not all of it, and not equally across all contexts. Teams that
        understand this can use personality data as one input among many, rather than
        as a prescription.
      </p>

      {/* ── What the meta-analyses say ───────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        What the meta-analyses say
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Bell's (2007) meta-analysis examined 60 studies on team composition and
        performance, focusing on "deep-level" variables including personality. Key
        findings: mean Agreeableness (Bond in Cèrcol) and mean Conscientiousness
        (Discipline) showed the most consistent positive relationships with team
        performance. Mean Openness (Vision) was more important for creative and
        knowledge-based tasks than for routine tasks. Effect sizes were in the small to
        moderate range — meaningful, but not overwhelming. Teams cannot be engineered
        into high performance through personality selection alone.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Barrick and Mount (1991) provided the foundational individual-level evidence:
        across 162 independent samples, Conscientiousness (Discipline) was the only Big
        Five dimension that predicted job performance consistently across all occupational
        categories studied. The other dimensions predicted performance in specific
        contexts: Extraversion (Presence) for managerial and sales roles, Openness
        (Vision) for training performance, Agreeableness (Bond) for team-oriented work.
        This individual-level pattern translates imperfectly but meaningfully to the
        team level.
      </p>

      {/* ── The five dimensions and team composition ─────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        The five dimensions and what they mean for team composition
      </h2>

      <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">
        Presence (Extraversion)
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Teams need members who bring energy, take initiative, and engage actively with
        the external environment. Extraversion (Presence) predicts performance in roles
        with high social demands. However, teams composed entirely of high-Presence
        individuals can lack the reflective, internally-focused thinking that comes from
        members who are more reserved. A mix of Presence levels appears more robust
        than either extreme.
      </p>

      <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">
        Bond (Agreeableness)
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Agreeableness (Bond) is associated with cooperativeness, empathy, and trust —
        qualities essential for team cohesion. Bell (2007) found mean Agreeableness to
        be one of the stronger predictors of team performance. The risk at extremes is
        real in both directions: very low mean Agreeableness in a team creates
        persistent conflict; very high mean Agreeableness can produce groupthink, where
        critical feedback is suppressed to preserve harmony. Teams that can combine
        warmth with honesty — high Bond with the capacity to disagree — tend to
        perform better in complex tasks.
      </p>

      <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">
        Vision (Openness to Experience)
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Openness to Experience (Vision) drives curiosity, creativity, and tolerance for
        ambiguity. In creative and knowledge-intensive work, teams with higher mean
        Vision tend to generate more novel solutions. In highly structured or
        compliance-oriented work, the relationship is weaker or absent. Low-Vision
        teams can be efficient and reliable within established procedures but may
        struggle when the situation requires rethinking assumptions. The value of
        Openness is strongly context-dependent.
      </p>

      <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">
        Discipline (Conscientiousness)
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Conscientiousness (Discipline) is the most consistently validated personality
        predictor of performance, both individually and at the team level. Teams need
        sufficient collective Discipline to follow through on commitments, meet
        deadlines, and maintain quality standards. Bell (2007) confirmed this at the
        team level: mean Conscientiousness was a reliable positive predictor across
        task types. There is limited evidence for a ceiling effect, though at very high
        levels rigidity can become a concern in rapidly changing environments.
      </p>

      <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">
        Depth (Neuroticism / Emotional Stability)
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        High Neuroticism (high Depth in Cèrcol — emotional reactivity, tendency to
        experience negative affect) is associated with lower team performance in Bell's
        (2007) meta-analysis. Teams under high stress or pressure appear to perform
        better when members are, on average, more emotionally stable. This does not
        mean that individuals who score higher on Depth are less valuable — their
        perceptiveness and sensitivity can be important assets in appropriate contexts.
        The team-level finding is about average levels under pressure, not about
        individual worth.
      </p>

      {/* ── The role diversity hypothesis ────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        The role diversity hypothesis
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Beyond mean levels of each dimension, there is a separate question about
        diversity: does a team benefit from having members with different personality
        profiles? Nestsiarovich and Pons (2020) conducted a systematic review of team
        roles derived from personality structure, including roles based on the AB5C
        circumplex model (Hofstee et al., 1992). Their review found evidence supporting
        the idea that team role diversity — derived from Big Five profiles — is
        associated with better outcomes, particularly in problem-solving tasks.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Cèrcol's role system is based on this research. The 12 roles are derived from
        positions in the AB5C circumplex, representing different balances across the
        five dimensions. However, it is important to be clear: Cèrcol's specific role
        assignments are a working hypothesis. The system has not yet been empirically
        validated against team outcomes with Cèrcol's own data. The theory is sound; the
        specific application to Cèrcol's role labels is beta, honest, and subject to
        revision.
      </p>

      {/* ── What we don't know ───────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        What the research does not tell us
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Most studies in this area are cross-sectional — they measure personality and
        performance at the same point in time, making it difficult to establish
        causation. Longitudinal studies, following teams over time as composition
        changes, are rarer and harder to conduct. Effect sizes in the literature are
        meaningful but not large: personality composition explains some of the variance
        in team outcomes, not most of it. What the team is doing, how it is led, how
        well its members communicate, and the broader organisational context all
        matter too.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Context also matters more than simple prescriptions suggest. What works for a
        software product team is not necessarily what works for a surgical team, a
        military unit, or a creative studio. The research provides useful general
        tendencies; it does not provide a universal formula. Cèrcol's role system is
        currently at N below 300 — too small to draw confident empirical conclusions
        about which role compositions lead to which outcomes.
      </p>

      {/* ── How to use this practically ─────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        How to use this practically
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Use personality data as a starting point for conversation, not as a prescription
        for team composition. The most useful application is not "we need a high-Discipline
        person to replace the low-Discipline person who left" — it is "here are the
        dimensions where we are weakest as a team; how might that affect the kinds of
        work we find difficult?"
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Aim for awareness of the full range of dimensions, and pay particular attention
        to where self-perception diverges from peer perception. A team member who
        believes they are high in Bond but whose Witnesses consistently rate them lower
        has useful, actionable information — regardless of which view is "correct."
        Cèrcol's{' '}
        <Link to="/full-moon" className="underline hover:text-gray-800 transition-colors">
          Full Moon instrument
        </Link>{' '}
        combines a 120-item self-report with the{' '}
        <Link to="/witness-setup" className="underline hover:text-gray-800 transition-colors">
          Witness
        </Link>{' '}
        peer assessment specifically to surface these divergences.
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
                    {ref.url.replace('https://doi.org/', 'doi:')}
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
