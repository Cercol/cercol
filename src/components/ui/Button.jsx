/**
 * Button — shared button primitive.
 *
 * variant: primary | secondary | ghost | danger
 *   primary   — blue fill, white text, hover opacity
 *   secondary — white bg, blue border + text, hover fills blue
 *   ghost     — no bg/border, blue text, hover underline
 *   danger    — red fill, white text, hover opacity (destructive actions)
 *
 * size: sm | md | lg
 *
 * All variants: Roboto (body default), 4px border-radius, transition-colors.
 */
export default function Button({
  variant  = 'primary',
  size     = 'md',
  children,
  onClick,
  disabled,
  type     = 'button',
  className = '',
  ...rest
}) {
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-sm px-6 py-3',
  }

  const variants = {
    primary:   'bg-[var(--mm-color-blue)] text-white hover:opacity-90 disabled:opacity-50',
    secondary: 'bg-white border border-[var(--mm-color-blue)] text-[var(--mm-color-blue)] hover:bg-[var(--mm-color-blue)] hover:text-white disabled:opacity-50',
    ghost:     'text-[var(--mm-color-blue)] hover:underline disabled:opacity-50',
    danger:    'bg-[var(--mm-color-red)] text-white hover:opacity-90 disabled:opacity-50',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={[
        'font-semibold inline-flex items-center justify-center transition-colors rounded',
        sizes[size],
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
