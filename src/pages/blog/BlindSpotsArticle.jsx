/**
 * BlindSpotsArticle — blog article at /blog/blind-spots-in-teams.
 * SEO context: academic names (Big Five, OCEAN, IPIP, AB5C) are permitted here.
 * No i18n — English only.
 */
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui'
import ArticleLayout from './ArticleLayout'

const REFERENCES = [
  {
    key: 'hofstee1992',
    text: 'Hofstee, W. K. B., De Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. Journal of Personality and Social Psychology, 63(1), 146–163.',
    url: 'https://doi.org/10.1037/0022-3514.63.1.146',
  },
  {
    key: 'goldberg2006',
    text: 'Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40, 84–96.',
    url: 'https://doi.org/10.1177/1073191106293419',
  },
]

export default function BlindSpotsArticle() {
  return (
    <ArticleLayout
      title="Blind spots in teams: when self-perception diverges from peer perception"
      description="Self-report and peer assessment of Big Five personality often disagree. Understanding where these gaps occur — and why — can change how a team works together."
      date="2026-05-08"
      readingTime="6 min"
    >

      {/* ── Introduction ─────────────────────────────────────────── */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Everyone has a theory of themselves. We observe our own intentions, our internal
        states, our private responses to difficult situations. We have privileged access
        to our own minds in ways that no colleague, no matter how observant, ever can.
        Yet decades of personality research consistently show that self-ratings of
        personality correlate only moderately with how others perceive us — and that
        the gap varies substantially by dimension, by individual, and by the nature of
        the relationship between rater and subject.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In a team setting, these perceptual gaps are not merely personal quirks. They
        shape how people collaborate, how feedback is given and received, and how
        conflict is — or is not — addressed. A team member who genuinely believes they
        are easy to disagree with, but who is experienced by colleagues as defensive,
        is operating with a blind spot that affects every difficult conversation they
        have. This article explores what the research says about self-other personality
        agreement, why the gaps occur, and how Witness Cèrcol is designed to make
        them visible.
      </p>

      {/* ── Self-other agreement research ────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        What the self-other agreement research shows
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Across the Big Five dimensions, self-other agreement tends to be moderate rather
        than high. Correlations between self-ratings and peer ratings typically fall in
        the range of 0.40 to 0.60 for the most observable traits — meaning that about
        20 to 35 percent of the variance in peer ratings is shared with self-ratings.
        This is meaningful agreement, but it also means that a substantial portion of
        how others perceive someone is not captured by how that person rates themselves.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The pattern is not uniform across dimensions. Extraversion (Presence in Cèrcol)
        shows the highest self-other agreement — being socially expressive and energetic
        is highly visible behaviour, and both self and peers have good access to it.
        Neuroticism (Depth in Cèrcol) shows the lowest agreement: emotional reactivity
        and internal anxiety are not always visible from the outside, and people are
        often uncertain how much of their internal experience is perceptible to others.
        Agreeableness (Bond), Conscientiousness (Discipline), and Openness (Vision) fall
        in between, with agreement varying depending on how much of the relevant
        behaviour occurs in contexts visible to the peers doing the rating.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The "blind spot" in this context refers specifically to the case where
        self-assessment is higher than peer assessment on a dimension — where a person
        believes they show more of a trait than their peers observe in them. This is
        distinct from cases where peers rate someone higher than they rate themselves
        (sometimes called "hidden strengths"). Both types of disagreement are
        informative, but blind spots — where self-perception exceeds peer perception —
        tend to have the more direct practical consequences in team settings.
      </p>

      {/* ── Why blind spots matter ───────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Why blind spots matter in teams
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Consider a team member who rates themselves highly on Agreeableness (Bond) but
        whose colleagues rate them substantially lower. The individual may genuinely
        experience themselves as cooperative and easy to work with — perhaps they feel
        their directness is honest and kind. But colleagues may experience that same
        directness as dismissiveness, or perceive a pattern of not listening that the
        individual is unaware of. The self-perception is not dishonest; it is simply
        incomplete.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Or consider a team member who rates themselves highly on Vision (Openness), but
        whose Witnesses rate them lower. The individual may see themselves as curious
        and open to new ideas, but in practice their behaviour in team discussions may
        be experienced as more resistant to changing direction than they realise. They
        might advocate for exploration when the team needs execution — and be unaware
        that this is how it lands.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Blind spots are not character flaws. They are information gaps — places where
        the feedback loop between behaviour and perception has been incomplete. In many
        teams, there is no structural mechanism for surfacing this information. People
        receive informal, selective, and often diplomatically filtered feedback. The
        result is that the gap between self-perception and peer perception can persist
        for years without either party being fully aware of it.
      </p>

      {/* ── How forced-choice peer assessment reduces bias ───────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Why traditional rating scales are not enough — and what forced choice does instead
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Traditional rating scales — where a Witness rates someone on a set of traits
        from 1 to 5 — are vulnerable to well-documented biases. Social desirability
        bias leads raters to give generously high ratings when they feel warmly about
        the subject. Acquiescence bias leads some raters to agree with or endorse most
        statements regardless of content. The result is that peer ratings from
        traditional scales are often compressed toward the positive end — "everyone is
        above average" — which reduces their diagnostic value.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Forced-choice assessment addresses this structurally: instead of rating each
        trait independently, the Witness is presented with a set of adjectives and
        must choose which best fits and which least fits the subject. Because they
        cannot rate everything highly — the task requires a choice — the resulting
        data is more discriminating and less distorted by acquiescence or
        social desirability.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Witness Cèrcol uses a forced-choice adjective selection task derived from the
        AB5C lexical corpus (Hofstee, De Raad, & Goldberg, 1992). The AB5C circumplex
        arranges personality-descriptive adjectives at the intersections of Big Five
        dimensions, creating a rich, validated lexical space for personality description.
        In each round of the Witness task, one adjective per Big Five dimension is
        presented, and the Witness selects the best fit and the worst fit for the
        subject. This prevents the Witness from endorsing all traits simultaneously,
        and the resulting profile is grounded in the same psychometric tradition as
        Cèrcol's self-report instrument (Goldberg et al., 2006).
      </p>

      {/* ── What Witness Cèrcol produces ─────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        What the Witness Cèrcol report shows
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Up to twelve Witnesses can complete an assessment for the same subject.
        Dimension scores are averaged across all Witnesses to produce a composite
        peer profile. The Full Moon Cèrcol report shows the subject's self-report
        profile and their Witness profile side by side. Dimensions where the absolute
        difference between self and Witness standardised scores exceeds 0.8 are
        flagged as potential blind spots (or hidden strengths, depending on direction).
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The 0.8 standard deviation threshold is a practical heuristic, not a clinically
        validated cut-off. It is calibrated to flag meaningful disagreements while
        avoiding excessive false positives from normal measurement noise. The report
        presents this as a starting point for reflection, not a diagnosis. A divergence
        on Bond does not mean someone is disagreeable; it means there is a gap worth
        exploring.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The report does not adjudicate between self and Witness views. Both are data.
        Self-perception captures internal experience and intention; peer perception
        captures external impact and behaviour as others observe it. Neither is the
        complete truth. The value is in the gap itself — in the question it opens rather
        than the verdict it delivers.
      </p>

      {/* ── Using blind spots constructively ─────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-3">
        Using blind spots constructively
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The goal is not to tell someone they are wrong about themselves. It is to create
        a structured, low-conflict opportunity for that question to be asked: "Where
        do I think I show up differently from how my team experiences me?" The data
        provides a starting point; the conversation does the work.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Team-level patterns in blind spots are also worth examining. If all members of
        a team have blind spots on the same dimension — for example, all rating
        themselves higher on Agreeableness than their Witnesses do — this may signal
        something about team culture: a norm of indirect communication, a reluctance
        to give critical feedback, or a gap between the team's stated values and its
        actual behaviour.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Witness Cèrcol is available as part of the{' '}
        <Link to="/full-moon" className="underline hover:text-gray-800 transition-colors">
          Full Moon Cèrcol
        </Link>{' '}
        assessment. Once you have completed your self-report, you can invite up to
        twelve Witnesses to complete a short peer assessment. The combined report
        shows both profiles and flags dimensions of divergence. Setup takes about
        two minutes, and each Witness assessment takes around five.
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
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Note: self-other agreement correlation figures cited in the text are approximate
          and reflect general findings from the personality research literature rather than
          a single study. The range 0.40–0.60 is consistent with aggregated findings from
          multiple meta-analytic reviews of Big Five self-other agreement.
        </p>
      </section>

    </ArticleLayout>
  )
}
