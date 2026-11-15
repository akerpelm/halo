import { docPages } from '../docs/pages';

export function DocArticle({ slug }: { slug: string }) {
  const page = docPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`No docs page for ${slug}`);
  return (
    <article>
      <h1>{page.title}</h1>
      <p>{page.lede}</p>
      {page.body()}
    </article>
  );
}
