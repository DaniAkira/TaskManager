# Arquitetura

## Estrutura de pastas

```
firestore.rules            Regras de segurança (fonte da verdade das permissões)
firestore.indexes.json     Índice composto da tela de Concluídas
netlify.toml               Build, fallback de SPA e headers de segurança
public/theme-init.js       Aplica o tema antes do primeiro paint
src/
├── components/
│   ├── ui/                Átomos sem regra de negócio: Button, Modal, Menu, Field...
│   ├── shared/            Compostos do app: layout, guards, convites, formulário de painel
│   └── board/             Board: post-it, coluna, detalhe, formulário de tarefa
├── constants/             Status, prioridades, cores e limites
├── context/               Providers: auth, tema, toast, confirmação e workspace
├── hooks/                 Listeners e regras de interação (useTaskActions, useTaskDnd...)
├── pages/                 Telas de rota, carregadas sob demanda
├── services/              Único lugar que conhece o SDK do Firebase
├── styles/                Tokens de tema e estilo do post-it
└── utils/                 Funções puras e testadas
```

### Justificativa

- **Organização por tipo, com `board/` à parte.** Mantém a estrutura simples em um app deste porte. O domínio mais denso ganha uma pasta própria sem adotar feature folders em tudo.
- **`services/` isola o Firebase.** Componentes e páginas não importam o SDK. Trocar a estratégia de consulta, ou testar a UI com um backend falso, não toca nas telas.
- **Fluxo em uma direção.** `onSnapshot` entra por `useSubscription`, os componentes renderizam, as ações chamam `services/` e o resultado volta pelo listener. Não existe um segundo estado do servidor para sincronizar, por isso o app dispensa React Query e Redux.
- **`WorkspaceProvider`.** Abre um único listener de painéis e convites para o app inteiro, evitando leituras duplicadas.
- **Regras de negócio em hooks.** `useTaskActions` concentra o fluxo de finalizar, resetar, desfazer e excluir, usado pelo card, pelo detalhe e pelo formulário.

## Modelo de dados

```
boards/{boardId}
  name, description
  ownerId
  members: { [uid]: { role: 'owner' | 'editor' | 'viewer', email, name } }
  memberIds: [uid]
  createdAt, updatedAt

boards/{boardId}/groups/{groupId}
  name, color (#rrggbb)
  createdBy, createdAt, updatedAt

boards/{boardId}/tasks/{taskId}
  groupId
  title, description, note
  subtasks: [{ id, title, done }]
  dueDate: 'YYYY-MM-DD' | null
  priority: 1 | 2 | 3 | 4
  onComplete: 'archive' | 'reset'
  status: 'not_started' | 'in_progress' | 'paused' | 'blocked' | 'done'
  previousStatus: status | null
  order: number
  completedAt: timestamp | null
  createdBy, createdAt, updatedBy, updatedAt

invites/{boardId}_{email}
  boardId, boardName, email, role: 'editor' | 'viewer'
  status: 'pending' | 'accepted' | 'declined'
  invitedBy, invitedByName, createdAt, respondedAt
```

### Por que assim

| Decisão | Motivo | Custo aceito |
| --- | --- | --- |
| `members` (mapa) e `memberIds` (lista) | O mapa serve às Rules e à UI; a lista permite `array-contains` para listar os painéis do usuário | Dois campos para manter iguais; as Rules exigem que concordem |
| Tarefas em subcoleção do painel | Herdam o acesso do painel, e um board carrega só as próprias tarefas | Mover entre painéis exige copiar e excluir, feito em batch atômico |
| Cor só no grupo | Mudar a cor grava um documento, não todas as tarefas | O card precisa do grupo para renderizar, e o board já tem os grupos |
| Subtarefas embutidas | Abrir o card não gera leituras extras | Edições simultâneas no mesmo checklist: a última vence. Limite de 50 itens |
| Board escuta só `completedAt == null` | Concluídas não custam leituras até a tela ser aberta | `status` e `completedAt` precisam concordar, e as Rules exigem isso |
| `order` fracionário | Mover um card grava um documento | Reindexa a coluna nos raros casos em que a precisão acaba |
| `dueDate` como string | Prazo é data de calendário; `Timestamp` mudaria o dia em outro fuso | Nenhum relevante, o formato ordena bem |
| ID do convite determinístico | As Rules acham o convite pelo e-mail do token, e reconvidar não duplica | E-mails com `/` são recusados |
| Sem coleção `users` | O Auth já guarda o perfil, e não há busca pública de pessoas para abusar | Nome e e-mail ficam copiados em `members` e podem envelhecer |

