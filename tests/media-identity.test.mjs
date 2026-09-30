import test from 'node:test'
import assert from 'node:assert/strict'
import { sameMediaIdentity } from '../src/lib/mediaIdentity.ts'

test('books with a shared title and different authors can both be added', () => {
  assert.equal(sameMediaIdentity({ tipo: 'Livro', titulo: 'Poems', autor_criador: 'Emily Dickinson' }, { tipo: 'Livro', titulo: 'Poems', autor_criador: 'William Blake' }), false)
})
test('the same book is recognized across punctuation and accents', () => {
  assert.equal(sameMediaIdentity({ tipo: 'Livro', titulo: 'Memórias Póstumas', autor_criador: 'Machado de Assis' }, { tipo: 'Livro', titulo: 'Memorias postumas', autor_criador: 'Machado de Assis' }), true)
})
test('stable catalog identity survives a title edit and missing authors remain compatible', () => {
  assert.equal(sameMediaIdentity({ tipo: 'Livro', titulo: 'Meu título', fonte: 'agora:classic:gutenberg:150' }, { tipo: 'Livro', titulo: 'The Republic', fonte: 'agora:classic:gutenberg:150' }), true)
  assert.equal(sameMediaIdentity({ tipo: 'Livro', titulo: 'Dom Casmurro' }, { tipo: 'Livro', titulo: 'Dom Casmurro', autor_criador: 'Machado de Assis' }), true)
})
test('different movie editions and media formats remain separate', () => {
  assert.equal(sameMediaIdentity({ tipo: 'Filme', titulo: 'Dune', ano: 1984 }, { tipo: 'Filme', titulo: 'Dune', ano: 2021 }), false)
  assert.equal(sameMediaIdentity({ tipo: 'Livro', titulo: 'Dune' }, { tipo: 'Filme', titulo: 'Dune' }), false)
})
