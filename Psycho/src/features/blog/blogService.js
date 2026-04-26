import { supabase } from '../../lib/supabase'
import { fallbackBlogPosts } from '../../data/siteContent'

export async function listBlogPosts() {
  if (!supabase) {
    return { data: fallbackBlogPosts, error: null }
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id,title,slug,content,excerpt,image_url,created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (error || !data?.length) {
    return { data: fallbackBlogPosts, error }
  }

  return { data, error: null }
}
