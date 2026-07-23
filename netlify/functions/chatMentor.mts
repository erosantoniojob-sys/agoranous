import type { Config } from '@netlify/functions'

type ChatMessage = {
  sender: 'user' | 'mentor'
  text: string
  timestamp?: string
}

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Método não permitido.' }, { status: 405 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : []
    const lastUserMessage = [...messages].reverse().find((m) => m.sender === 'user')?.text || ''
    const query = lastUserMessage.toLowerCase().trim()

    let responseText = ''

    // Rule 3: Theology / Worldview check (6 functions model)
    if (query.includes('cosmovisao') || query.includes('cosmovisão') || query.includes('funcoes') || query.includes('funções') || query.includes('teologia')) {
      responseText = `Dentro da arquitetura de conhecimento do seu Segundo Cérebro, o modelo adotado de **Cosmovisão Teológica** é estruturado rigorosamente através de **6 funções fundamentais** (diferenciando-se de compêndios reducionistas):

1. **Função Ontológica (Metafísica):** Definição da realidade última, origem do Ser e natureza do Existir.
2. **Função Epistemológica:** Fundamentação da verdade, possibilidade do conhecimento e revelação.
3. **Função Antropológica:** Definição da natureza humana, dignidade, imagem e queda.
4. **Função Axiológica (Ética e Valores):** O padrão objetivo do Bem, da Moral e da ordem de virtudes.
5. **Função Teleológica:** A direção, intenção e propósito intrínseco da criação e da existência.
6. **Função Escatológica (Histórica):** O sentido da história, consumação dos tempos e destino final.

REFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT):
SIRE, James W. *O Universo ao Lado: um compêndio sobre cosmovisões*. Tradução de Paulo César de Oliveira. 5. ed. Brasília: Monergismo, 2018.`
    }
    // Rule 1: Dostoevsky check (Karamázov dynamics)
    else if (query.includes('dostoievski') || query.includes('dostoiévski') || query.includes('karamazov') || query.includes('karamázov') || query.includes('personagens')) {
      responseText = `Análise da obra *Os Irmãos Karamázov* de Fiódor Dostoiévski no acervo da Ágora:

A dinâmica dos três irmãos estrutura o paradigma clássico dos conflitos existenciais e morais do ser humano:
- **Dmitri (Mítia):** Encarna a paixão trágica, a sensualidade irrefreada e a busca angustiada pela redenção através do sofrimento.
- **Ivan:** Representa o intelectualismo niilista e racionalista. Autor da parábola do *Grande Inquisidor*, formula o dilema "se Deus não existe, tudo é permitido".
- **Aliócha (Alexei):** Personifica o amor ativo, a compaixão e a fé prática comunitária, inspirado na sabedoria do Staretz Zosima.

REFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT):
DOSTOIÉVSKI, Fiódor. *Os Irmãos Karamázov*. Tradução de Paulo Bezerra. 3. ed. São Paulo: Editora 34, 2012. 2 v.`
    }
    // Rule 2: Classical Philosophy check (Socrates, Plato, Nietzsche)
    else if (query.includes('platão') || query.includes('platao') || query.includes('sócrates') || query.includes('socrates') || query.includes('nietzsche') || query.includes('filosofia')) {
      responseText = `Síntese de Filosofia Clássica e Existencial conectada ao acervo do seu Segundo Cérebro:

- **Platão & Sócrates (*A República*):** Na célebre Alegoria da Caverna (Livro VII), Platão demonstra a ascensão dialética da opinião iludida (*doxa*) à contemplação das Idéias puras e do Bem inteligível (*episteme*).
- **Friedrich Nietzsche (*Assim Falou Zaratustra*):** Zaratustra anuncia a morte das ilusões metafísicas, propondo a *Vontade de Potência*, o *Eterno Retorno* e a superação moral no *Übermensch*.

REFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT):
PLATÃO. *A República*. Tradução de Maria Helena da Rocha Pereira. 9. ed. Lisboa: Fundação Calouste Gulbenkian, 2001.
NIETZSCHE, Friedrich. *Assim Falou Zaratustra: um livro para todos e para ninguém*. Tradução de Paulo César de Souza. São Paulo: Companhia das Letras, 2011.`
    }
    // Rule 4: Games / FIFA check
    else if (query.includes('fifa') || query.includes('ea sports') || query.includes('jogo') || query.includes('jogos')) {
      responseText = `Ficha técnica e análise da obra *EA Sports FC 24 (FIFA)* catalogada no seu acervo:

A simulação esportiva emprega o motor *HyperMotionV*, convertendo dados volumétricos de partidas reais em física e animações de alta fidelidade. O domínio tático exige coordenação espacial (formações 4-3-3 e 4-2-3-1), gestão de ritmos de jogo e aproveitamento dos *PlayStyles* individuais.

REFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT):
EA SPORTS FC 24. Desenvolvimento: EA Vancouver / EA Romania. Publicação: Electronic Arts, 2023. Jogo eletrônico (Plataforma PC/Consoles). Data de lançamento oficial: 29 set. 2023.`
    }
    else {
      responseText = `Consultando o acervo do seu Segundo Cérebro para "${lastUserMessage}":

Com base nos registros do seu perfil (obras de Dostoiévski, clássicos gregos, jogos de simulação e estudos de cosmovisão teológica), a estruturação contínua do conhecimento consolida a síntese entre percepção estética e discernimento reflexivo.

Para aprofundar um tema, consulte sobre a dinâmica de personagens em Dostoiévski, o modelo de 6 funções de cosmovisão, os diálogos socráticos ou táticas de simulação esportiva.

REFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT):
ÁGORA: SEGUNDO CÉREBRO. *Manual de Memória e Aprendizados*. Curadoria de Eros Antônio. Rio de Janeiro: Plataforma Netlify, 2026.`
    }

    return Response.json({
      reply: responseText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    })
  } catch (error) {
    console.error('chatMentor error:', error)
    return Response.json({ error: 'Erro ao processar consulta no Oráculo Mentor.' }, { status: 500 })
  }
}

export const config: Config = {
  path: ['/api/chatMentor', '/.netlify/functions/chatMentor'],
}
