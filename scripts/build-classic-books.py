"""Build the public editorial catalog, never personal user data.

Usage: python3 scripts/build-classic-books.py /tmp/pg_catalog.csv
Source: https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv
Uses the publisher's bulk metadata instead of crawling book pages.
"""
import collections
import csv
import json
from functools import lru_cache
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

@lru_cache(maxsize=200000)
def norm(value):
    return re.sub(r'[^a-z0-9 ]', '', unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower())

PHILOSOPHERS = '''Plato|Aristotle|Epictetus|Marcus Aurelius|Seneca|Cicero|Lucretius|Confucius|Laozi|Lao-tzu|Mencius|Chuang|Zhuang|Sunzi|Bacon, Francis|Descartes|Spinoza|Leibniz|Locke, John|Berkeley, George|Hume, David|Kant, Immanuel|Hegel|Fichte|Schelling|Schopenhauer|Nietzsche|Mill, John Stuart|Bentham|Hobbes|Rousseau|Voltaire|Diderot|Montesquieu|Machiavelli|More, Thomas|Wollstonecraft|Emerson, Ralph Waldo|Thoreau|James, William|Dewey, John|Peirce|Russell, Bertrand|Wittgenstein|Bergson|Santayana|Kropotkin|Marx, Karl|Engels|Smith, Adam|Burke, Edmund|Paine, Thomas|Du Bois, W. E. B.|Boethius|Bruno, Giordano|Montaigne|Schiller, Friedrich|Fénelon|Plutarch|Xenophon|Diogenes Laertius|Plotinus|Porphyry|Ramus|Vico|Comte|Spencer, Herbert|Sidgwick|Schleiermacher|Feuerbach|Kierkegaard|Froebel|Pestalozzi|Al-Farabi|Avicenna|Averroes|Tagore|Vivekananda|Radhakrishnan'''.split('|')
CHRISTIAN = '''South, Robert|Arndt|Boehme|Tauler|Suso|Bossuet|Massillon|Bourdaloue|Chalmers, Thomas|Finney|Bushnell|Channing, William|Martineau, James|Liddon|Drummond, Henry|Beecher, Henry|Dale, R. W.|Trench, Richard|Guthrie, Thomas|Bonar|Bounds|Torrey|Guyon|Fénelon|Fenelon|Newton, John|Rutherford, Samuel|Scougal|Moule|Traherne|Augustine|Thomas, à Kempis|Thomas Aquinas|Teresa, of Avila|John of the Cross|Thérèse|Francis, of Assisi|Francis, de Sales|Ignatius|Benedict|Bonaventure|Anselm|Athanasius|Chrysostom|Gregory, I|Gregory, of Nazianzus|Gregory, of Nyssa|Origen|Tertullian|Irenaeus|Justin|Eusebius|Clement|Cyprian|Ambrose|Bernard|Catherine|Julian, of Norwich|Rolle|Law, William|Taylor, Jeremy|Hooker, Richard|Luther, Martin|Calvin, Jean|Calvin, John|Melanchthon|Bunyan|Baxter, Richard|Owen, John, 1616|Edwards, Jonathan|Wesley, John|Wesley, Charles|Whitefield|Spurgeon|Murray, Andrew|Moody, Dwight|Chambers, Oswald|Ryle|Watson, Thomas,|Boston, Thomas|Flavel|Sibbes|Goodwin, Thomas|Brooks, Thomas|Watts, Isaac|Doddridge|Henry, Matthew|Fox, George|Penn, William|Woolman|Kempis|Brother Lawrence|Lawrence, of the Resurrection|Pascal|Kierkegaard|Kuyper|Bavinck|Warfield|Hodge|Machen|Newman, John Henry|Chesterton, G. K.|Belloc|MacDonald, George|Keble|Pusey|Kingsley, Charles|Newman, Francis|Butler, Joseph|Paley|Farrar, F. W.|Fosdick|Gore, Charles|Inge, William|Underhill|Faber, Frederick|Harnack|Schaff|Milman|Robertson, Frederick|Phillips Brooks|Brooks, Phillips|Selma|Tolstoy'''.split('|')
LITERARY = '''Austen|Brontë, Charlotte|Brontë, Emily|Brontë, Anne|Dickens, Charles|Hardy, Thomas|Eliot, George|Gaskell|Thackeray|Trollope, Anthony|Scott, Walter|Stevenson, Robert|Conrad, Joseph|Woolf, Virginia|Joyce, James|Forster, E. M.|Lawrence, D. H.|Mansfield|Wharton, Edith|Cather|Chopin, Kate|Gilman, Charlotte|Alcott, Louisa|Stowe|Douglass, Frederick|Jacobs, Harriet|Du Bois, W. E. B.|Twain|Melville, Herman|Hawthorne, Nathaniel|Poe, Edgar|Whitman, Walt|Dickinson, Emily|James, Henry|Crane, Stephen|London, Jack|Fitzgerald, F. Scott|Hemingway|Faulkner, William|Wells, H. G.|Verne|Doyle, Arthur Conan|Christie, Agatha|Sayers|Collins, Wilkie|Stoker|Shelley, Mary|Wilde, Oscar|Carroll, Lewis|Barrie|Baum, L. Frank|Montgomery, L. M.|Burnett, Frances Hodgson|Nesbit, E.|Potter, Beatrix|Kipling|Haggard, H. Rider|Dumas|Hugo, Victor|Balzac|Flaubert|Stendhal|Zola|Maupassant|Proust|France, Anatole|Sand, George|Gautier, Théophile|Mérimée|Daudet, Alphonse|Rabelais|Rostand|Molière|Racine|Corneille|La Fontaine|Baudelaire|Rimbaud|Verlaine|Mallarmé|Dostoyevsky|Dostoevsky|Tolstoy|Turgenev|Gogol|Chekhov|Pushkin|Lermontov|Gorky|Andreyev|Sologub|Goethe|Schiller, Friedrich|Heine, Heinrich|Hoffmann, E. T. A.|Kafka|Mann, Thomas|Hesse|Rilke|Novalis|Kleist|Fontane|Storm, Theodor|Grimm, Jacob|Grimm, Wilhelm|Cervantes|Calderón|Vega, Lope|Quevedo|Galdós|Blasco Ibáñez|Valera|Bécquer|Camões|Pessoa|Queirós|Castelo Branco|Almeida Garrett|Herculano|Dinis|Bocage|Quental|Cesário Verde|Machado de Assis|Alencar|Azevedo, Aluísio|Azevedo, Álvares|Barreto, Lima|Cunha, Euclides|Bilac|Castro Alves|Gonçalves Dias|Sousa, Cruz|Nabuco|Lobato|Rosa, João|Dante|Petrarca|Boccaccio|Ariosto|Tasso|Leopardi|Manzoni|Pirandello|Svevo|Collodi|Deledda|D'Annunzio|Verga|Sienkiewicz|Prus|Mickiewicz|Reymont|Čapek|Ibsen|Strindberg|Hamsun|Lagerlöf|Bjørnson|Andersen, H. C.|Pontoppidan|Kalevala|Lönnrot|Homer|Hesiod|Aeschylus|Sophocles|Euripides|Aristophanes|Virgil|Ovid|Horace|Catullus|Apuleius|Petronius|Aesop|Shakespeare|Marlowe, Christopher|Jonson|Webster, John|Shaw, Bernard|Synge|Yeats, W. B.|Gregory, Lady|Sheridan, Richard Brinsley|Goldsmith, Oliver|Milton|Bunyan|Donne|Herbert, George|Blake, William|Wordsworth|Coleridge, Samuel|Byron|Shelley, Percy|Keats|Tennyson, Alfred|Browning|Rossetti|Swinburne|Burns, Robert|Frost, Robert|Robinson, Edwin|Longfellow|Emerson, Ralph Waldo|Thoreau|Tagore|Kalidasa|Kālidāsa|Omar Khayyam|Saadi|Hafiz|Firdawsi|Rumi|Murasaki|Sei Shonagon|Natsume|Akutagawa|Hearn|Okakura|Li, Bai|Du, Fu|Wu, Cheng|Luo, Guan|Cao, Xue|Pu, Song|Guimarães, Bernardo|Patrocínio|Almeida, Manuel|Carolina|Rizal|Martí|Darío|Sarmiento|Hernández, José|Isaacs|Güiraldes|Matto|Gómez de Avellaneda|Equiano|Dunbar|Pauline Hopkins|Hopkins, Pauline|Fauset|Larsen, Nella|Toomer|McKay|Hurston|Johnson, James Weldon|Zitkala|Eastman, Charles|Oskison|Bryher|Richardson, Dorothy|Sinclair, May|Schreiner|Grand, Sarah|Ouida|Corelli|Braddon|Edgeworth|Burney|Radcliffe|Reeve, Clara|Smith, Charlotte|Behn|Cavendish|Montagu|de Staël|Staël|Lafayette|d'Aulnoy|Leprince|Grahame|Lang, Andrew|MacDonald, George|Chesterton, G. K.|Dunsany|Machen, Arthur|Blackwood|Bierce|Lovecraft|Howard, Robert|Burroughs, Edgar|Morris, William|Butler, Samuel|Meredith, George|Gissing|Bennett, Arnold|Walpole|Borrow|Peacock, Thomas|Defoe|Swift, Jonathan|Fielding, Henry|Fielding, Sarah|Sterne, Laurence|Smollett|Richardson, Samuel|Pepys|Boswell, James|Johnson, Samuel|Lamb, Charles|Hazlitt, William,|De Quincey|Ruskin|Carlyle|Irving, Washington|Cooper, James Fenimore|Bret Harte|Harte, Bret|O. Henry|Henry, O.|Dreiser|Norris, Frank|Sinclair, Upton|Lewis, Sinclair|Anderson, Sherwood|Masters, Edgar|Sandburg'''.split('|')

