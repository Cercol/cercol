// Spec: src/locales/de.json
//
// Zeuge is masculine (der Zeuge). The file shipped "Eine Zeuge/Zeugin",
// "Die Zeuge", "Jede Zeuge", "einer Zeuge" and "Eine ideale Zeuge": a German
// reader hit a grammar error every time the Witness appeared in the
// singular. The convention now is a Zeugen- compound when the referent is a
// thing, "Zeuginnen und Zeugen" when people are meant, and "Zeugin oder
// Zeuge" for a true singular.
import { describe, it, expect } from 'vitest'
import de from '../de.json'

const FLAT = JSON.stringify(de)

describe('German Witness grammar', () => {
  it('has retired the slash form, which could not be given an article', () => {
    for (const bad of ['Zeuge/Zeugin', 'Zeugen/Zeuginnen', 'Zeugin/Zeuge']) {
      expect(FLAT, bad).not.toContain(bad)
    }
  })

  it('does not use the star form, which this word cannot take', () => {
    // The star splices a feminine suffix onto a shared stem, so the form
    // would be Zeug*in, and "Zeug" on its own means stuff.
    expect(FLAT).not.toContain('Zeuge*in')
    expect(FLAT).not.toMatch(/Zeug\*innen?/)
  })

  it('never gives the masculine noun a feminine article', () => {
    for (const bad of [/\b[Ee]ine Zeuge\b/, /\b[Dd]ie Zeuge\b/, /\b[Jj]ede Zeuge\b/, /\beiner Zeuge\b/]) {
      expect(FLAT, String(bad)).not.toMatch(bad)
    }
  })

  it('names the instrument the way German names the other three', () => {
    // "Zeuge Cèrcol" is English word order in German words. The others are
    // "Cèrcol des Ersten Viertels", "Cèrcol des Vollmondes".
    expect(FLAT).not.toContain('Zeuge Cèrcol')
    expect(FLAT).toContain('Cèrcol des Zeugen')
  })

  it('never says observer, in any language', () => {
    expect(FLAT).not.toContain('Beobachter')
  })
})
