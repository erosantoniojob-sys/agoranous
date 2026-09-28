import test from 'node:test'
import assert from 'node:assert/strict'
import { searchCatalog } from '../server/catalogSearch.ts'

test('rejects invalid searches before contacting providers', async () => {
  for (const body of [{ query: 'a', tipo: 'Filme' }, { query: 'test', tipo: 'Unknown' }, { query: 'x'.repeat(181), tipo: 'Livro' }]) {
    assert.equal((await searchCatalog(body)).status, 400)
  }
})
test('maps albums, expands artwork and removes duplicate provider entries', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ results: [1, 1].map(id => ({ collectionId: id, collectionName: 'Album', artistName: 'Artist', artworkUrl100: 'https://example.com/100x100bb.jpg', collectionViewUrl: 'https://music.apple.com/album/1' })) }))
  const data = await (await searchCatalog({ query: 'Album', tipo: 'Música' })).json()
  assert.equal(data.items.length, 1)
  assert.equal(data.items[0].url_capa, 'https://example.com/600x600bb.jpg')
  assert.equal(data.items[0].tipo, 'Música')
})
test('theatre searches dramatic texts and identifies edition covers', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    assert.match(url.searchParams.get('q'), /subject:drama/)
    return Response.json({ docs: [{ key: '/works/OL1W', title: 'Hamlet', cover_i: 42 }] })
  })
  const data = await (await searchCatalog({ query: 'Hamlet', tipo: 'Teatro' })).json()
  assert.match(data.items[0].sinopse, /não uma montagem/)
  assert.equal(data.items[0].url_capa, 'https://covers.openlibrary.org/b/id/42-L.jpg')
})
test('movie results exclude characters and franchise lists', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ query: { pages: [
    { pageid: 1, title: 'The Matrix', extract: 'The Matrix is a 1999 science fiction film.', index: 1, thumbnail: { source: 'https://example.com/poster.jpg' } },
    { pageid: 2, title: 'List of films', extract: 'The Matrix is a 1999 science fiction film.', index: 2 },
    { pageid: 3, title: 'Neo', extract: 'Neo is a fictional character.', index: 3 },
  ] } }))
  const data = await (await searchCatalog({ query: 'Matrix', tipo: 'Filme' })).json()
  assert.equal(data.items.length, 1)
  assert.equal(data.items[0].ano, 1999)
})
test('upstream failure produces an actionable error instead of invented results', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 429 }))
  const response = await searchCatalog({ query: 'Hamlet', tipo: 'Teatro' })
  assert.equal(response.status, 502)
  assert.match((await response.json()).error, /Tente novamente/)
})