PORTUGUESE = '''Camões|Machado de Assis|Alencar|Azevedo|Barreto, Lima|Cunha, Euclides|Bilac|Castro Alves|Gonçalves Dias|Sousa, Cruz|Nabuco|Lobato|Pessoa|Queirós|Castelo Branco|Almeida Garrett|Herculano|Dinis|Bocage|Quental|Verde, Cesário|Guimarães, Bernardo|Almeida, Manuel|Patrocínio'''.split('|')

def matches(author, names):
    value = norm(author)
    return any(value == norm(name) or value.startswith(norm(name) + ' ') for name in names)

DISPLAY_NAMES = {'Thomas, à Kempis': 'Tomás de Kempis', 'Thomas, Aquinas': 'Tomás de Aquino', 'Augustine,': 'Agostinho de Hipona', 'Teresa, of Avila': 'Teresa de Ávila', 'Thérèse,': 'Teresa de Lisieux', 'Marcus Aurelius,': 'Marco Aurélio', 'More, Thomas': 'Thomas More', 'Catherine, of Siena': 'Catarina de Siena', 'Ignatius, of Loyola': 'Inácio de Loyola', 'Bernard, of Clairvaux': 'Bernardo de Claraval', 'Lawrence, of the Resurrection': 'Irmão Lourenço', 'Francis, de Sales': 'Francisco de Sales', 'Benedict,': 'Bento de Núrsia', 'Ambrose,': 'Ambrósio de Milão', 'Almeida Garrett,': 'Almeida Garrett'}

