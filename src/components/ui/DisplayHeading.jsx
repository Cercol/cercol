/**
 * DisplayHeading - a heading rendered in the mm-design display family
 * (Playfair Display via --mm-font-display).
 *
 * Centralizes the repeated `style={{ fontFamily: 'var(--mm-font-display)' }}`
 * so call sites no longer carry the inline font style. Output is identical to
 * the previous markup: the same tag, the same className, the same font family.
 *
 * Pass the element via `as` (defaults to h2) and styling via className.
 */
export default function DisplayHeading({ as: Tag = 'h2', className = '', children, ...rest }) {
  return (
    <Tag className={className} style={{ fontFamily: 'var(--mm-font-display)' }} {...rest}>
      {children}
    </Tag>
  )
}
