# Guia de uso da Ágora

## 1. Finalidade

O Ágora é um acervo pessoal e um ambiente de formação intelectual. Ele reúne livros, filmes, séries e jogos, permite registrar o que você está estudando e ajuda a transformar obras isoladas em notas, trilhas temáticas, sessões de foco e produção própria.

O aplicativo foi pensado para cinco movimentos:

1. **Reunir:** catalogar obras e manter ficha, status, avaliação e progresso em um só lugar.
2. **Lembrar:** registrar aprendizados e consultar a memória construída ao longo do tempo.
3. **Conectar:** aproximar obras, autores, interesses e perguntas por meio de trilhas e do grafo de conhecimento.
4. **Praticar:** organizar tarefas, foco, hábitos e sessões de estudo.
5. **Produzir:** elaborar registros, diários, ensaios, poemas e composições.

O Ágora não substitui a leitura, a pesquisa em fontes confiáveis nem a revisão acadêmica. Ele funciona como apoio para organizar e retomar seu percurso.

## 2. Para quem serve

O Ágora pode ser útil para:

- leitores que desejam organizar o próprio repertório;
- estudantes e pesquisadores que registram sínteses e referências;
- pessoas que estudam por temas e querem conectar diferentes mídias;
- quem deseja criar uma rotina de foco sem separar acervo, notas e tarefas em vários aplicativos;
- autores, poetas e compositores que querem manter rascunhos pessoais no navegador.

## 3. Início rápido

### Com uma conta

1. Na tela de entrada, selecione **Criar nova conta**.
2. Informe nome, e-mail e senha.
3. Se a confirmação de e-mail estiver habilitada, abra a mensagem enviada pelo serviço de autenticação e confirme o cadastro.
4. Entre com o e-mail e a senha.
5. Conclua a apresentação inicial informando somente o que desejar: perfil, interesses, objetivo, formatos preferidos, ritmo de estudo e contadores regressivos.
6. No **Início**, pressione **Adicionar** para catalogar a primeira obra.

