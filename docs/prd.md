# Documento de Requisitos

## 1. Visão Geral da Aplicação

**Nome da Aplicação:** GamingHub

**Descrição:** Website completo de gaming que oferece sistema de clans, torneios competitivos, transmissões ao vivo, loja virtual e painel administrativo. A plataforma permite que jogadores se conectem, compitam, assistam streams e gerenciem suas experiências de jogo.

**Stack Técnica:** React + Vite, Tailwind CSS, Supabase (autenticação + banco de dados + storage)

**Design:** Dark theme gaming com cores escuras e acentos neon/vibrantes, responsivo para mobile e desktop

## 2. Usuários e Cenários de Uso

**Usuários-Alvo:**
- Jogadores que desejam participar de torneios e clans
- Streamers que transmitem conteúdo ao vivo
- Administradores que gerenciam a plataforma

**Cenários Principais:**
- Jogador se registra, entra em um clan e participa de torneios
- Usuário assiste streams ao vivo e interage via chat
- Jogador compra itens na loja usando moeda virtual
- Administrador gerencia usuários, torneios, clans e configurações do site

## 3. Estrutura de Páginas e Funcionalidades

### Estrutura de Páginas

```
GamingHub
├── Página de Login/Registro
├── Página Inicial
├── Página de Clans
│   ├── Listagem de Clans
│   └── Perfil de Clan
├── Página de Torneios
│   ├── Listagem de Torneios
│   └── Detalhes de Torneio
├── Página de Streams/Live
│   ├── Listagem de Streams
│   └── Visualização de Stream
├── Página de Loja
│   └── Carrinho de Compras
├── Página de Ranking
├── Página de Perfil de Usuário
└── Painel Admin
    ├── Dashboard
    ├── Gerenciamento de Ranks
    ├── Gerenciamento de Usuários
    ├── Gerenciamento de Torneios
    ├── Gerenciamento de Clans
    ├── Gerenciamento de Loja
    ├── Gerenciamento de Streams
    └── Configurações do Site
```

### 3.1 Página de Login/Registro

**Funcionalidades:**
- **Login:** Usuário insere email e senha para acessar a conta
- **Registro:** Usuário preenche formulário com email, senha e informações básicas para criar nova conta
- **Confirmação de Email:** Sistema envia email de verificação após registro, usuário confirma clicando no link
- **Recuperação de Senha:** Usuário solicita redefinição de senha por email, recebe link para criar nova senha
- **Conta Padrão:** USER: unzag, password: 12345

### 3.2 Menu de Navegação

**Funcionalidades:**
- Exibe botões para todas as seções: Início, Clans, Torneios, Streams/Live, Loja, Ranking, Perfil
- Exibe botão de Login quando usuário não está autenticado
- Exibe botão de Logout quando usuário está autenticado

### 3.3 Página Inicial

**Funcionalidades:**
- Exibe destaques de torneios em andamento
- Exibe streams ao vivo em destaque
- Exibe ranking dos top jogadores e clans

### 3.4 Página de Clans

#### 3.4.1 Listagem de Clans

**Funcionalidades:**
- Exibe lista de todos os clans com emblema, nome, número de membros
- Permite criar novo clan
- Permite buscar clans por nome

#### 3.4.2 Perfil de Clan

**Funcionalidades:**
- Exibe emblema, nome, descrição do clan
- Exibe lista de membros do clan
- Permite entrar no clan (se usuário não pertence a nenhum clan)
- Permite sair do clan (se usuário é membro)
- Permite editar informações do clan (se usuário é líder)

### 3.5 Página de Torneios

#### 3.5.1 Listagem de Torneios

**Funcionalidades:**
- Exibe lista de torneios com nome, data, status (aberto/em andamento/finalizado)
- Permite criar novo torneio
- Permite filtrar torneios por status

#### 3.5.2 Detalhes de Torneio

**Funcionalidades:**
- Exibe informações do torneio: nome, descrição, data, regras
- Exibe brackets/chaves do torneio
- Permite inscrição de jogador ou clan
- Exibe resultados e histórico de partidas

