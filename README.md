# Translation Manager

Um gerenciador de traduções para aplicações i18n com integração MongoDB e tradução automática via IA.

![Translation Manager Screenshot](https://sjc.microlink.io/UAor4SPHBrNxvkDEU9uSXs33R6XMdJBJFYM55AKOKxBGnoVjDU-QrcEZ-2QlXW54rV8VG08K_SyyH-6J0Dzo3g.jpeg)

## Sobre o Projeto

O Translation Manager é uma aplicação web desenvolvida com Next.js que permite gerenciar facilmente as traduções para internacionalização (i18n) de websites e aplicações. O sistema utiliza MongoDB para armazenar as traduções e integra-se com a API da Groq para tradução automática.

### Principais Características

- ✅ Interface intuitiva para gerenciar chaves e valores de tradução
- 🔒 Sistema de autenticação para proteger o acesso
- 🤖 Tradução automática de português para outros idiomas usando IA
- 📤 Exportação de traduções em formato JSON
- 📥 Importação de traduções de várias fontes
- 🔍 Busca e filtragem de traduções
- 🌐 Suporte para múltiplos idiomas (PT, EN, ES)

## Requisitos

- Node.js 18 ou superior
- MongoDB (local ou Atlas)
- Conta na Groq para a API de IA (opcional, mas recomendado para tradução automática)

## Personalização

### Gerenciando Idiomas

O sistema agora inclui um gerenciador de idiomas que permite adicionar, editar e remover idiomas suportados:

1. Acesse a página de gerenciamento de idiomas através do botão "Gerenciar Idiomas" no painel principal
2. Para adicionar um novo idioma:
   - Clique em "Adicionar Idioma"
   - Informe o código ISO do idioma (ex: 'fr' para francês)
   - Informe o nome do idioma (ex: 'Français')
   - Defina se o idioma estará ativo
   - Opcionalmente, defina como idioma padrão
3. Para editar um idioma existente, clique no ícone de edição
4. Para remover um idioma, clique no ícone de lixeira (não é possível remover o idioma padrão)

Os idiomas adicionados estarão disponíveis automaticamente em todo o sistema, incluindo:
- No gerenciador de traduções
- Na API de traduções
- No exemplo de implementação i18n
- Na tradução automática via IA

## Estrutura do Projeto
\`\`\`bash
├── app/                  # Rotas da aplicação (Next.js App Router)
│   ├── api/              # Endpoints da API
│   ├── login/            # Página de login
│   └── page.tsx          # Página principal
├── components/           # Componentes React
│   ├── ui/               # Componentes de UI (shadcn)
│   └── translation-manager.tsx  # Componente principal
├── lib/                  # Utilitários e funções
│   ├── auth.ts           # Lógica de autenticação
│   ├── mongodb.ts        # Conexão com MongoDB
│   └── clean-translation.ts  # Utilitário para limpar traduções
└── middleware.ts         # Middleware para autenticação

