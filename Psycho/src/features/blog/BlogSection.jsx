import { useEffect, useState } from 'react'
import { CalendarDays, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { listBlogPosts } from './blogService'

export function BlogSection() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true

    async function loadPosts() {
      const result = await listBlogPosts()
      if (!alive) return

      setPosts(result.data || [])
      setStatus(result.error ? 'fallback' : 'ready')
    }

    loadPosts()

    return () => {
      alive = false
    }
  }, [])

  return (
    <section id="blog" className="border-t border-border/70 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Blog</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">Contenido pensado para SEO local</h2>
          </div>
          <span className="hidden text-sm text-muted md:inline-flex">
            {status === 'loading' ? 'Cargando articulos...' : 'Publicado desde Supabase'}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {post.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted">
                  {post.excerpt || post.content?.slice(0, 140) || 'Articulo disponible en Supabase.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
