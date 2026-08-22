// Spec: src/components/Layout.jsx
//
// The header's Learn and Company groups carry the only site-wide links to
// /science, /blog, /about and /faq. They used to be mounted only once the
// dropdown was clicked, so a prerendered page (rendered with no interaction,
// exactly like the render below) contained none of them: the only header
// links a crawler saw were Instruments and Roles, and every blog index was
// left reachable only from the articles it itself links to.
//
// Rendered to static markup, no jsdom: that is the same snapshot the
// prerender takes, which is the whole point of the assertion.

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DropdownGroup } from '../Layout.jsx'

const closed = (children) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(DropdownGroup, { label: 'Learn' }, children),
    ),
  )

describe('Layout DropdownGroup', () => {
  it('keeps its links in the markup while the panel is closed', () => {
    const out = closed([
      createElement('a', { key: 's', href: '/science' }, 'Science'),
      createElement('a', { key: 'b', href: '/fr/blog' }, 'Blog'),
    ])
    expect(out).toContain('href="/science"')
    expect(out).toContain('href="/fr/blog"')
  })

  it('still hides the closed panel', () => {
    // display:none, so the links stay out of the tab order and out of the
    // accessibility tree until the reader opens the group.
    const out = closed(createElement('a', { href: '/faq' }, 'FAQ'))
    expect(out).toMatch(/class="[^"]*\bhidden\b[^"]*"/)
  })
})
