"""
Tests for api/doi_check.py.

# Spec: docs/architecture/seo-pipeline.md

Fully offline: the resolver is a stub keyed by DOI. Covers extraction from
the three citation forms the corpus actually uses, the balanced-paren case
that a naive regex truncates, and the fail-open/fail-closed rule that keeps
a doi.org outage from blocking publishing.
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import httpx  # noqa: E402
import pytest  # noqa: E402

import doi_check  # noqa: E402


class FakeResolver:
    """Stub httpx.Client. `codes` maps a DOI to a status or an exception."""

    def __init__(self, codes: dict[str, object]):
        self.codes = codes
        self.asked: list[str] = []

    def head(self, url, **kwargs):
        doi = url[len(doi_check.RESOLVER):]
        self.asked.append(doi)
        outcome = self.codes.get(doi, 302)
        if isinstance(outcome, Exception):
            raise outcome
        return httpx.Response(status_code=outcome, request=httpx.Request("HEAD", url))


# --- extraction -------------------------------------------------------------

def test_extracts_the_three_citation_forms():
    body = (
        "See [Goldberg et al. (2006)](https://doi.org/10.1016/j.jrp.2005.08.007).\n"
        "> quoted — [doi:10.1037/0021-9010.92.3.595](https://doi.org/10.1037/0021-9010.92.3.595)\n"
        "Bare in prose: 10.2307/256377, which is the AMJ paper.\n"
    )
    assert doi_check.extract_dois(body) == [
        "10.1016/j.jrp.2005.08.007",
        "10.1037/0021-9010.92.3.595",
        "10.2307/256377",
    ]


def test_keeps_balanced_parens_in_suffix():
    # The regression blog_links.py documents: a naive [^)]+ truncates here.
    body = "[Ashton (2003)](https://doi.org/10.1016/S0092-6566(03)00046-1) shows..."
    assert doi_check.extract_dois(body) == ["10.1016/s0092-6566(03)00046-1"]


def test_keeps_balanced_parens_under_emphasis():
    # Both rules at once: strip the emphasis tail, then the unmatched paren,
    # without eating the balanced "(03)" that belongs to the suffix.
    body = "*[Ashton (2003)](https://doi.org/10.1016/S0092-6566(03)00046-1)*"
    assert doi_check.extract_dois(body) == ["10.1016/s0092-6566(03)00046-1"]


@pytest.mark.parametrize("wrapper,expected", [
    ("(doi: 10.2307/256377)", "10.2307/256377"),
    ("10.2307/256377.", "10.2307/256377"),
    ("10.2307/256377;", "10.2307/256377"),
    ("[10.2307/256377]", "10.2307/256377"),
    # Emphasis-wrapped citation leaves a ")*" tail. The "*" used to block the
    # unmatched-paren rule, so a live DOI was reported dead (live sweep after
    # migration 034 flagged the very DOI that migration had just installed).
    ("*[Bell (2007)](https://doi.org/10.2307/256377)*", "10.2307/256377"),
    ("_see https://doi.org/10.2307/256377_", "10.2307/256377"),
])
def test_trims_sentence_and_markdown_punctuation(wrapper, expected):
    assert doi_check.extract_dois(wrapper) == [expected]


def test_dois_in_content_maps_each_doi_to_its_languages():
    content = {
        "en": "see 10.2307/256377",
        "ca": "vegeu 10.2307/256377 i 10.1016/j.jrp.2005.08.007",
        "de": None,  # a language with no body must not blow up
    }
    assert doi_check.dois_in_content(content) == {
        "10.2307/256377": ["en", "ca"],
        "10.1016/j.jrp.2005.08.007": ["ca"],
    }


# --- resolution -------------------------------------------------------------

@pytest.mark.parametrize("code,expected", [
    (404, True),    # unregistered: the only fatal verdict
    (302, False),   # registered, redirecting to the publisher
    (200, False),
    (500, False),   # resolver hiccup
    (None, False),  # unreachable: no verdict, never a failure
])
def test_only_404_is_unresolvable(code, expected):
    assert doi_check.is_unresolvable(code) is expected


def test_transport_error_yields_no_verdict():
    client = FakeResolver({"10.2307/256377": httpx.ConnectError("boom")})
    assert doi_check.resolve(client, "10.2307/256377") is None


def test_unresolvable_dois_reports_dead_ones_with_languages():
    content = {"en": "10.1177/1073191106293419", "ca": "10.1177/1073191106293419 10.2307/256377"}
    client = FakeResolver({"10.1177/1073191106293419": 404, "10.2307/256377": 302})
    assert doi_check.unresolvable_dois(content, client) == [
        ("10.1177/1073191106293419", ["en", "ca"]),
    ]


def test_each_distinct_doi_is_probed_once_across_languages():
    content = {lang: "10.2307/256377" for lang in ("en", "ca", "es", "fr", "de", "da")}
    client = FakeResolver({})
    doi_check.unresolvable_dois(content, client)
    assert client.asked == ["10.2307/256377"]


def test_doi_org_outage_does_not_block_publishing():
    content = {"en": "10.2307/256377 and 10.1016/j.jrp.2005.08.007"}
    client = FakeResolver({
        "10.2307/256377": httpx.ConnectTimeout("down"),
        "10.1016/j.jrp.2005.08.007": httpx.ConnectTimeout("down"),
    })
    assert doi_check.unresolvable_dois(content, client) == []


def test_empty_and_missing_content_are_noops():
    assert doi_check.extract_dois("") == []
    assert doi_check.dois_in_content(None) == {}
    assert doi_check.unresolvable_dois(None, FakeResolver({})) == []


# --- CI gate: retirement declarations ---------------------------------------

def _check_dois_module():
    """Import scripts/check_dois.py (outside the api/ package)."""
    import importlib.util
    path = os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "check_dois.py")
    spec = importlib.util.spec_from_file_location("check_dois", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_retired_dois_are_exempt_but_others_still_checked(tmp_path):
    # A remediation migration names the dead DOI twice (header + replace()
    # needle). Without the declaration the gate would block its own fix.
    sql = tmp_path / "099_fix.sql"
    sql.write_text(
        "-- 10.1177/1073191106293419 -> 10.1016/j.jrp.2005.08.007\n"
        "-- doi-check: retires 10.1177/1073191106293419\n"
        "UPDATE t SET c = replace(c, '10.1177/1073191106293419', '10.1016/j.jrp.2005.08.007');\n"
    )
    found = _check_dois_module().from_files([str(sql)])
    assert set(found) == {"10.1016/j.jrp.2005.08.007"}


def test_undeclared_dead_doi_is_still_collected(tmp_path):
    sql = tmp_path / "100_seed.sql"
    sql.write_text("INSERT INTO t VALUES ('see https://doi.org/10.1177/1073191106293419');\n")
    found = _check_dois_module().from_files([str(sql)])
    assert "10.1177/1073191106293419" in found


# --- attribution: catching a live DOI that cites the wrong paper -------------

BAD_RECORD = {"authors": ["Cooper"], "year": 1993,
              "title": "Best paper prize 1992 ($750 prize)",
              "journal": "Journal of Organizational Behavior"}


def test_flags_a_live_doi_pointing_at_an_unrelated_paper():
    """The real Jul 2026 case: a burnout meta-analysis citing a prize notice."""
    text = ("see also Alarcon et al. (2009) meta-analysis; "
            "https://doi.org/10.1002/job.4030140402")
    reason = doi_check.attribution_mismatch(text, "10.1002/job.4030140402", BAD_RECORD)
    assert reason and "alarcon" in reason.lower()


def test_matching_attribution_passes():
    good = {"authors": ["Alarcon", "Eschleman"], "year": 2009,
            "title": "Relationships between personality variables and burnout", "journal": "Work & Stress"}
    text = "Alarcon et al. (2009) https://doi.org/10.1080/02678370903282600"
    assert doi_check.attribution_mismatch(text, "10.1080/02678370903282600", good) is None


@pytest.mark.parametrize("text", [
    "See also [doi:10.1002/job.235](https://doi.org/10.1002/job.235)",
    "The full paper is available at https://doi.org/10.1002/job.235.",
    "Their central finding is reported at https://doi.org/10.1002/job.235",
])
def test_prose_naming_nobody_is_not_a_mismatch(text):
    """No asserted attribution means nothing to contradict.

    Sentence openers like "See"/"The"/"Their" are capitalised but are not
    surnames; without the stopword filter every bare cross-reference would be
    reported as citing the wrong paper.
    """
    assert doi_check.attribution_mismatch(text, "10.1002/job.235", BAD_RECORD) is None


def test_short_surnames_are_not_skipped():
    """Oh, Wang & Mount (2011): a length-3 token floor silently skipped "Oh"."""
    record = {"authors": ["Cholin", "Dell"], "year": 2011, "title": "Planning and articulation", "journal": "JEP"}
    text = "Oh and colleagues (2011) https://doi.org/10.1037/a0021322"
    assert doi_check.attribution_mismatch(text, "10.1037/a0021322", record) is not None


def test_unavailable_crossref_record_is_not_a_mismatch():
    assert doi_check.attribution_mismatch("Bell (2007) 10.1037/x", "10.1037/x", None) is None


def test_attribution_pass_splits_lines_into_sentences(tmp_path):
    """Line-level context masks real mismatches; sentence-level does not.

    A paragraph usually names the correct author somewhere, so a window that
    reaches back into it finds a match and stays quiet. On the Jul 2026 corpus
    line-level caught 2 of 10 known wrong-paper citations, sentence-level 10.
    """
    mod = _check_dois_module()
    line = ("Alarcon et al. (2009) ran the burnout meta-analysis. "
            "Cooper reported something else at doi:10.1002/job.999.")
    got = list(mod._sentences(line))
    assert len(got) == 2
    assert "Alarcon" not in got[1]          # the second sentence stands alone
    assert "et al." in got[0]               # abbreviation survives the split
