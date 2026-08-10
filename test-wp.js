import { fetchPageBySlug, fetchPage } from './src/services/wordpressApi.js';

async function test() {
  const bySlug = await fetchPageBySlug('home-page-ml', { lang: 'ml' });
  console.log('By slug (home-page-ml):', bySlug ? bySlug.id : 'null');
  if (bySlug) console.log(bySlug.title.rendered);

  const byId = await fetchPage(465, { lang: 'ml' });
  console.log('By ID 465:', byId ? byId.id : 'null');
  if (byId) console.log(byId.title.rendered);
}

test().catch(console.error);