Uma conta usa autenticação do Supabase e sincroniza os dados principais compatíveis entre dispositivos. Consulte [Contas, visitante e sincronização](#10-contas-visitante-e-sincronização) para saber exatamente o que fica na nuvem e o que permanece local.

### Como visitante

1. Na tela de entrada, pressione **Entrar como Visitante**.
2. Adicione obras normalmente e explore as áreas do aplicativo.
3. Exporte o que for importante antes de limpar os dados do navegador, usar outro dispositivo ou sair de uma sessão anônima.

No modo visitante, os registros permanecem no navegador atual. Eles não são enviados à conta nem migrados automaticamente se você criar uma conta depois.

### Primeiro percurso recomendado

1. Adicione uma obra e revise a ficha antes de salvar.
2. Abra a obra, ajuste seu status, avaliação e progresso.
3. Registre uma reflexão vinculada a ela.
4. Crie uma trilha com duas ou mais obras relacionadas.
5. Use a **Scholé** para realizar uma sessão de foco.
6. Retorne à **Memória** ou ao **Studium** para sintetizar o que aprendeu.

## 4. Navegação geral

- **Menu de três linhas:** abre todas as áreas, ajustes visuais e a exportação simples do acervo. Em telas pequenas, use este menu para chegar a áreas que não cabem na barra inferior.
- **Barra inferior:** oferece atalhos para as áreas mais usadas. No computador, ela também mostra Poíesis, Studium e Rotina.
- **Adicionar:** abre a busca externa e o cadastro de obras.
- **Busca do cabeçalho:** abre a consulta de catálogo para localizar e adicionar uma obra. Para pesquisar dentro do acervo já salvo, use **Explorar** ou `Ctrl+K`.
- **Guia da Ágora:** abre orientações e próximos passos calculados localmente a partir do acervo carregado. A ação separada **Analisar todas as obras** usa IA para criar lições vinculadas.
- **Perfil:** abre a personalização da conta e dos interesses.
- **Sair:** encerra a sessão atual.
- **`Ctrl+K` ou `⌘K`:** abre a paleta de comandos. Nela é possível navegar, adicionar uma obra ou localizar rapidamente um título do acervo.
- **`Esc`:** fecha a paleta e os principais diálogos abertos.

O indicador no cabeçalho pode mostrar **Salvo neste navegador**, **Sincronizando**, **Sincronizado** ou **Falha na sincronização**. Ele se refere aos dados principais da conta, não aos módulos exclusivamente locais.

## 5. Mapa das áreas

### Início

É a visão geral do percurso. Nela você encontra:

- quantidade de obras e itens em andamento;
- citação de abertura;
- trilhas em andamento;
- filtros por livros, filmes, séries, jogos e categorias personalizadas;
- catálogo do acervo;
- recomendações baseadas no perfil e no histórico do acervo.

Clique em uma capa para abrir a ficha detalhada. A categoria selecionada filtra o catálogo exibido. Categorias personalizadas criadas nessa tela são temporárias na versão atual e podem desaparecer ao recarregar o aplicativo.

### Explorar

Esta área pesquisa **somente o acervo já cadastrado**. A busca considera título, autor ou criador e texto da sinopse. Também é possível filtrar por avaliação mínima.

Use **Consultar Oráculo Externo** quando quiser procurar uma obra ainda não catalogada. A busca local de Explorar e a consulta externa são operações diferentes.

### Trilhas

As trilhas organizam obras em um percurso temático.

Em **Minhas trilhas**, você pode:

- criar uma trilha com nome, categoria, descrição e obras vinculadas;
- abrir uma trilha para editar seus dados;
- adicionar ou remover obras;
- registrar uma nota ligada a uma obra da trilha;
- acompanhar quantidade de conteúdos, notas e progresso;
- excluir a trilha mediante confirmação.

Em **Descobrir**, há modelos temáticos que podem ser copiados para suas trilhas. Um modelo só consegue vincular automaticamente obras correspondentes que já existam no acervo.

Ao adicionar ou remover obras pelo detalhe da trilha, o percentual é recalculado de acordo com quantas delas estão marcadas como **Concluído**. Alterar apenas o status de uma obra não recalcula imediatamente uma trilha já aberta; o percentual deve ser tratado como indicativo na versão atual.

### Memória

A Memória consolida notas, relações e indicadores do acervo. Ela possui quatro painéis:

- **Notas & Reflexões:** cria uma reflexão com tópico e vínculo a uma obra e exibe o histórico de sínteses.
- **Trilhas Personalizadas:** apresenta o mesmo conjunto de trilhas em um contexto de memória.
- **Grafo do Conhecimento:** forma nós a partir do perfil, interesses, obras, autores e trilhas. O grafo mostra relações derivadas dos dados cadastrados; não interpreta o conteúdo das obras.
- **Dashboard Analítico:** calcula totais, distribuição de mídias, atividade recente e uma estimativa de horas de imersão.

O cálculo de horas desse dashboard é uma estimativa baseada no tipo, status e progresso das obras. Ele não representa necessariamente o tempo cronometrado na Scholé.

O botão **Exportar Dossiê (PDF)** abre uma nova janela com uma versão para impressão. No diálogo do navegador, escolha **Salvar como PDF**. As referências são montadas com os metadados disponíveis e devem ser revisadas antes de uso acadêmico.

### Scholé

A Scholé é o espaço de foco e organização de tarefas. Ela possui três painéis:

- **Foco:** selecione uma tarefa, configure duração de foco, pausa e meta de ciclos, e inicie o cronômetro.
- **Tarefas:** crie tarefas com área, prioridade, estimativa, prazo e situação. Os cartões podem ser movidos entre **A cultivar**, **Em contemplação** e **Concluídas**.
- **Estatísticas:** mostra minutos concluídos, quantidade de sessões e ritmo dos últimos sete dias.

Uma sessão só entra nas estatísticas ao terminar completamente um ciclo de foco. Pausar ou reiniciar antes do fim não registra o ciclo como concluído.

O ambiente sonoro da Scholé aceita links válidos de vídeos ou playlists do YouTube. Algumas opções iniciais são apenas nomes de ambiente e não possuem link; adicione sua própria playlist para reproduzi-las. O navegador pode exigir um clique no player por causa das regras de reprodução automática.

### Rotina

Rotina reúne práticas diárias simples:

- uma intenção que funciona como norte do dia;
- hábitos como hidratação, movimento e leitura;
- sessões de treino com nome e duração;
- indicador de constância calculado pelas marcações atuais;
- atalho para iniciar uma sessão na Scholé.

As marcações de hábitos e treinos são separadas por data no navegador. A intenção permanece até ser alterada.

### Poíesis

Poíesis é a oficina local para **Poesia** e **Composições**. Cada criação possui título, conteúdo e data de atualização.

O editor oferece negrito, itálico, sublinhado, título, lista e citação. O texto é salvo automaticamente no navegador. O aplicativo também mantém até 15 cópias internas do catálogo e permite restaurar o rascunho mais recente.

Essas cópias são locais: não são um arquivo baixado, não ficam no Supabase e desaparecem se os dados do site forem apagados.

### Studium

Studium é o laboratório de trabalho intelectual. Ele possui seis áreas:

- **Lugares-comuns:** guarda citações, ideias, perguntas, argumentos, contradições, vocabulário e referências. Registros podem ser ligados a obras e entram em um sistema simples de revisão espaçada.
- **Diário:** registra o que foi estudado, compreendido, não compreendido, o que mudou e o próximo passo. Também registra sessões de leitura com duração, progresso e síntese.
- **Comparar:** coloca lado a lado até três obras do acervo, mostrando ficha, sinopse, temas e motivação.
- **Oficina:** organiza ensaios por título, tese, argumentos, objeções e desenvolvimento. É possível salvar e reabrir rascunhos e compartilhar pelo recurso nativo do dispositivo; quando ele não existe, o aplicativo baixa um arquivo Markdown.
- **Descobertas:** guarda obras, links ou perguntas para explorar. Uma pergunta orientadora pode criar uma trilha investigativa com obras encontradas no acervo por correspondência de palavras.
- **Arquivo:** reúne exportações, importação, lixeira e histórico de ações.

A trilha criada a partir de uma pergunta não usa IA para compreender semanticamente a frase: ela compara palavras da pergunta com títulos, sinopses e gêneros já cadastrados.

### Perfil

No Perfil, você pode:

- editar nome e biografia;
- usar uma imagem local ou uma URL para avatar e capa;
- cadastrar tags de interesse;
- manter contadores regressivos com nome e data;
- salvar as alterações;
- refazer a apresentação inicial;
- sair da conta.

Objetivo de descoberta, formatos preferidos e ritmo de estudo são definidos na apresentação inicial e ajudam a orientar recomendações. Refazer a apresentação permite revisá-los.

### Guia da Ágora

O Guia explica a finalidade do aplicativo e apresenta ações possíveis conforme o acervo carregado, como retomar uma obra, abrir a Scholé ou criar uma trilha.

As sugestões de percurso funcionam localmente, sem decisões automáticas, e usam regras simples baseadas em status, quantidade de obras e trilhas existentes. Para contas autenticadas, **Analisar todas as obras** consulta as fichas reais do acervo, gera duas lições concisas por obra com o Gemini, preserva as notas existentes e vincula cada resultado pelo identificador da obra. A operação é idempotente: executá-la novamente não deve duplicar as lições geradas pela mesma versão.

## 6. Fluxos principais

### Adicionar uma obra

1. Pressione **Adicionar** no Início ou na barra inferior.
2. Digite o título.
3. Selecione **Livro**, **Filme**, **Série** ou **Jogo**.
4. Pressione **Consultar Ficha Técnica**.
5. Revise título, autor ou criador, ano, capa e sinopse.
6. Registre, se desejar, a motivação, o status inicial, a nota, o progresso detalhado e obras recomendadas como pré-requisito.
7. Pressione **Confirmar e Catalogar no Acervo**.

Se a consulta falhar, use **Adicionar manualmente** e preencha os dados que tiver. O aplicativo evita adicionar outro item com o mesmo título normalizado; nesse caso, a obra existente é reutilizada.

### Atualizar uma obra e registrar aprendizados

1. Abra a capa no Início ou em Explorar.
2. Altere o status e a avaliação na parte superior da ficha.
3. Use **Editar Obra** para corrigir título, autor, ano, capa ou sinopse.
4. Na aba **Aprendizados**, informe um tópico e escreva a reflexão.
5. Salve o aprendizado.

Na mesma ficha, você pode gerar o dossiê para impressão ou excluir a obra. Ao excluir, a obra e suas notas vinculadas vão para a lixeira local do acervo.

### Criar e desenvolver uma trilha

1. Abra **Trilhas** e pressione **Nova Trilha**.
2. Informe nome, descrição e categoria.
3. Marque as obras que farão parte do percurso.
4. Salve e abra o cartão criado.
5. Use **Adicionar / Gerenciar Mídias** para alterar a seleção.
6. Use **Nova Nota** para registrar uma reflexão vinculada a uma das obras.
7. Mantenha o status das obras correto e considere o percentual da trilha como um indicador auxiliar.

O modal **Escolher ou Criar Trilha**, disponível no Início, também permite informar objetivo, pergunta central e projeto final.

### Realizar uma sessão de foco

1. Abra **Scholé** e depois **Tarefas**.
2. Crie ou selecione uma tarefa e mova-a para **Em contemplação**.
3. Volte a **Foco**.
4. Ajuste foco, pausa e ciclos no ícone de configuração, se necessário.
5. Inicie o cronômetro.
6. Ao terminar o ciclo, a sessão entra nas estatísticas e começa a pausa.

### Transformar estudo em produção

Um fluxo possível é:

1. registrar uma sessão e uma síntese no **Diário** do Studium;
2. separar conceitos no painel **Lugares-comuns**;
3. comparar até três obras;
4. desenvolver uma tese na **Oficina**;
5. salvar ou compartilhar o ensaio;
6. usar a **Poíesis** para uma produção literária ou musical livre.

## 7. Busca, recomendações e uso de IA

### Busca externa

A consulta de ficha técnica passa por uma Function da Vercel e pode usar:

- Google Books e Open Library para livros;
- iTunes Search para filmes, séries e jogos;
- Gemini, quando configurado, apenas para complementar identificação ou sinopse quando as fontes públicas não bastam.

O título e a categoria pesquisados são enviados ao servidor e às fontes necessárias. A busca retorna um resultado provável, não uma lista exaustiva.

### Recomendações

As recomendações usam interesses do perfil e sinais do acervo, como títulos, tipos, autores, gêneros, avaliações e status. A seleção é feita por regras sobre um catálogo curado, com consulta à Open Library para dados de livros quando disponível.

As recomendações não representam uma análise completa do gosto pessoal e podem repetir tradições, deixar formatos de fora ou não encontrar capa.

### Limites e cuidados

- A busca externa aceita apenas Livro, Filme, Série e Jogo na interface atual.
- Catálogos públicos podem trazer edição, ano, autor, imagem ou sinopse incorretos.
- O Gemini é opcional, pode ter limite de uso e também pode produzir imprecisões.
- Dados sem capa ou sinopse não significam que a obra não exista.
- Sempre revise a ficha antes de catalogar.
- Confirme datas, edições, autoria, citações e referências em uma fonte primária antes de trabalhos acadêmicos.
- As sugestões de percurso do **Guia da Ágora** não usam IA; somente a ação identificada como análise inteligente envia fichas bibliográficas ao Gemini.
- Referências ABNT, APA, Chicago, BibTeX e dossiês são gerados a partir dos dados cadastrados; eles não passam por validação bibliográfica automática.

## 8. Som e aparência

O controle **Adágio contemplativo**, no canto da tela, gera localmente um ambiente de piano clássico, cordas de câmara ou alaúde renascentista. É possível iniciar, pausar, silenciar e ajustar o volume. Esse áudio é diferente das playlists do YouTube da Scholé.

No menu lateral, em **Ambiente**, escolha entre os temas disponíveis. O **Modo de leitura** reduz distrações visuais. Tema, modo de leitura, instrumento e volume são preferências salvas apenas no navegador.

## 9. Backup, exportação e restauração

Nenhuma exportação atual reúne absolutamente todas as áreas em um único arquivo. Use o tipo adequado para cada finalidade:

| Recurso | O que contém | Como restaurar ou usar |
|---|---|---|
| **Menu → Exportar Backup** | Uma cópia JSON das obras do acervo | Serve como arquivo de segurança legível. A versão atual não oferece importação direta desse JSON pela mesma opção. |
| **Studium → Arquivo → CSV** | Dados principais das obras | Pode ser importado em Studium → Arquivo. A importação recupera campos bibliográficos básicos; nem todos os estados e notas são preservados. |
| **Studium → Arquivo → BibTeX** | Referências bibliográficas das obras | Pode ser usado em gerenciadores bibliográficos e também reimportado como registros básicos. |
| **Studium → Arquivo → Backup** | Registros internos do Studium | Pode ser restaurado em **Importar** selecionando o JSON exportado pelo Studium. Não inclui o restante do acervo, Scholé, Rotina ou Poíesis. |
| **Importar** | JSON do Studium, CSV, BibTeX ou RIS | JSON deve ter sido exportado pelo Studium; formatos bibliográficos criam obras com os campos que puderem ser reconhecidos. |
| **Poíesis → Restaurar último rascunho** | Última cópia interna do catálogo criativo | Restaura dentro do navegador atual; não cria arquivo externo. |
| **Memória/Ficha → Dossiê (PDF)** | Versão para impressão de notas e metadados | Use o diálogo de impressão para salvar em PDF. Não serve para reimportação. |

Itens excluídos do acervo podem ser restaurados em **Studium → Arquivo → Lixeira recuperável** no mesmo navegador. A lixeira de obras mantém itens por até 30 dias. Registros próprios do Studium enviados à lixeira também podem ser restaurados pelo painel Arquivo.

Antes de limpar cookies ou dados do site, trocar de navegador ou abandonar o modo visitante, faça as exportações relevantes. Os backups internos de Poíesis e os dados de Scholé e Rotina não têm exportação completa na versão atual.

## 10. Contas, visitante e sincronização

| Aspecto | Conta | Visitante |
|---|---|---|
| Entrada | E-mail e senha pelo Supabase | Sem cadastro |
| Acervo, aprendizados e trilhas | Cache local e sincronização com Supabase | Apenas no navegador atual |
| Perfil | Cache local e sincronização com Supabase | Alterações valem para a sessão atual e podem não permanecer após recarregar |
| Studium | Cache local e sincronização com Supabase | Apenas no navegador atual |
| Scholé, Rotina e Poíesis | Apenas no navegador atual | Apenas no navegador atual |
| Tema, modo de leitura e som | Apenas no navegador atual | Apenas no navegador atual |
| Uso em outro dispositivo | Dados sincronizados compatíveis podem ser recuperados após login | Não |
| Migração automática do visitante para conta | Não se aplica | Não existe na versão atual |

### Como a sincronização funciona

- O navegador mantém uma cópia local para carregamento e contingência.
- Em uma conta, Functions da Vercel autenticam a sessão e salvam coleções permitidas no Supabase.
- As políticas de segurança do banco associam cada registro ao identificador da conta.
- Se a rede falhar, o aplicativo tenta continuar com o cache local.
- Uma falha de sincronização não transforma automaticamente módulos locais em dados de nuvem.

Scholé, Rotina, Poíesis e preferências visuais usam armazenamento local não separado por conta. Pessoas que alternam contas no mesmo navegador podem ver os mesmos registros dessas áreas.

Evite editar a mesma conta simultaneamente em vários dispositivos: a sincronização atual salva coleções completas e não possui resolução colaborativa de conflitos campo a campo.

### Privacidade

- O modo visitante não envia o acervo para o Supabase, mas consultas externas ainda precisam enviar o título pesquisado às fontes de catálogo.
- Em uma conta, os dados sincronizados ficam no Supabase ligado à implantação do aplicativo.
- O Guia da Ágora calcula sugestões de percurso no navegador. Ao executar a análise inteligente, a ficha bibliográfica das obras é enviada pela Function autenticada da Vercel ao Gemini; as notas pessoais existentes não são incluídas no pedido ao modelo.
- Capas e imagens por URL são carregadas do endereço informado ou do catálogo externo.
- Ao reproduzir uma playlist, o navegador se comunica com o YouTube.
- Dados locais ficam no armazenamento do navegador e não devem ser tratados como armazenamento criptografado.

Não registre senhas, dados bancários, documentos pessoais ou outras informações sensíveis em notas, biografias, rascunhos ou sinopses.

## 11. Solução de problemas

### Não consigo criar conta ou entrar

- Verifique e-mail e senha.
- Após criar a conta, procure uma mensagem de confirmação, inclusive no spam.
- Se aparecer aviso de Supabase não configurado, o responsável pela implantação deve conferir as variáveis do projeto na Vercel. Enquanto isso, o modo visitante continua disponível.

### Meus dados não aparecem em outro dispositivo

- Confirme que entrou com a mesma conta.
- Aguarde o estado **Sincronizando** mudar para **Sincronizado**.
- Verifique a conexão e entre novamente se o estado indicar falha.
- Lembre-se de que Scholé, Rotina, Poíesis, som e aparência são locais e não aparecem em outro dispositivo.
- Dados criados como visitante não são incorporados automaticamente à conta.

### A busca não encontra a obra

- Confira a categoria escolhida.
- Tente o título original ou uma forma mais curta e específica.
- Verifique a conexão com a internet.
- Aguarde e tente novamente se uma fonte externa estiver indisponível.
- Use **Adicionar manualmente** e corrija a ficha depois.

### A ficha trouxe dados ou capa incorretos

Edite os campos antes de confirmar ou abra a ficha depois e use **Editar Obra**. Você pode substituir a capa por uma URL válida. Uma imagem externa pode deixar de aparecer se o site de origem remover ou bloquear o arquivo.

### A recomendação não combina comigo

Atualize interesses e preferências ao refazer a apresentação inicial, avalie suas obras e mantenha os status corretos. As recomendações são uma curadoria limitada, não uma avaliação definitiva do seu gosto.

### O som não inicia

- Interaja com a página e pressione reproduzir novamente; navegadores bloqueiam áudio automático.
- Confira o volume do Ágora, do navegador e do sistema.
- Na Scholé, use um link válido de vídeo ou playlist do YouTube.
- Se o início automático da playlist falhar, pressione reproduzir dentro do player incorporado.

### O PDF não abriu

Autorize janelas pop-up para o domínio do Ágora e tente novamente. Depois selecione **Salvar como PDF** na janela de impressão. Em celulares, a opção pode aparecer no menu de compartilhamento ou impressão do sistema.

### A importação falhou ou veio incompleta

- Use somente JSON exportado pelo próprio Studium ou arquivos CSV, BibTeX e RIS em formato compatível.
- Verifique se o CSV contém uma coluna `titulo`, `title` ou `name`.
- Revise os registros importados: o importador é básico e pode não compreender variantes complexas dos formatos.
- Status, avaliação, notas e progresso podem precisar ser refeitos após uma importação bibliográfica.

### Excluí uma obra por engano

Abra **Studium → Arquivo** e procure a obra na lixeira recuperável. Restaure-a antes de completar 30 dias e antes de limpar os dados do navegador.

### Perdi dados do modo visitante ou de uma área local

Dados locais podem ser removidos por limpeza do navegador, modo anônimo, políticas automáticas de armazenamento ou troca de dispositivo. Sem uma exportação compatível, eles podem não ser recuperáveis.

## 12. Boas práticas

- Revise cada ficha externa antes de salvá-la.
- Registre uma motivação ao adicionar uma obra; isso ajuda a lembrar por que ela entrou no percurso.
- Prefira notas curtas e específicas, vinculadas à obra correta.
- Use trilhas para perguntas reais, não apenas para agrupar títulos.
- Conclua ciclos da Scholé para manter estatísticas coerentes.
- Exporte periodicamente o acervo e o Studium.
- Mantenha cópias externas dos textos mais importantes da Poíesis.
- Revise referências e citações antes de publicar ou entregar trabalhos acadêmicos.
