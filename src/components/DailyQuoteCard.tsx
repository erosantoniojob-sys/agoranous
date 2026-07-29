import React, { useState } from 'react'
import { Quote, RefreshCw, Sparkles, BookOpen } from 'lucide-react'
import dawnLandscape from '../assets/agora-dawn-landscape.jpg'

interface QuoteData {
  quote: string
  author: string
  source: string
  category: string
}

const CLASSICAL_QUOTES: QuoteData[] = [
  // Citações Originais
  {
    quote: 'A beleza salvará o mundo. O amor ativo é um trabalho árduo e assustador comparado ao amor passivo.',
    author: 'Fiódor Dostoiévski',
    source: 'Os Irmãos Karamázov',
    category: 'Literatura Clássica & Ética',
  },
  {
    quote: 'Tentei todas as coisas e, veja, em nenhuma delas encontrei a felicidade até que descansei na tua presença.',
    author: 'Santo Agostinho',
    source: 'Confissões',
    category: 'Teologia & Filosofia',
  },
  {
    quote: 'Não é que tenhamos pouco tempo, mas sim que perdemos muito. A vida é longa o suficiente se soubermos empregá-la.',
    author: 'Sêneca',
    source: 'Sobre a Brevidade da Vida',
    category: 'Filosofia Estoica & Hábitos',
  },
  {
    quote: 'A vida só pode ser compreendida olhando-se para trás, mas só pode ser vivida olhando-se para a frente.',
    author: 'Søren Kierkegaard',
    source: 'Diários',
    category: 'Filosofia Existencial',
  },
  {
    quote: 'A mente que se abre a uma nova ideia jamais voltará ao seu tamanho original.',
    author: 'Platão',
    source: 'A República',
    category: 'Filosofia Grega',
  },
  {
    quote: 'Somos o que fazemos repetidamente. A excelência, portanto, não é um ato, mas um hábito.',
    author: 'Aristóteles',
    source: 'Ética a Nicômaco',
    category: 'Hábitos & Ética',
  },
  {
    quote: 'A literatura e a arte revelam o transcendente onde o discurso comum silencia.',
    author: 'C.S. Lewis',
    source: 'O Peso da Glória',
    category: 'Teologia & Cosmovisão',
  },
  {
    quote: 'Aqueles que não conseguem lembrar o passado estão condenados a repeti-lo.',
    author: 'G.K. Chesterton',
    source: 'Ortodoxia',
    category: 'Filosofia & Crítica Social',
  },
  // 100 Novas Citações
  {
    quote: 'Você tem poder sobre a sua mente, não sobre os eventos externos. Perceba isso, e você encontrará a sua força.',
    author: 'Marco Aurélio',
    source: 'Meditações',
    category: 'Filosofia Estoica',
  },
  {
    quote: 'O coração tem razões que a própria razão desconhece.',
    author: 'Blaise Pascal',
    source: 'Pensamentos',
    category: 'Filosofia & Teologia',
  },
  {
    quote: 'Para quem tem fé, nenhuma explicação é necessária. Para quem não tem fé, nenhuma explicação é possível.',
    author: 'Tomás de Aquino',
    source: 'Suma Teológica',
    category: 'Teologia & Escolástica',
  },
  {
    quote: 'As coisas que amamos nos dizem quem somos.',
    author: 'Tomás de Aquino',
    source: 'Suma Teológica',
    category: 'Teologia & Ética',
  },
  {
    quote: 'Alegria é o negócio sério do paraíso.',
    author: 'C.S. Lewis',
    source: 'Cartas de um Diabo a seu Aprendiz',
    category: 'Teologia & Cosmovisão',
  },
  {
    quote: 'O homem não é nada mais do que aquilo que ele faz de si mesmo.',
    author: 'Jean-Paul Sartre',
    source: 'O Existencialismo é um Humanismo',
    category: 'Filosofia Existencial',
  },
  {
    quote: 'Quem tem um porquê para viver pode suportar quase qualquer como.',
    author: 'Friedrich Nietzsche',
    source: 'Crepúsculo dos Ídolos',
    category: 'Filosofia & Propósito',
  },
  {
    quote: 'Se queres a verdadeira liberdade, deves fazer-te servo da filosofia.',
    author: 'Epicuro',
    source: 'Cartas',
    category: 'Filosofia Grega',
  },
  {
    quote: 'Tudo flui, nada permanece.',
    author: 'Heráclito',
    source: 'Fragmentos',
    category: 'Filosofia Pré-Socrática',
  },
  {
    quote: 'A verdadeira sabedoria está em reconhecer a própria ignorância.',
    author: 'Sócrates',
    source: 'Apologia de Sócrates',
    category: 'Filosofia Grega',
  },
  {
    quote: 'A paciência é amarga, mas seu fruto é doce.',
    author: 'Jean-Jacques Rousseau',
    source: 'Emílio',
    category: 'Filosofia Iluminista',
  },
  {
    quote: 'A vida sem reflexão não vale a pena ser vivida.',
    author: 'Sócrates',
    source: 'Apologia de Sócrates',
    category: 'Filosofia Grega',
  },
  {
    quote: 'Sofremos mais na imaginação do que na realidade.',
    author: 'Sêneca',
    source: 'Cartas a Lucílio',
    category: 'Filosofia Estoica',
  },
  {
    quote: 'Não espere por líderes; faça sozinho, pessoa por pessoa.',
    author: 'Madre Teresa de Calcutá',
    source: 'Escritos e Cartas',
    category: 'Ética & Espiritualidade',
  },
  {
    quote: 'Não é o que acontece com você, mas como você reage que importa.',
    author: 'Epiteto',
    source: 'O Manual (Enchiridion)',
    category: 'Filosofia Estoica',
  },
  {
    quote: 'Onde há amor, há Deus.',
    author: 'Liev Tolstói',
    source: 'Onde Existe Amor, Deus Aí Está',
    category: 'Literatura Clássica & Teologia',
  },
  {
    quote: 'Todos pensam em mudar o mundo, mas ninguém pensa em mudar a si mesmo.',
    author: 'Liev Tolstói',
    source: 'Confissão',
    category: 'Filosofia & Mudança Pessoal',
  },
  {
    quote: 'Seja a mudança que você deseja ver no mundo.',
    author: 'Mahatma Gandhi',
    source: 'Escritos Sociais',
    category: 'Ética & Liderança',
  },
  {
    quote: 'A melhor maneira de se encontrar é perder-se a serviço dos outros.',
    author: 'Mahatma Gandhi',
    source: 'Autobiografia',
    category: 'Ética & Serviço',
  },
  {
    quote: 'Quanto mais eu leio, mais eu adquiro, mais eu estou certo de que não sei nada.',
    author: 'Voltaire',
    source: 'Cartas Filosóficas',
    category: 'Filosofia Iluminista',
  },
  {
    quote: 'Penso, logo existo.',
    author: 'René Descartes',
    source: 'O Discurso do Método',
    category: 'Filosofia Racionalista',
  },
  {
    quote: 'A dúvida é o princípio da sabedoria.',
    author: 'Aristóteles',
    source: 'Metafísica',
    category: 'Filosofia Grega',
  },
  {
    quote: 'Duas coisas me enchem a alma de crescente admiração: o céu estrelado sobre mim e a lei moral dentro de mim.',
    author: 'Immanuel Kant',
    source: 'Crítica da Razão Prática',
    category: 'Filosofia Moderna & Ética',
  },
  {
    quote: 'Age apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne lei universal.',
    author: 'Immanuel Kant',
    source: 'Fundamentação da Metafísica dos Costumes',
    category: 'Ética & Dever',
  },
  {
    quote: 'A paz não é a ausência de guerra, é uma virtude, um estado de espírito, uma disposição para a benevolência.',
    author: 'Baruch Spinoza',
    source: 'Tratado Político',
    category: 'Filosofia & Paz',
  },
  {
    quote: 'Se você quiser conhecer o caráter de um homem, dê-lhe poder.',
    author: 'Abraham Lincoln',
    source: 'Discursos',
    category: 'História & Liderança',
  },
  {
    quote: 'As fadas não ensinam às crianças que existem dragões. Elas ensinam que os dragões podem ser derrotados.',
    author: 'G.K. Chesterton',
    source: 'O Tremendo Trifles',
    category: 'Literatura & Imaginação',
  },
  {
    quote: 'Um livro deve ser o machado que quebra o mar gelado em nós.',
    author: 'Franz Kafka',
    source: 'Cartas',
    category: 'Literatura & Impacto',
  },
  {
    quote: 'O inferno são os outros.',
    author: 'Jean-Paul Sartre',
    source: 'Entre Quatro Paredes',
    category: 'Filosofia Existencial',
  },
  {
    quote: 'A liberdade é o que você faz com o que foi feito com você.',
    author: 'Jean-Paul Sartre',
    source: 'O Ser e o Nada',
    category: 'Filosofia Existencial',
  },
  {
    quote: 'No meio do inverno, aprendi que havia em mim um verão invencível.',
    author: 'Albert Camus',
    source: 'Retorno a Tipasa',
    category: 'Literatura & Resiliência',
  },
  {
    quote: 'Não ande atrás de mim; talvez eu não guie. Não ande na minha frente; talvez eu não siga. Apenas caminhe ao meu lado e seja meu amigo.',
    author: 'Albert Camus',
    source: 'Ensaios',
    category: 'Filosofia & Amizade',
  },
  {
    quote: 'Amedrontar-se perante o sofrimento é ser fraco. Desafiar o sofrimento, eis a coragem.',
    author: 'Fiódor Dostoiévski',
    source: 'O Idiota',
    category: 'Literatura & Resiliência',
  },
  {
    quote: 'Nada é mais sedutor para o homem do que sua liberdade de consciência, mas nada é uma causa maior de sofrimento.',
    author: 'Fiódor Dostoiévski',
    source: 'Os Irmãos Karamázov',
    category: 'Literatura Clássica & Ética',
  },
  {
    quote: 'Só conhecemos o que dominamos.',
    author: 'Goethe',
    source: 'Os Anos de Aprendizado de Wilhelm Meister',
    category: 'Literatura Alemã',
  },
  {
    quote: 'O talento forma-se no silêncio; o caráter, na corrente do mundo.',
    author: 'Goethe',
    source: 'Torquato Tasso',
    category: 'Literatura & Caráter',
  },
  {
    quote: 'Conhece-te a ti mesmo.',
    author: 'Oráculo de Delfos / Sócrates',
    source: 'Tradição Clássica',
    category: 'Filosofia Grega',
  },
  {
    quote: 'A glória não consiste em nunca cair, mas em erguer-se sempre.',
    author: 'Confúcio',
    source: 'Os Analectos',
    category: 'Filosofia Oriental',
  },
  {
    quote: 'Onde não há visão, o povo perece.',
    author: 'Rei Salomão',
    source: 'Provérbios',
    category: 'Sabedoria Bíblica',
  },
  {
    quote: 'Para tudo há uma ocasião certa, e um tempo certo para cada propósito debaixo do céu.',
    author: 'Eclesiastes',
    source: 'A Bíblia Sagrada',
    category: 'Sabedoria Bíblica',
  },
  {
    quote: 'Crer é um ato do intelecto que assente à verdade divina por império da vontade movida por Deus mediante a graça.',
    author: 'Tomás de Aquino',
    source: 'Suma Teológica',
    category: 'Teologia & Filosofia',
  },
  {
    quote: 'Deus não pede que compreendamos os Seus caminhos, mas que os aceitemos.',
    author: 'C.S. Lewis',
    source: 'A Anatomia de uma Dor',
    category: 'Teologia & Fé',
  },
  {
    quote: 'Eu acredito no Cristianismo como acredito que o sol nasceu. Não apenas porque o vejo, mas porque através dele eu vejo todo o resto.',
    author: 'C.S. Lewis',
    source: 'O Peso da Glória',
    category: 'Teologia & Cosmovisão',
  },
  {
    quote: 'Não me diga que a paz chegou, porque a paz é uma ilusão. O homem é feito para o combate.',
    author: 'G.K. Chesterton',
    source: 'O Homem que foi Quinta-Feira',
    category: 'Filosofia & Sociedade',
  },
  {
    quote: 'O que aprendemos com a história é que as pessoas não aprendem com a história.',
    author: 'Hegel',
    source: 'Filosofia da História',
    category: 'Filosofia & História',
  },
  {
    quote: 'Nem todos os que vagueiam estão perdidos.',
    author: 'J.R.R. Tolkien',
    source: 'O Senhor dos Anéis',
    category: 'Literatura Fantástica',
  },
  {
    quote: 'A coragem é encontrada em lugares improváveis.',
    author: 'J.R.R. Tolkien',
    source: 'O Senhor dos Anéis',
    category: 'Literatura & Virtude',
  },
  {
    quote: 'Ter fé é assinar uma folha em branco e deixar que Deus nela escreva o que quiser.',
    author: 'Santo Agostinho',
    source: 'Escritos Menores',
    category: 'Teologia & Fé',
  },
  {
    quote: 'O orgulho é a fonte de todos os pecados.',
    author: 'Santo Agostinho',
    source: 'A Cidade de Deus',
    category: 'Teologia & Ética',
  },
  {
    quote: 'Sábio é aquele que conhece os limites da própria ignorância.',
    author: 'Sócrates',
    source: 'Apologia de Sócrates',
    category: 'Filosofia Grega',
  },
  {
    quote: 'O conhecimento sem justiça deveria ser chamado de astúcia em vez de sabedoria.',
    author: 'Platão',
    source: 'Menéxeno',
    category: 'Filosofia Grega & Ética',
  },
  {
    quote: 'Podemos perdoar facilmente uma criança que tem medo do escuro; a real tragédia da vida é quando os homens têm medo da luz.',
    author: 'Platão',
    source: 'A República',
    category: 'Filosofia Grega',
  },
  {
    quote: 'A esperança é o sonho do homem acordado.',
    author: 'Aristóteles',
    source: 'Diogenes Laërtius',
    category: 'Filosofia Grega',
  },
  {
    quote: 'No meio do caminho desta vida me vi perdido numa selva escura, solitário, sem sol e sem saída.',
    author: 'Dante Alighieri',
    source: 'A Divina Comédia',
    category: 'Poesia Épica',
  },
  {
    quote: 'O amor que move o sol e as outras estrelas.',
    author: 'Dante Alighieri',
    source: 'A Divina Comédia (Paraíso)',
    category: 'Poesia & Teologia',
  },
  {
    quote: 'Ser ou não ser, eis a questão.',
    author: 'William Shakespeare',
    source: 'Hamlet',
    category: 'Literatura Inglesa',
  },
  {
    quote: 'Há mais coisas entre o céu e a terra, Horácio, do que sonha a nossa vã filosofia.',
    author: 'William Shakespeare',
    source: 'Hamlet',
    category: 'Literatura & Epistemologia',
  },
  {
    quote: 'A alegria está na luta, na tentativa, no sofrimento envolvido e não na vitória propriamente dita.',
    author: 'Mahatma Gandhi',
    source: 'Minha Experiência com a Verdade',
    category: 'Ética & Persistência',
  },
  {
    quote: 'Não corrigir as nossas falhas é o mesmo que cometer novos erros.',
    author: 'Confúcio',
    source: 'Os Analectos',
    category: 'Filosofia Moral',
  },
  {
    quote: 'Quem não sabe o que busca, não entende o que encontra.',
    author: 'Claude Bernard',
    source: 'Introdução ao Estudo da Medicina Experimental',
    category: 'Ciência & Filosofia',
  },
  {
    quote: 'A maior glória de viver não reside em nunca cair, mas em nos erguermos cada vez que caímos.',
    author: 'Nelson Mandela',
    source: 'Longo Caminho para a Liberdade',
    category: 'Liderança & Resiliência',
  },
  {
    quote: 'A verdadeira lágrima não é a que cai do olho e resvala pelo rosto, mas a que dói no coração e goteja na alma.',
    author: 'Machado de Assis',
    source: 'Memórias Póstumas de Brás Cubas',
    category: 'Literatura Brasileira',
  },
  {
    quote: 'Ao vencedor, as batatas.',
    author: 'Machado de Assis',
    source: 'Quincas Borba',
    category: 'Literatura Brasileira & Crítica Social',
  },
  {
    quote: 'Navegar é preciso; viver não é preciso.',
    author: 'Fernando Pessoa',
    source: 'Mensagem',
    category: 'Poesia & Existencialismo',
  },
  {
    quote: 'Tudo vale a pena se a alma não é pequena.',
    author: 'Fernando Pessoa',
    source: 'Mensagem',
    category: 'Poesia Portuguesa',
  },
  {
    quote: 'Só a arte nos permite sair de nós mesmos.',
    author: 'Marcel Proust',
    source: 'Em Busca do Tempo Perdido',
    category: 'Literatura Francesa',
  },
  {
    quote: 'Cada pessoa é um abismo; dá vertigem olhar para dentro.',
    author: 'Georg Büchner',
    source: 'Woyzeck',
    category: 'Literatura Clássica & Psicologia',
  },
  {
    quote: 'O homem nasceu livre, e por toda parte ele está acorrentado.',
    author: 'Jean-Jacques Rousseau',
    source: 'O Contrato Social',
    category: 'Filosofia Política',
  },
  {
    quote: 'Onde há vida, há esperança.',
    author: 'Cícero',
    source: 'Cartas a Ático',
    category: 'Filosofia Romana',
  },
  {
    quote: 'A amizade duplica as alegrias e divide as tristezas.',
    author: 'Francis Bacon',
    source: 'Ensaios',
    category: 'Filosofia & Relações Humanas',
  },
  {
    quote: 'Conhecimento é poder.',
    author: 'Francis Bacon',
    source: 'Meditationes Sacrae',
    category: 'Filosofia da Ciência',
  },
  {
    quote: 'Aquilo que não me mata me faz mais forte.',
    author: 'Friedrich Nietzsche',
    source: 'Crepúsculo dos Ídolos',
    category: 'Filosofia & Superação',
  },
  {
    quote: 'Não há fatos, apenas interpretações.',
    author: 'Friedrich Nietzsche',
    source: 'Vontade de Poder',
    category: 'Filosofia do Conhecimento',
  },
  {
    quote: 'Pobre de quem não tem paciência!',
    author: 'William Shakespeare',
    source: 'Otelo',
    category: 'Literatura Inglesa',
  },
  {
    quote: 'Nós somos feitos da matéria de que são feitos os sonhos.',
    author: 'William Shakespeare',
    source: 'A Tempestade',
    category: 'Literatura & Existencialismo',
  },
  {
    quote: 'O acaso favorece apenas a mente preparada.',
    author: 'Louis Pasteur',
    source: 'Discursos de Recepção',
    category: 'Ciência & Sabedoria',
  },
  {
    quote: 'A imaginação é mais importante que o conhecimento.',
    author: 'Albert Einstein',
    source: 'Cosmic Religion',
    category: 'Filosofia da Ciência',
  },
  {
    quote: 'Deus não joga dados com o universo.',
    author: 'Albert Einstein',
    source: 'Carta a Max Born',
    category: 'Ciência & Teologia',
  },
  {
    quote: 'Eu nunca ensino aos meus alunos; eu apenas tento fornecer as condições em que eles podem aprender.',
    author: 'Albert Einstein',
    source: 'Escritos e Cartas',
    category: 'Educação & Sabedoria',
  },
  {
    quote: 'Viver é desenhar sem borracha.',
    author: 'Millôr Fernandes',
    source: 'Frases',
    category: 'Humor & Filosofia',
  },
  {
    quote: 'Nós somos aquilo que escolhemos ser.',
    author: 'Søren Kierkegaard',
    source: 'O Desespero Humano',
    category: 'Filosofia Existencial',
  },
  {
    quote: 'Se as portas da percepção fossem purificadas, tudo apareceria ao homem como realmente é: infinito.',
    author: 'William Blake',
    source: 'O Matrimônio do Céu e do Inferno',
    category: 'Poesia & Misticismo',
  },
  {
    quote: 'Ver um mundo num grão de areia e um céu numa flor silvestre.',
    author: 'William Blake',
    source: 'Augúrios da Inocência',
    category: 'Poesia Romântica',
  },
  {
    quote: 'Não existe grandeza sem um pouco de loucura.',
    author: 'Sêneca',
    source: 'Sobre a Tranquilidade da Alma',
    category: 'Filosofia Estoica',
  },
  {
    quote: 'O homem mais poderoso é aquele que tem controle sobre si mesmo.',
    author: 'Sêneca',
    source: 'Epístolas',
    category: 'Filosofia Estoica & Domínio Próprio',
  },
  {
    quote: 'Trabalhe como se tudo dependesse de você. Reze como se tudo dependesse de Deus.',
    author: 'Santo Inácio de Loyola',
    source: 'Exercícios Espirituais',
    category: 'Teologia & Ética do Trabalho',
  },
  {
    quote: 'A humildade é a única base sólida para todas as virtudes.',
    author: 'Confúcio',
    source: 'Os Analectos',
    category: 'Sabedoria Oriental',
  },
  {
    quote: 'Ninguém entra no mesmo rio duas vezes, pois quando isso acontece já não se é o mesmo, assim como as águas.',
    author: 'Heráclito',
    source: 'Fragmentos',
    category: 'Filosofia Grega & Mudança',
  },
  {
    quote: 'Onde o amor impera, não há desejo de poder; e onde o poder predomina, há falta de amor.',
    author: 'Carl Jung',
    source: 'A Psicologia do Inconsciente',
    category: 'Psicologia & Ética',
  },
  {
    quote: 'Aquele que olha para fora, sonha. Mas o que olha para dentro, acorda.',
    author: 'Carl Jung',
    source: 'Cartas',
    category: 'Psicologia & Autoconhecimento',
  },
  {
    quote: 'Tudo o que nos irrita nos outros pode nos levar a um melhor entendimento sobre nós mesmos.',
    author: 'Carl Jung',
    source: 'Memórias, Sonhos, Reflexões',
    category: 'Psicologia & Reflexão',
  },
  {
    quote: 'Antes de curar alguém, pergunta-lhe se está disposto a desistir das coisas que o fizeram adoecer.',
    author: 'Hipócrates',
    source: 'Tradição Médica',
    category: 'Filosofia & Saúde',
  },
  {
    quote: 'O objetivo da vida é estar de acordo com a natureza.',
    author: 'Zeno de Cítio',
    source: 'Doutrina Estoica',
    category: 'Filosofia Estoica',
  },
  {
    quote: 'A riqueza não consiste em ter grandes posses, mas em ter poucas necessidades.',
    author: 'Epicuro',
    source: 'Pensamentos',
    category: 'Filosofia & Simplicidade',
  },
  {
    quote: 'Não chores porque já terminou, sorria porque aconteceu.',
    author: 'Gabriel García Márquez',
    source: 'Frases',
    category: 'Literatura Latino-americana',
  },
  {
    quote: 'A vida não é a que a gente viveu e sim a que a gente recorda, e como recorda para contá-la.',
    author: 'Gabriel García Márquez',
    source: 'Viver para Contar',
    category: 'Literatura & Memória',
  },
  {
    quote: 'Deus, dá-me a serenidade para aceitar as coisas que não posso mudar, coragem para mudar o que posso e sabedoria para distinguir entre ambas.',
    author: 'Reinhold Niebuhr',
    source: 'Oração da Serenidade',
    category: 'Teologia & Aceitação',
  },
  {
    quote: 'De todas as coisas que a sabedoria providencia para a felicidade da vida, a maior é a amizade.',
    author: 'Epicuro',
    source: 'Máximas Capitais',
    category: 'Filosofia & Relações',
  },
  {
    quote: 'Toda forma de vício é apenas uma recusa de nossa própria mortalidade.',
    author: 'Ernest Becker',
    source: 'A Negação da Morte',
    category: 'Filosofia & Psicologia',
  },
  {
    quote: 'O tempo é a substância do qual sou feito.',
    author: 'Jorge Luis Borges',
    source: 'Nova Refutação do Tempo',
    category: 'Literatura & Metafísica',
  },
  {
    quote: 'Nós somos o que fingimos ser, então devemos ter cuidado com o que fingimos ser.',
    author: 'Kurt Vonnegut',
    source: 'Mother Night',
    category: 'Literatura & Identidade',
  },
  {
    quote: 'Para aprender quem governa sobre você, simplesmente descubra quem você não tem permissão para criticar.',
    author: 'Voltaire',
    source: 'Ensaios Políticos',
    category: 'Filosofia Social',
  },
  {
    quote: 'Quando o poder do amor superar o amor pelo poder, o mundo conhecerá a paz.',
    author: 'Jimi Hendrix (atribuído a William Gladstone)',
    source: 'Cultura Popular',
    category: 'Música & Paz',
  },
  {
    quote: 'Não sabendo que era impossível, foi lá e fez.',
    author: 'Jean Cocteau',
    source: 'Dito Popular',
    category: 'Inspiração & Ação',
  },
  {
    quote: 'Só o silêncio é grande; o resto é fraqueza.',
    author: 'Alfred de Vigny',
    source: 'A Morte do Lobo',
    category: 'Literatura Francesa',
  },
  {
    quote: 'Quanto menos os homens pensam, mais eles falam.',
    author: 'Montesquieu',
    source: 'O Espírito das Leis',
    category: 'Filosofia Iluminista',
  },
  {
    quote: 'Onde há muita luz, as sombras são mais profundas.',
    author: 'Goethe',
    source: 'Götz von Berlichingen',
    category: 'Literatura Clássica',
  },
  {
    quote: 'Um viajante sábio nunca despreza a própria terra.',
    author: 'Carlo Goldoni',
    source: 'Pamela',
    category: 'Literatura Italiana',
  },
  {
    quote: 'Se você não disser a verdade sobre si mesmo, não pode contar sobre outras pessoas.',
    author: 'Virginia Woolf',
    source: 'Escritos Biográficos',
    category: 'Literatura & Honestidade',
  },
  {
    quote: 'Temos a arte para não morrer da verdade.',
    author: 'Friedrich Nietzsche',
    source: 'A Vontade de Poder',
    category: 'Filosofia & Arte',
  }
]

