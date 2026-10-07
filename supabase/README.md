# Portal MSA — GitHub Pages + Supabase

Esta versão registra dados sem criar conta de aluno.

## Arquitetura

- **GitHub Pages:** HTML, CSS e JavaScript.
- **localStorage:** cache, continuidade imediata e fila offline.
- **Supabase:** registros persistentes.
- **Identidade anônima:** `participant_id` + `access_token` gerados no navegador.
- **Código de continuidade:** permite recuperar a jornada em outro navegador/dispositivo.

## O que é registrado

### MSA Kids
- estado geral da jornada;
- atividades e campos digitados;
- marcação de atividade concluída/reaberta;
- respostas do desafio;
- resultado por fase, estrelas e XP;
- eventos de abertura/conclusão.

### Simulados
- início de cada tentativa;
- modalidade escolhida;
- respostas das questões;
- respostas limpas/alteradas;
- sessão em andamento para permitir continuar depois de fechar a página;
- resultado final: acertos, erros, brancos, percentual e resultado por fase;
- correção individual de cada questão.

O formulário atual do simulado mantém `nome`, `instrumento` e `comum/congregação` e esses valores entram no registro do resultado.

## Configuração

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute `01-schema.sql`.
3. No Supabase, abra **Connect** ou **Settings > API Keys**.
4. Copie:
   - Project URL;
   - **Publishable key** (`sb_publishable_...`).
5. Edite `/assets/js/supabase-config.js`:

```js
window.MSA_SUPABASE = {
  url: "https://SEU-PROJETO.supabase.co",
  publishableKey: "sb_publishable_..."
};
```

6. Suba os arquivos para o GitHub Pages.
7. Abra `/supabase/teste.html` pelo GitHub Pages e clique em **Testar gravação**.

## Segurança

As tabelas não concedem acesso direto para `anon`. O navegador chama apenas funções RPC `security definer` que validam `participant_id + access_token`.

Não use no frontend:
- `sb_secret_...`
- `service_role`

O código de continuidade funciona como credencial de recuperação. Quem possuir esse código pode assumir aquela jornada; portanto, não publique os códigos.

## Funcionamento offline

Se o Supabase estiver indisponível:
1. o site continua funcionando;
2. alterações ficam no `localStorage`;
3. as operações entram em uma fila;
4. quando a conexão volta, `portal-store.js` tenta sincronizar a fila.

## Consultas

Use `02-consultas-admin.sql` no SQL Editor para visualizar participantes anônimos, progresso infantil, simulados e eventos.

## Arquivos alterados

- `/criancas/index.html`
- `/provas/index.html`
- `/assets/js/supabase-config.js`
- `/assets/js/portal-store.js`

Arquivos de banco:
- `/supabase/01-schema.sql`
- `/supabase/02-consultas-admin.sql`
- `/supabase/teste.html`