### 3.6 Página de Streams/Live

#### 3.6.1 Listagem de Streams

**Funcionalidades:**
- Exibe cards de streams ao vivo com thumbnail, título, nome do streamer, número de espectadores
- Permite buscar streams por título ou streamer

#### 3.6.2 Visualização de Stream

**Funcionalidades:**
- Exibe player de vídeo com stream ao vivo (embed)
- Exibe chat ao vivo onde usuários podem enviar mensagens
- Exibe informações do streamer e título da stream

### 3.7 Página de Loja

**Funcionalidades:**
- Exibe itens à venda com imagem, nome, preço em moeda virtual
- Permite adicionar itens ao carrinho
- Exibe carrinho de compras com itens selecionados e total
- Permite finalizar compra (deduz moeda virtual e adiciona itens ao inventário)
- Exibe histórico de compras do usuário

### 3.8 Página de Ranking

**Funcionalidades:**
- Exibe ranking global de jogadores com posição, nome, rank, XP, pontuação
- Exibe ranks com níveis (Bronze, Prata, Ouro, Platina, Diamante, etc.)
- Permite filtrar ranking por período (semanal/mensal/geral)

### 3.9 Página de Perfil de Usuário

**Funcionalidades:**
- Exibe avatar, banner, bio do usuário
- Exibe rank atual e XP
- Exibe clan atual (se pertence a algum)
- Exibe histórico de torneios participados
- Exibe conquistas desbloqueadas
- Exibe inventário de itens adquiridos
- Permite editar avatar, banner, bio (se é o próprio perfil)

### 3.10 Painel Admin

#### 3.10.1 Dashboard

**Funcionalidades:**
- Exibe estatísticas gerais: número total de usuários, clans, torneios, streams ativas
- Exibe gráficos de crescimento de usuários e atividade

#### 3.10.2 Gerenciamento de Ranks

**Funcionalidades:**
- Exibe lista de ranks existentes com nome, ícone, cor, requisito de XP
- Permite criar novo rank definindo nome, ícone, cor, requisito de XP
- Permite editar rank existente (nome, ícone, cor, requisito de XP)
- Permite deletar rank

#### 3.10.3 Gerenciamento de Usuários

**Funcionalidades:**
- Exibe lista de usuários com nome, email, rank, status (ativo/banido)
- Permite buscar usuários por nome ou email
- Permite editar informações de usuário
- Permite banir ou desbanir usuário
- Permite promover usuário a administrador
- Permite definir rank manualmente para usuário

#### 3.10.4 Gerenciamento de Torneios

**Funcionalidades:**
- Exibe lista de torneios com nome, data, status
- Permite criar novo torneio definindo nome, descrição, data, regras
- Permite editar torneio existente
- Permite cancelar torneio
- Permite gerenciar inscrições (aprovar/rejeitar)

#### 3.10.5 Gerenciamento de Clans

**Funcionalidades:**
- Exibe lista de clans com nome, número de membros, líder
- Permite buscar clans por nome
- Permite editar informações de clan
- Permite dissolver clan

#### 3.10.6 Gerenciamento de Loja

**Funcionalidades:**
- Exibe lista de itens da loja com nome, preço, imagem
- Permite criar novo item definindo nome, descrição, preço, imagem
- Permite editar item existente
- Permite deletar item
- Permite gerenciar preços

#### 3.10.7 Gerenciamento de Streams

**Funcionalidades:**
- Exibe lista de streams com título, streamer, status (pendente/aprovada/rejeitada)
- Permite aprovar ou rejeitar streams pendentes
- Permite destacar streams na página inicial

#### 3.10.8 Configurações do Site

**Funcionalidades:**
- Permite editar cores do tema: cor primária, cor secundária, cor de fundo
- Permite editar tipografia/fontes
- Permite editar textos, banners, logos do site
- Permite alternar entre modo claro e escuro
- Permite configurar configurações gerais do site

## 4. Regras de Negócio e Lógica