export const DailyQuoteCard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const currentQuote = CLASSICAL_QUOTES[currentIndex]

  const handleRefreshQuote = async () => {
    setIsLoading(true)
    try {
      // Rotate to next quote or fetch via chatMentor endpoint
      const nextIdx = (currentIndex + 1) % CLASSICAL_QUOTES.length
      await new Promise((r) => setTimeout(r, 300))
      setCurrentIndex(nextIdx)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="quote-landscape relative overflow-hidden border border-accent-gold/30 rounded-2xl p-6 sm:p-7 shadow-3d-deep transition-all group" style={{ backgroundImage: `url(${dawnLandscape})` }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#07131a]/98 via-[#0b1820]/88 to-[#0b1420]/20" />
      {/* Soft golden glow in the background */}
      <div className="absolute -right-12 -top-12 w-56 h-56 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-gold/15 transition-all" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top bar with category badge and AI generator button */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/15 text-accent-gold text-[11px] font-semibold uppercase tracking-wider border border-accent-gold/30 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <span>Citação Diária • {currentQuote.category}</span>
          </div>

          <button
            onClick={handleRefreshQuote}
            disabled={isLoading}
            className="p-2 text-text-secondary hover:text-accent-gold hover:bg-bg-base/60 rounded-xl border border-text-primary/10 hover:border-accent-gold/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Gerar / Alternar Citação Diária"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-accent-gold' : ''}`} />
            <span className="hidden sm:inline">Nova Citação</span>
          </button>
        </div>

        {/* Quote Text */}
        <div className="space-y-3 pt-1">
          <div className="relative pl-6 border-l-2 border-accent-gold/80">
            <Quote className="w-5 h-5 text-accent-gold/40 absolute -left-2.5 -top-2 fill-accent-gold/20" />
            <p className="font-serif italic text-lg sm:text-xl text-text-primary leading-relaxed drop-shadow-sm">
              "{currentQuote.quote}"
            </p>
          </div>

          {/* Author Citation */}
          <div className="flex items-center justify-between pt-2 border-t border-text-primary/10 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-accent-gold text-base">
                — {currentQuote.author}
              </span>
              <span className="text-text-secondary font-sans text-xs hidden sm:inline">
                ({currentQuote.source})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-accent-gold/80 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Oráculo Ágora</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
