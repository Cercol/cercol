"""Unify the Cèrcol dimension names across the German corpus.

The reviewers split three ways on this and each was internally consistent,
so the corpus is not. This applies one decision to all of it.

Direction is a flag, because the call belongs to the product owner:

    --to-german   Bond -> Bindung          (matches src/locales/de.json)
    --to-english  Bindung/Verbindung -> Bond

Only the five dimension names move. Instrument names (New Moon Cercol,
First Quarter Cercol, Full Moon Cercol) and the academic Big Five terms
(Agreeableness, Conscientiousness, ...) are never touched: the first are
brand names, the second earn the search impressions.

Word boundaries matter here. "Bond" must not be caught inside "Bonduelle"
and "Vision" is identical in both languages, so it is left out entirely.
"""
import pathlib
import re
import sys

OUT = pathlib.Path(__file__).parent / "out"

# (english, german). Vision is the same word in both and needs no rule.
PAIRS = [
    ("Presence", "Präsenz"),
    ("Bond", "Bindung"),
    ("Discipline", "Disziplin"),
    ("Depth", "Tiefe"),
]
# Seen in the wild as a third variant for Bond; always wrong, folds either way.
STRAYS = {"Verbindung": ("Bond", "Bindung"), "Verbundenheit": ("Bond", "Bindung")}

# Academic terms that must survive untouched even though they look similar.
PROTECTED = ("Agreeableness", "Conscientiousness", "Extraversion",
             "Openness", "Neuroticism", "Big Five", "Big-Five")


def convert(text: str, to_german: bool) -> tuple[str, int]:
    hits = 0
    for english, german in PAIRS:
        src, dst = (english, german) if to_german else (german, english)
        pattern = re.compile(rf'(?<![\w-]){re.escape(src)}(?![\w-])')
        text, n = pattern.subn(dst, text)
        hits += n
    for stray, (english, german) in STRAYS.items():
        dst = german if to_german else english
        pattern = re.compile(rf'(?<![\w-]){stray}(?![\w-])')
        text, n = pattern.subn(dst, text)
        hits += n
    return text, hits


def main() -> int:
    if "--to-german" not in sys.argv and "--to-english" not in sys.argv:
        print(__doc__)
        return 2
    to_german = "--to-german" in sys.argv
    apply = "--apply" in sys.argv

    total, touched = 0, 0
    for path in sorted(OUT.glob("*.md")):
        text = path.read_text()
        before = {p: text.count(p) for p in PROTECTED}
        new, n = convert(text, to_german)
        after = {p: new.count(p) for p in PROTECTED}
        if before != after:
            print(f"REFUSED {path.stem}: a protected term moved")
            continue
        if n:
            total += n
            touched += 1
            if apply:
                path.write_text(new)
    print(f"{'applied' if apply else 'would change'} {total} names in {touched} files "
          f"({'to German' if to_german else 'to English'})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
