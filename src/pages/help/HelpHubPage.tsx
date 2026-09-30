import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Download, FileText, Search, Wifi, WifiOff } from 'lucide-react'
import { helpCategories, helpTopics } from '../../data/helpTopics'
import { useApp } from '../../store/AppContext'
import { AlertBanner, Card, PageHeader, TextInput } from '../../components/ui'

export function HelpHubPage() {
  const { isOnline } = useApp()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return helpTopics
    return helpTopics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.blocks.some((b) => ('text' in b && b.text?.toLowerCase().includes(q)) || ('items' in b && b.items?.some((i) => i.toLowerCase().includes(q)))),
    )
  }, [query])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayuda y documentación"
        subtitle="Manual de usuario integrado. Disponible con o sin conexión a Internet."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-start gap-3">
            {isOnline ? (
              <Wifi className="shrink-0 text-success" size={28} aria-hidden />
            ) : (
              <WifiOff className="shrink-0 text-offline" size={28} aria-hidden />
            )}
            <div>
              <p className="text-xl font-extrabold">{isOnline ? 'Con conexión' : 'Sin conexión'}</p>
              <p className="font-semibold text-muted">
                {isOnline
                  ? 'Puede leer la ayuda, sincronizar datos y abrir el manual descargable.'
                  : 'Puede leer toda la ayuda y el manual descargable. La sincronización esperará a tener red.'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="flex items-center gap-2 text-xl font-extrabold">
            <Download size={24} aria-hidden />
            Documento para guardar
          </p>
          <p className="text-muted">
            Manual completo en un solo archivo HTML. Cópielo a la tableta o ábralo sin depender de la red (después de
            descargarlo una vez).
          </p>
          <a
            href="/docs/manual-usuario.html"
            download="manual-justicia-cercana.html"
            className="touch-target inline-flex items-center justify-center gap-2 rounded-xl border-2 border-forest bg-forest-soft px-5 py-3 font-bold text-forest hover:bg-forest/10"
          >
            <FileText size={20} />
            Descargar manual (HTML)
          </a>
        </Card>
      </div>

      {!isOnline ? (
        <AlertBanner tone="offline" title="Modo sin conexión">
          Este centro de ayuda no necesita Internet. Los temas siguientes se cargan desde la aplicación instalada en
          su navegador.
        </AlertBanner>
      ) : null}

      <Card>
        <label className="mb-3 flex items-center gap-2 font-extrabold" htmlFor="help-search">
          <Search size={22} aria-hidden />
          Buscar en la ayuda
        </label>
        <TextInput
          id="help-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej.: sincronizar, agenda, caso…"
          autoComplete="off"
        />
      </Card>

      <section aria-labelledby="help-manual-title">
        <h2 id="help-manual-title" className="mb-3 flex items-center gap-2 text-2xl font-extrabold">
          <BookOpen size={28} aria-hidden />
          Manual de usuario
        </h2>

        {helpCategories.map((cat) => {
          const topics = filtered.filter((t) => t.category === cat.id)
          if (topics.length === 0) return null
          return (
            <div key={cat.id} className="mb-6">
              <h3 className="mb-2 text-lg font-extrabold uppercase tracking-wide text-muted">{cat.label}</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => (
                  <li key={topic.slug}>
                    <Link
                      to={`/ayuda/${topic.slug}`}
                      className="flex h-full flex-col rounded-2xl border-2 border-line bg-paper p-4 transition hover:border-forest hover:bg-forest-soft/30"
                    >
                      <span className="text-lg font-extrabold text-forest">{topic.title}</span>
                      <span className="mt-1 flex-1 text-base font-semibold text-muted">{topic.summary}</span>
                      <span className="mt-3 text-sm font-bold text-forest">Leer →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {filtered.length === 0 ? (
          <p className="text-lg font-semibold text-muted">No hay resultados. Pruebe otras palabras.</p>
        ) : null}
      </section>

      {isOnline ? (
        <Card className="border-info bg-info-soft/40">
          <h3 className="text-lg font-extrabold text-info">Recursos en línea (opcional)</h3>
          <p className="mt-2 font-semibold text-muted">
            En un despliegue institucional aquí podrían enlazarse tutoriales en video, normas o soporte técnico del
            Poder Judicial. El manual integrado sigue siendo la referencia principal sin conexión.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
