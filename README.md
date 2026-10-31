# Mural

Gerenciador de tarefas colaborativo em tempo real, com painéis compartilhados, grupos coloridos e post-its.

**Stack:** React 19, Vite 8, Tailwind CSS 4, Firebase (Auth + Firestore) e Netlify. Funciona no plano gratuito (Spark), sem Cloud Functions.

A arquitetura, o modelo de dados e os trade-offs estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). As regras de segurança estão em [firestore.rules](firestore.rules).

## Rodando localmente

Requisitos: Node 24 e uma conta Google.

### 1. Criar o projeto no Firebase

No [Console do Firebase](https://console.firebase.google.com):

1. Crie um projeto.
2. Em **Authentication > Sign-in method**, ative **E-mail/senha**.
3. Em **Authentication > Settings > Password policy**, exija ao menos 8 caracteres com maiúscula, minúscula e número. A validação do formulário é só para dar retorno ao usuário; quem garante a regra é esta política.
4. Em **Firestore Database**, crie o banco em **modo de produção**.
5. Em **Configurações do projeto > Seus apps**, registre um app Web e copie a configuração.

### 2. Configurar o ambiente

```bash
npm install
```

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores do passo anterior. Esses valores identificam o projeto e vão para o bundle; quem protege os dados são as Security Rules.

### 3. Publicar as regras e os índices

```bash
firebase login
```

```bash
firebase use --add
```

```bash
npm run deploy:rules
```

Sem este passo o app não funciona: o banco em modo de produção recusa tudo, e a tela de Concluídas depende do índice de `firestore.indexes.json`.

### 4. Iniciar

```bash
npm run dev
```

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | ESLint |
| `npm test` | Testes de unidade (Vitest) |
| `npm run deploy:rules` | Publica Rules e índices no Firebase |

## Deploy no Netlify

O front vai para o Netlify. O Firebase recebe apenas as Rules e os índices (`npm run deploy:rules`).

1. Envie o projeto para um repositório Git e importe-o no Netlify. Build e publicação já estão em [netlify.toml](netlify.toml).
2. Em **Site configuration > Environment variables**, cadastre as quatro variáveis `VITE_FIREBASE_*`.
3. Faça o deploy.
4. No Firebase, em **Authentication > Settings > Authorized domains**, adicione o domínio do site.

O `netlify.toml` também define o fallback de SPA e os headers de segurança (CSP, `X-Frame-Options` e outros).

## Antes de ir para produção

- [ ] Configurar um remetente próprio em **Authentication > Templates > SMTP settings**. O remetente padrão (`@<projeto>.firebaseapp.com`) costuma ser filtrado por Outlook, Hotmail e e-mails corporativos, e quem não recebe a confirmação não consegue aceitar convites.
- [ ] Ativar o **App Check** para reduzir abuso da API. Exige liberar o domínio do reCAPTCHA na CSP do `netlify.toml`.
- [ ] Traduzir os modelos de e-mail em **Authentication > Templates**.
- [ ] Rodar `npm audit`.
- [ ] Definir um alerta de orçamento, caso migre para o plano Blaze.

## Roteiro de validação das Rules

As Rules não têm testes automatizados, porque o emulador do Firestore exige Java. Este roteiro foi executado em 31/10/2026 no projeto real, com sucesso; repita-o sempre que alterar `firestore.rules`. Com duas contas, confirme:

1. O usuário B não abre a URL de um painel de A.
2. Com a conta B ainda **sem verificar o e-mail**, o convite não aparece.
3. Depois de verificar, B aceita o convite e o painel aparece para B em tempo real.
4. Como **Só visualiza**, B não consegue alterar nada.
5. Com a permissão **Pode editar**, B cria, move e exclui tarefas, mas não edita nem exclui o painel.
6. A remove B e o acesso cai na hora; B só volta com um novo convite.
7. Mover uma tarefa entre dois painéis exige permissão de edição nos dois.
