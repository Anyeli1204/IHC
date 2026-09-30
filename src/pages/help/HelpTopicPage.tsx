import { Link, Navigate, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { getHelpTopic, helpTopics } from '../../data/helpTopics'
import { HelpArticleBody } from '../../components/help/HelpArticleBody'
import { BackLink } from '../../components/AppLayout'
import { Button, Card, PageHeader } from '../../components/ui'

export function HelpTopicPage() {
  const { slug } = useParams()
  const topic = slug ? getHelpTopic(slug) : undefined

  if (!topic) return <Navigate to="/ayuda" replace />

  const index = helpTopics.findIndex((t) => t.slug === topic.slug)
  const prev = index > 0 ? helpTopics[index - 1] : null
  const next = index < helpTopics.length - 1 ? helpTopics[index + 1] : null

  function printPage() {
    window.print()
  }

  return (
    <div className="help-topic-page space-y-5">
      <BackLink to="/ayuda">Volver a ayuda</BackLink>
      <PageHeader
        title={topic.title}
        subtitle={
          <>
            <span className="font-bold text-muted">{topic.categoryLabel}</span>
            <span className="mx-2">·</span>
            {topic.summary}
          </>
        }
        actions={
          <Button type="button" tone="secondary" onClick={printPage}>
            <Printer size={20} aria-hidden />
            Imprimir / PDF
          </Button>
        }
      />

      <Card className="help-print-area">
        <HelpArticleBody blocks={topic.blocks} />
      </Card>

      <nav className="flex flex-wrap justify-between gap-3 border-t border-line pt-4 print:hidden" aria-label="Temas del manual">
        {prev ? (
          <Link to={`/ayuda/${prev.slug}`} className="font-extrabold text-forest hover:underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/ayuda/${next.slug}`} className="font-extrabold text-forest hover:underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </div>
  )
}