def author_name(raw):
    # Keep actual authors; translators, illustrators and editors are separate roles.
    names = []
    for entry in raw.split('; '):
        if '[' in entry:
            continue
        name = re.sub(r',?\s*\d.*$', '', entry).strip(' ,')
        parts = name.split(', ', 1)
        display = next((label for prefix, label in DISPLAY_NAMES.items() if entry.startswith(prefix)), None)
        names.append(display or ' '.join(reversed(parts)))
    return '; '.join(dict.fromkeys(names))

def group(row):
    author = row['Authors'].split(';')[0]
    locc = row['LoCC'].split('; ')
    if matches(author, CHRISTIAN) and any(x.startswith(('BR', 'BS', 'BT', 'BV', 'BX')) for x in locc):
        return 'Literatura cristã'
    if matches(author, PHILOSOPHERS) and (any(x in ('B','BC','BD','BJ','JC','HB','HM','LA','LB') or x.startswith(('B1','BF')) for x in locc) or 'Philosophy' in row['Bookshelves']):
        return 'Filosofia'
    if matches(author, LITERARY) and any(x.startswith('P') for x in locc):
        return 'Literatura'

def themes(row, category):
    text = norm(row['Subjects'] + ' ' + row['Bookshelves'])
    tags = [category]
    for words, label in [(['poetry','poems'], 'Poesia'), (['drama','plays'], 'Teatro'), (['short stories'], 'Contos'), (['novel','fiction'], 'Romance e ficção'), (['ethics','moral'], 'Ética'), (['politic','government'], 'Política e sociedade'), (['metaphysics','knowledge','logic'], 'Conhecimento e metafísica'), (['devotional','prayer','spiritual'], 'Espiritualidade'), (['theology','doctrine'], 'Teologia'), (['church history'], 'História do cristianismo'), (['apologetic'], 'Apologética'), (['mystic'], 'Mística'), (['adventure'], 'Aventura'), (['gothic','horror','ghost'], 'Gótico e fantástico'), (['science fiction'], 'Ficção científica'), (['slavery','african american','racism'], 'Escravidão e liberdade'), (['women','feminism'], 'Mulheres e sociedade'), (['brazil','brazilian'], 'Literatura brasileira'), (['portuguese'], 'Literatura portuguesa')]:
        if any(word in text for word in words):
            tags.append(label)
    return tags

