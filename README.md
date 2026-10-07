# MSA — Portal de Estudos

Estrutura pronta para publicação no GitHub Pages.

## Estrutura

```text
msa-estudo/
├── index.html
├── msa/
│   └── index.html
├── solfejo/
│   └── index.html
├── assets/
│   ├── css/
│   │   └── site.css
│   └── js/
│       └── site.js
├── .nojekyll
└── README.md
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todo o conteúdo desta pasta para a raiz do repositório.
3. Acesse **Settings > Pages**.
4. Em **Build and deployment**, selecione:
   - **Source:** Deploy from a branch
   - **Branch:** main
   - **Folder:** / (root)
5. Salve.

A página inicial será `index.html`.

## Rotas

- `/` — Portal inicial
- `/msa/` — MSA completo
- `/solfejo/` — Solfejo

Não é necessário instalar dependências, Node.js, npm ou framework.
