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

- `/criancas/` — MSA Kids, estudo lúdico das 16 fases

- `/provas/` — Simulados do Programa Mínimo (20 / 50 / 60 questões)

> O módulo `/provas/` foi revisado para separar a definição/regra do MSA da explicação didática simplificada.


### Exportação de resultados
O módulo `/provas/` solicita nome, instrumento e comum/congregação antes da prova. No resultado, permite:
- baixar relatório completo em HTML;
- baixar respostas em CSV;
- imprimir ou salvar em PDF pelo navegador.
O relatório contém identificação do candidato, prova, data/hora, nota, acertos/erros/em branco e correção detalhada com resposta do candidato, resposta correta, definição/regra do MSA, explicação fácil e referência.


### Identificação e exportação de resultados

Antes de iniciar a prova, o candidato informa:
- nome completo;
- instrumento;
- comum/congregação.

Ao finalizar, o módulo mostra acertos, erros, questões em branco, percentual, desempenho por fase e correção detalhada. É possível:
- baixar um relatório completo em HTML;
- baixar as respostas em CSV;
- imprimir ou salvar o relatório como PDF pelo navegador.

O relatório exportado contém os dados do candidato, prova, data/hora, resposta do candidato, resposta correta, indicação de acerto/erro/em branco, definição/regra do MSA, explicação e referência.
