import type { HelpBlock } from '../../data/helpTopics'
import { AlertBanner } from '../ui'

export function HelpArticleBody({ blocks }: { blocks: HelpBlock[] }) {
  return (
    <article className="help-article space-y-4 text-lg leading-relaxed">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'p':
            return (
              <p key={i} className="text-ink">
                {block.text}
              </p>
            )
          case 'h3':
            return (
              <h3 key={i} className="pt-2 text-xl font-extrabold text-ink">
                {block.text}
              </h3>
            )
          case 'ul':
            return (
              <ul key={i} className="list-disc space-y-2 pl-6 font-semibold text-ink">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="list-decimal space-y-2 pl-6 font-semibold text-ink">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            )
          case 'tip':
            return (
              <AlertBanner key={i} tone="success" title={block.title ?? 'Consejo'}>
                {block.text}
              </AlertBanner>
            )
          case 'offline':
            return (
              <AlertBanner key={i} tone="offline" title="Sin conexión — sí funciona">
                {block.text}
              </AlertBanner>
            )
          case 'online':
            return (
              <AlertBanner key={i} tone="info" title="Con conexión">
                {block.text}
              </AlertBanner>
            )
          default:
            return null
        }
      })}
    </article>
  )
}
