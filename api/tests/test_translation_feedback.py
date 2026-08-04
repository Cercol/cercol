"""The suggest-a-translation path, end to end at the contract level.

# Spec: db/migrations/064_translation_feedback.sql

The widget existed for two phases behind a flag because there was nowhere to
send a suggestion. These tests pin the two properties that made it worth
switching on: it takes anonymous input, and it never reports success when
nothing was stored.
"""
from __future__ import annotations

import os
import pathlib
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

API = pathlib.Path(__file__).parent.parent / "main.py"


def _endpoint(name: str) -> str:
    t = API.read_text()
    start = t.index(f'@app.post("{name}")') if f'@app.post("{name}")' in t \
        else t.index(f'@app.get("{name}")')
    rest = t[start + 10:]
    return t[start:start + 10 + rest.index("@app.")]


def test_submitting_a_suggestion_needs_no_account():
    """Requiring sign-in to report a typo is how you get no reports."""
    block = _endpoint("/translation-feedback")
    assert "get_optional_user" in block
    assert "require_premium" not in block and "get_current_user" not in block


def test_an_empty_suggestion_is_rejected():
    block = _endpoint("/translation-feedback")
    assert "status_code=400" in block


def test_the_suggestion_is_length_capped():
    """A free-text field open to the internet needs a ceiling."""
    block = _endpoint("/translation-feedback")
    assert "[:4000]" in block


def test_reading_suggestions_is_admin_only():
    block = _endpoint("/admin/translation-feedback")
    assert "require_admin" in block


def test_the_widget_is_no_longer_hidden():
    """It was flagged off precisely so it would not discard what users typed.
    Now that the endpoint exists, leaving it off would be the defect."""
    ui = pathlib.Path(__file__).parent.parent.parent / "src/components/FeedbackButton.jsx"
    assert "const TRANSLATION_FEEDBACK_ENABLED = true" in ui.read_text()


def test_the_client_never_claims_success_on_failure():
    util = pathlib.Path(__file__).parent.parent.parent / "src/utils/translationFeedback.js"
    src = util.read_text()
    assert "return false" in src and "return true" in src
    assert "return false" in src.split("catch")[1]