# Alternative translations, excerpts and misattributed spirit writings found in review.
EXCLUDED_IDS = set('2489 8166 8167 66688 15492 5611 26073 6920 15877 55317 25830 31193 42083 7555 19833 64024 6763 17490 13871 72720 63486 69464 54495 72381 575 10661 31205 1001 1002 1003 1005 1006 1007 1008 8795 8799 8800 41537 53020 53791 53792 53793 53794 56041 60377'.split())

def build(path):
    pools = collections.defaultdict(list)
    seen = set()
    rows = list(csv.DictReader(open(path, encoding='utf-8-sig')))
    # Prefer Portuguese records, then the earliest complete digital edition.
    rows.sort(key=lambda r: (r['Language'] != 'pt', r['Text#'] not in {'55752', '54829', '67740', '1004'}, 'Best Books Ever Listings' not in r['Bookshelves'], 'Classics of Literature' not in r['Bookshelves'], int(r['Text#'])))
    for row in rows:
        if row['Text#'] in EXCLUDED_IDS or '[' in row['Authors'].split(';')[0] or '(Spirit)' in row['Authors']:
            continue
        if row['Type'] != 'Text' or row['Language'] not in ('pt','en') or not row['Authors']:
            continue
        native_portuguese = matches(row['Authors'].split(';')[0], PORTUGUESE)
        if (native_portuguese and row['Language'] != 'pt') or (not native_portuguese and row['Language'] != 'en'):
            continue
        category = group(row)
        if not category:
            continue
        title = re.sub(r'\s+', ' ', row['Title']).strip()
        # Do not inflate the catalog with individual volumes, excerpts or collected works.
        if re.search(r'\b(vol(?:ume)?[. ]|tomo|books? [ivx0-9]+\b|part [ivx\d]+\b|complete works|collected works|selected works|works of|selections from|v\. [0-9]|quotations|quotes and images|extracts|index of)', title, re.I):
            continue
        author = author_name(row['Authors'])
        if not author:
            continue
        key = norm(author.split(';')[0]) + ':' + norm(re.split(r'[;:\n]| — | -- ', row['Title'])[0]).removeprefix('the ').replace(' ', '')
        if key in seen:
            continue
        seen.add(key)
        pools[category].append((row, title, author, key))
    quotas = {'Literatura': 650, 'Filosofia': 200, 'Literatura cristã': 150}
    selected = []
    for category, quota in quotas.items():
        # Round robin by author: breadth before additional titles by prolific writers.
        authors = collections.defaultdict(list)
        for item in pools[category]:
            authors[item[2].split(';')[0]].append(item)
        chosen = []
        for index in range(13):
            for titles in authors.values():
                if index < len(titles):
                    chosen.append(titles[index])
                if len(chosen) == quota:
                    break
            if len(chosen) == quota:
                break
        print(category, 'available', len(pools[category]), 'authors', len(authors), 'selected', len(chosen))
        if len(chosen) != quota:
            raise ValueError(f'Insufficient curated records for {category}')
        for row, title, author, key in chosen:
            book_id = row['Text#']
            tags = themes(row, category)
            selected.append({'id': f'gutenberg:{book_id}', 'title': title, 'author': author,
                'category': category, 'themes': tags, 'language': row['Language'],
                'subjects': row['Subjects'].split('; '),
                'sourceUrl': f'https://www.gutenberg.org/ebooks/{book_id}',
                'cover': f'https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.cover.medium.jpg'})
    target = ROOT / 'src/data/classicBooks.json'
    target.write_text(json.dumps(selected, ensure_ascii=False, indent=2) + '\n')
    print('Wrote', len(selected), 'books to', target)

if __name__ == '__main__':
    build(sys.argv[1])
