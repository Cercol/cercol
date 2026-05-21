## Descripció

<!-- Breu explicació del canvi. -->

## Tipus de canvi

- [ ] Fix
- [ ] Feat
- [ ] Refactor
- [ ] Docs
- [ ] Chore

## Checklist

- [ ] He llegit les `docs/policies/` rellevants per al canvi.
- [ ] He actualitzat `docs/architecture/<area>.md` si el canvi toca un subsistema documentat (o justifico per què no cal).
- [ ] Si el canvi és una decisió arquitectònica (vegeu `docs/policies/sprint-process.md`), he creat l'ADR a `docs/decisions/`.
- [ ] Si el canvi toca migracions DB, les he aplicades a producció immediatament després de mergejar (vegeu `docs/policies/conventions.md`).
- [ ] He afegit `# Spec: docs/<path>.md` als mòduls nous amb doc dedicada.
- [ ] Tests verds localment (frontend i backend si aplica).
- [ ] Si el canvi toca HTML estructural (h1, canonical, hreflang): `api/tests/test_seo.py` passa.

## Related

<!-- Issues, ADRs, post-mortems, commits relacionats. -->