## Permissões

| Ação | Dono | Editor | Visualizador | Convidado pendente |
| --- | --- | --- | --- | --- |
| Ver painel, grupos e tarefas | Sim | Sim | Sim | Não |
| Criar, editar, mover e excluir grupos e tarefas | Sim | Sim | Não | Não |
| Editar e excluir o painel | Sim | Não | Não | Não |
| Convidar, mudar papel e remover membros | Sim | Não | Não | Não |
| Sair do painel | Não | Sim | Sim | Não |
| Aceitar ou recusar convite (com e-mail verificado) | Não | Não | Não | Sim |

Decisões de segurança que valem nas Rules, não só na UI:

- **Tudo é negado por padrão**, e campos desconhecidos são recusados.
- **O dono não adiciona membros diretamente.** A entrada só acontece por convite aceito.
- **Aceite atômico.** O convite passa a `accepted` no mesmo batch que adiciona o membro, então não pode ser reutilizado após uma remoção.
- **E-mail verificado.** Ler ou aceitar convite exige `email_verified`; sem isso, bastaria criar conta com o e-mail de outra pessoa.
- **Erros de login genéricos**, para não revelar quais e-mails existem. O cadastro informa que o e-mail já existe, como pedido no requisito.
- **Recuperação de senha sem revelar contas.** A tela responde igual para qualquer e-mail. A nova senha é definida na página do próprio Firebase, que aplica a política de senha do projeto.
- **Texto salvo como foi digitado.** O React escapa na renderização e o app não usa `dangerouslySetInnerHTML`; escapar antes de salvar corromperia o conteúdo.

## Comportamentos definidos

- **Finalizar com "Concluir":** a tarefa sai do board e vai para Concluídas, com opção de desfazer.
- **Finalizar com "Resetar":** um modal pede confirmação. O status volta a "Não iniciada", as subtarefas são desmarcadas e o prazo é mantido. Cancelar mantém o status anterior.
- **Reverter uma concluída:** restaura o status que ela tinha antes de finalizar.
- **Detalhe da tarefa:** título, descrição, observação, status e subtarefas são editáveis na hora. Prazo, prioridade, grupo e comportamento ao finalizar exigem o botão "Editar tarefa", que dá acesso a tudo.
- **Excluir grupo:** remove também as tarefas dele, inclusive as concluídas.
- **Mover para outro painel:** arrastar para a barra que aparece durante o drag, ou usar "Mover para…" no detalhe. Exige permissão de edição nos dois painéis. A tarefa recebe o usuário que moveu como `createdBy`, porque as Rules exigem isso na criação.

## Trade-offs do plano Spark

- **Convite sem e-mail.** O convite aparece dentro do app. Enviar e-mail exigiria Cloud Functions, portanto o plano Blaze.
- **Cascata no cliente.** Excluir grupo ou painel roda em lotes no navegador, com o pai por último. Se a conexão cair no meio, o painel continua lá e basta repetir a exclusão.
- **Cache local no dispositivo.** A persistência do Firestore reduz leituras e é apagada ao sair. Com outra aba aberta a limpeza falha, e os dados ficam em cache até a próxima saída.

## Dependências

O `package.json` força `@grpc/grpc-js` para uma versão corrigida, porque o `@firebase/firestore` ainda traz uma com alertas de segurança. Esse pacote só é usado no build Node do SDK e não entra no bundle do navegador, então o `override` não muda o app publicado. Pode ser removido quando o Firebase atualizar a dependência.

## Escala

Um painel ativo custa uma leitura por tarefa na primeira carga, e depois só o que mudou. Os limites do desenho são confortáveis para uso pessoal e de equipes: 50 membros por painel e até 1 escrita por segundo sustentada em cada documento. A quota gratuita do Spark é de 50 mil leituras e 20 mil escritas por dia.
