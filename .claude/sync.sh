#!/usr/bin/env bash
# Hält lokale und Cloud-Sitzungen über GitHub synchron (Claude-Code-Hooks, siehe .claude/settings.json).
#   pull: zu Sitzungsbeginn den aktuellen Branch holen, nur Fast-Forward (nie mergen, nie überschreiben)
#   push: am Ende jeder Antwort bereits committete, noch nicht gepushte Commits pushen. Committet selbst nichts.
# Meldungen gehen als systemMessage an die Oberfläche; ein Fehler bricht die Sitzung nie ab.
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
melde() { printf '{"systemMessage":"Sync: %s"}\n' "$1"; exit 0; }
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
branch=$(git symbolic-ref --short -q HEAD) || melde "kein Branch ausgecheckt, nichts synchronisiert"

case "$1" in
  pull)
    git fetch -q origin 2>/dev/null || melde "GitHub nicht erreichbar, Stand evtl. veraltet"
    git rev-parse -q --verify "origin/$branch" >/dev/null || exit 0
    git merge -q --ff-only "origin/$branch" 2>/dev/null \
      || melde "$branch ist lokal und auf GitHub auseinandergelaufen (oder ungesicherte Änderungen im Weg) – bitte zusammenführen, bevor gearbeitet wird"
    ;;
  push)
    if ! git rev-parse -q --verify "origin/$branch" >/dev/null; then
      git push -q -u origin "$branch" 2>/dev/null || melde "Push von $branch fehlgeschlagen"
    elif [ "$(git rev-list --count "origin/$branch..HEAD")" -gt 0 ]; then
      git push -q origin "$branch" 2>/dev/null || melde "Push von $branch fehlgeschlagen (GitHub hat neuere Commits?) – erst pullen"
    fi
    offen=$(git status --porcelain | wc -l | tr -d ' ')
    [ "$offen" -gt 0 ] && melde "$offen Datei(en) nicht committet – noch nicht auf GitHub"
    ;;
esac
exit 0
