/**
 * Minimal full-page loading fallback used by React.lazy() Suspense boundaries.
 * Matches the app's white content area — no layout shift when the chunk arrives.
 */
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <span
        className="block w-6 h-6 rounded-full border-2 border-[var(--mm-color-blue)] border-t-transparent animate-spin"
        aria-label="Loading…"
      />
    </div>
  )
}
