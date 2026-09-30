# Coleção pública de livros clássicos

`classicBooks.json` é conteúdo editorial público, independente do acervo e do progresso dos usuários. A coleção aparece em **Explorar**; cada escolha entra no armazenamento e na sincronização já existentes da biblioteca pessoal.

- 1.000 registros: 650 de literatura, 200 de filosofia e 150 de literatura cristã.
- 31 edições em português e 969 em inglês. Os títulos conservam o idioma e a grafia da edição.
- Fonte bibliográfica: [catálogo CSV do Project Gutenberg](https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv), disponibilizado para reutilização conforme a [documentação de catálogos](https://www.gutenberg.org/ebooks/offline_catalogs.html).
- SHA-256 do CSV utilizado: `52cc0ffbef2b79d8d07fdd16dada95d29952f47ce21a1557598c580ee6188bea`.
- Capas: imagens das edições digitais, inclusive capas tipográficas geradas pelo Gutenberg. Não são identificadas como capas de primeiras edições.
- Cada ficha conserva o identificador, o link bibliográfico e os assuntos da fonte. A data de digitalização não é usada como ano original da obra. Não são geradas sinopses fictícias.

## Critérios

O importador cruza uma lista editorial de autores com as classes bibliográficas da fonte. Prioriza obras classificadas como clássicos e alguns títulos de referência, distribui a seleção por autor e exclui volumes avulsos, excertos, registros de colaboradores e duplicatas identificadas na revisão. A seleção não representa um ranking universal, nem todo o cânone mundial: reflete a disponibilidade do Gutenberg, predominantemente anterior ao século XX e em inglês. Coletâneas publicadas como livros permanecem elegíveis.

## Reprodução e verificação

```sh
curl --fail --location https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv -o /tmp/pg_catalog.csv
python3 scripts/build-classic-books.py /tmp/pg_catalog.csv
python3 scripts/verify-classic-covers.py /tmp/agora-cover-report.json
node --test tests/classic-books.test.mjs tests/media-identity.test.mjs
npm run check
```

A fonte é atualizada periodicamente; uma nova execução pode alterar a seleção. Revise o diff antes de adotá-la. A verificação remota exige resposta de imagem válida para as 1.000 capas, com concorrência limitada e novas tentativas. URLs externas podem mudar depois da verificação; a interface mantém o fallback visual acessível de `CoverImage`.
