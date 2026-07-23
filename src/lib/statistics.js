const categoryKeys = {
  livro: 'totalLivros',
  filme: 'totalFilmes',
  serie: 'totalSeries',
  app: 'totalApps',
  aprendizado: 'totalAprendizados',
  jogo: 'totalJogos',
}

export function calculateLibraryStats(items, favoritesSet = new Set()) {
  const statistics = {
    totalObras: items.length,
    totalLivros: 0,
    totalFilmes: 0,
    totalSeries: 0,
    totalApps: 0,
    totalAprendizados: 0,
    totalJogos: 0,
    totalFavoritos: 0,
  }

  for (const item of items) {
    const statisticKey = categoryKeys[item.category]
    if (statisticKey) statistics[statisticKey] += 1
    if (favoritesSet.has(item.id)) {
      statistics.totalFavoritos += 1
    }
  }

  return statistics
}
