# F04: Bedienbarkeit mit Tastatur und Screenreader

## Ziel
Nach jeder Aktion weiß man mit Tastatur oder Screenreader, wo man ist und was passiert ist.

## Ausgangslage
- Jeder Bildschirm schreibt `el.innerHTML = …` neu (z. B. `src/ui/screens/wahlkampf.js`). Dabei verschwindet das fokussierte Element; der Fokus landet vermutlich auf `body`. **Zuerst nachprüfen**, nicht annehmen.
- Das Protokoll (`src/ui/components/protokoll.js`) wird mit neu gezeichnet; eine `aria-live`-Region gibt es nicht.
- Haushalt-Knöpfe haben schon `aria-label`.

## Vorab entscheiden (Nutzer fragen)
1. Wohin soll der Fokus nach einer Aktion: auf die Überschrift des Bildschirms (Vorschlag) oder auf den Knopf, der zuletzt gedrückt wurde, wenn es ihn noch gibt (z. B. +/− im Haushalt)?
2. Was wird angesagt: nur der neueste Protokolleintrag (Vorschlag) oder alle neuen Einträge der Aktion?

## Umsetzung
1. `index.html`: außerhalb von `#app` ein Element `<div id="ansage" aria-live="polite" class="nur-screenreader">`, CSS-Klasse zum visuellen Verstecken.
2. `src/ui/app.js` in `ausfuehren`: neue Ereignisse in `#ansage` schreiben.
3. Nach dem Zeichnen: `h1` bekommt `tabindex="-1"` und Fokus (nur nach einer Aktion, nicht beim ersten Laden).
4. Haushalt: innerhalb des Bildschirms (+/−) den Fokus auf denselben Knopf zurücksetzen (`data-key` + `data-dir` merken), sonst springt man bei jedem Klick nach oben.
5. Kontrast der Farben prüfen (`.rot`, `.ok`, gesperrte Partner `#888` auf Weiß ist knapp).

## Tests
Keine Unit-Tests nötig (UI). Prüfung von Hand, siehe unten.

## Im Browser prüfen
- Nur mit Tab/Enter eine Wahlkampfwoche spielen: Fokus bleibt sinnvoll.
- Haushalt: fünfmal „+“ per Tastatur, Fokus bleibt auf dem Knopf.
- Mit Screenreader (Windows: Sprachausgabe, Strg+Win+Enter) hören, ob das Ergebnis angesagt wird. **Das muss der Nutzer selbst machen.**

## Fertig, wenn
Beides von Hand geprüft und im Bericht genannt, was nicht geprüft werden konnte.

## Nicht enthalten
Kein Umbau weg von `innerHTML`, keine Bibliothek.