### 4.1 Sistema de Autenticação
- Usuário deve confirmar email antes de acessar funcionalidades completas
- Senha deve ser armazenada de forma segura
- Link de recuperação de senha expira após uso ou tempo determinado

### 4.2 Sistema de Clans
- Usuário só pode pertencer a um clan por vez
- Líder do clan pode editar informações e remover membros
- Clan deve ter no mínimo 1 membro (líder)
- Ao dissolver clan, todos os membros são removidos

### 4.3 Sistema de Torneios
- Inscrições fecham antes do início do torneio
- Brackets são gerados automaticamente após fechamento de inscrições
- Resultados são registrados após cada partida
- Torneio finalizado não pode ser editado

### 4.4 Sistema de Ranking
- XP é acumulado através de participação em torneios e atividades
- Rank é atualizado automaticamente quando usuário atinge requisito de XP
- Ranking global é atualizado em tempo real

### 4.5 Sistema de Loja
- Compra só é finalizada se usuário tiver moeda virtual suficiente
- Itens comprados são adicionados ao inventário imediatamente
- Histórico de compras é permanente

### 4.6 Sistema de Streams
- Stream deve ser aprovada por administrador antes de aparecer na listagem
- Chat ao vivo é moderado automaticamente
- Número de espectadores é atualizado em tempo real

### 4.7 Painel Admin
- Apenas usuários com permissão de administrador podem acessar
- Alterações em ranks afetam todos os usuários imediatamente
- Banimento de usuário impede login e acesso a todas as funcionalidades
- Configurações de tema são aplicadas globalmente para todos os usuários

## 5. Exceções e Casos Limite

| Situação | Comportamento Esperado |
|----------|------------------------|
| Usuário tenta fazer login sem confirmar email | Sistema exibe mensagem solicitando confirmação de email |
| Usuário tenta entrar em clan já estando em outro | Sistema exibe mensagem informando que deve sair do clan atual primeiro |
| Usuário tenta se inscrever em torneio após fechamento de inscrições | Sistema exibe mensagem informando que inscrições estão fechadas |
| Usuário tenta comprar item sem moeda virtual suficiente | Sistema exibe mensagem informando saldo insuficiente |
| Administrador tenta deletar rank que está sendo usado por usuários | Sistema exibe mensagem solicitando reatribuição de usuários antes de deletar |
| Usuário banido tenta fazer login | Sistema exibe mensagem informando que conta está banida |
| Stream é rejeitada por administrador | Streamer recebe notificação e stream não aparece na listagem |
| Clan é dissolvido por administrador | Todos os membros são notificados e removidos do clan |

## 6. Critérios de Aceitação

1. Usuário acessa página de registro, preenche formulário com email e senha, confirma email recebido e faz login com sucesso
2. Usuário autenticado navega até página de Clans, cria novo clan definindo nome e emblema
3. Usuário navega até página de Torneios, seleciona torneio aberto e realiza inscrição
4. Usuário navega até página de Streams, seleciona stream ao vivo e assiste com chat funcionando
5. Usuário navega até página de Loja, adiciona item ao carrinho e finaliza compra
6. Administrador acessa Painel Admin, navega até Gerenciamento de Usuários e define rank manualmente para um usuário
7. Administrador navega até Configurações do Site e altera cor primária do tema
8. Usuário visualiza seu perfil e confirma que rank, clan e inventário estão atualizados

## 7. Funcionalidades Não Implementadas Nesta Versão

- Sistema de notificações push
- Sistema de amizades entre usuários
- Sistema de mensagens privadas
- Sistema de conquistas automáticas
- Sistema de recompensas diárias
- Integração com plataformas de streaming externas (Twitch, YouTube)
- Sistema de moderação automática de chat
- Sistema de denúncias de usuários
- Sistema de pagamento real para moeda virtual
- Sistema de estatísticas detalhadas de jogador
- Sistema de replay de partidas
- Sistema de clipes de stream
- Modo espectador para torneios
- Sistema de patrocínios para clans
- Sistema de ligas e divisões
- Aplicativo mobile nativo