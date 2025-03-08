# Translation Manager

Um gerenciador de traduções para aplicações i18n com integração MongoDB e tradução automática via IA.

![Translation Manager Screenshot](https://imgur.com/r2ijQkv.png)

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

## Estrutura do Projeto
```
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
```

## Obter Traduções por Idioma

```GET /api/i18n/{locale}```

Exemplo de resposta:
{
  "common.buttons.submit": "Submit",
  "common.buttons.cancel": "Cancel"
}

## Adicionar Tradução

```POST /api/translations```

Corpo da requisição:
{
  "key": "common.buttons.submit",
  "values": {
    "pt": "Enviar"
  }
}


### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/translation-manager.git
cd translation-manager
```
