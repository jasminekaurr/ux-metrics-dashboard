import { Children, isValidElement } from 'react'

/**
 * Flatten React children to a plain string.
 * Avoids Array.toString() commas when JSX interpolates multiple children
 * (e.g. `Hello {name}` becomes "Hello ,Name" with String(children)).
 */
function flattenChildrenText(node) {
  return Children.toArray(node)
    .map(child => {
      if (child == null || typeof child === 'boolean') return ''
      if (typeof child === 'string' || typeof child === 'number') return String(child)
      if (isValidElement(child)) return flattenChildrenText(child.props.children)
      return ''
    })
    .join('')
}

/** Character-stagger heading used across dashboard pages. */
export default function SplitText({ children, className }) {
  const text = flattenChildrenText(children)
  return (
    <h2 className={className} aria-label={text}>
      {text.split('').map((ch, i, arr) => (
        <span
          key={i}
          className="bq-split-char"
          style={{ transitionDelay: `${Math.round((i / arr.length) * 700)}ms` }}
          aria-hidden="true"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </h2>
  )
}
