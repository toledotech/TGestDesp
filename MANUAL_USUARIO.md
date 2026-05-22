# Manual do Usuário — GestDesp
### Sistema de Gestão Empresarial para Despachantes

---

## Índice

1. [Introdução](#1-introdução)
2. [Primeiro Acesso e Login](#2-primeiro-acesso-e-login)
3. [Navegação Geral](#3-navegação-geral)
4. [Dashboard](#4-dashboard)
5. [Processos](#5-processos)
6. [Agenda](#6-agenda)
7. [Clientes](#7-clientes)
8. [Veículos](#8-veículos)
9. [Lojas](#9-lojas)
10. [Financeiro](#10-financeiro)
11. [Prazos](#11-prazos)
12. [Relatórios](#12-relatórios)
13. [Notificações](#13-notificações)
14. [Assinatura](#14-assinatura)
15. [Configurações e Usuários](#15-configurações-e-usuários)
16. [Meu Perfil](#16-meu-perfil)
17. [Perfis de Acesso](#17-perfis-de-acesso)

---

## 1. Introdução

O **GestDesp** é um sistema de gestão desenvolvido especialmente para despachantes automotivos. Ele permite controlar processos de clientes, gerenciar documentação, acompanhar prazos, controlar o financeiro e gerar relatórios gerenciais — tudo em um único lugar, acessível pelo navegador de qualquer computador ou celular.

### Principais funcionalidades:
- Gestão completa de processos (transferências, licenciamentos, DUT, multas etc.)
- Kanban visual de andamento dos processos
- Cadastro de clientes, veículos e lojas parceiras
- Controle financeiro com receitas e despesas
- Sistema de crédito entre despachante e lojas
- Relatórios por período, cliente, serviço e loja
- Controle de prazos e alertas de vencimento
- Multi-usuário com diferentes níveis de acesso

---

## 2. Primeiro Acesso e Login

### Acessando o sistema

1. Abra o navegador e acesse o endereço fornecido pelo administrador
2. Você verá a tela de login com as abas **Entrar** e **Criar conta**

### Fazendo login

1. Na aba **Entrar**, informe seu **e-mail** e **senha**
2. Clique em **Entrar**
3. Se as credenciais estiverem corretas, você será redirecionado ao Dashboard

### Primeiro cadastro (apenas administradores)

Caso seja o primeiro acesso ao sistema:

1. Clique na aba **Criar conta**
2. Preencha: **Nome completo**, **E-mail** e **Senha** (mínimo 6 caracteres)
3. Clique em **Criar conta**
4. O sistema criará seu perfil automaticamente

> **Obs.:** Funcionários não criam conta própria. O administrador cria os usuários em **Configurações → Usuários**.

### Esqueci minha senha

Caso esqueça a senha, entre em contato com o administrador do sistema, que poderá redefini-la em **Configurações**.

---

## 3. Navegação Geral

### Barra lateral (menu)

O menu fica no lado esquerdo da tela e pode ser recolhido clicando no ícone ☰ no topo.

| Ícone | Módulo | Disponível para |
|-------|--------|-----------------|
| 🏠 | Dashboard | Todos |
| 📄 | Processos | Todos |
| 📅 | Agenda | Todos |
| 👥 | Clientes | Todos |
| 🚗 | Veículos | Todos |
| 🏪 | Lojas | Administrador |
| 💰 | Financeiro | Administrador |
| ⚠️ | Prazos | Todos |
| 📊 | Relatórios | Administrador |
| 🔔 | Notificações | Todos |
| 💳 | Assinatura | Administrador |
| 📦 | Gerenciar Planos | Super Admin |
| ⚙️ | Configurações | Administrador |

### Barra superior (header)

- **Ícone de sino (🔔)**: exibe notificações não lidas
- **Ícone de usuário (👤)**: menu com acesso ao **Meu Perfil** e opção de **Sair**
- **Nome e perfil**: exibidos abaixo do título do sistema

---

## 4. Dashboard

O Dashboard é a tela inicial e apresenta um resumo geral do negócio.

### O que você vê:

- **Processos do mês**: quantidade de processos criados no mês atual
- **Processos concluídos**: total de processos finalizados
- **Valor total em aberto**: soma dos valores de processos em andamento
- **Alertas de prazo**: processos próximos do vencimento

### Como usar:

O Dashboard é informativo — você não executa ações nele, apenas visualiza o panorama geral. Para detalhes, acesse cada módulo pelo menu lateral.

---

## 5. Processos

O módulo de **Processos** é o coração do sistema. Aqui são registrados e acompanhados todos os serviços prestados.

### Visão Kanban

Os processos são exibidos em colunas por status:

| Coluna | Significado |
|--------|-------------|
| **Recebido** | Documentação entrou, aguarda conferência |
| **Em Conferência** | Documentos sendo verificados |
| **No DETRAN** | Processo entregue ao DETRAN |
| **Aguardando Pagamento** | Pendente de pagamento de taxa/boleto |
| **Concluído** | Serviço finalizado |

> Você pode **arrastar** o card do processo de uma coluna para outra para atualizar o status.

### Criando um novo processo

1. Clique no botão **Novo Processo** (topo direito)
2. Preencha os campos:

   **Cliente**
   - Selecione um cliente existente **ou** clique em **Novo Cliente** para cadastrar na hora
   - Informe: Nome, CPF/CNPJ, Telefone, E-mail, Endereço

   **Veículo**
   - Selecione um veículo do cliente **ou** clique em **Novo Veículo**
   - Informe: Marca, Modelo, Ano, Placa, Chassi, RENAVAM

   **Loja / Origem**
   - Selecione a loja que indicou o cliente (opcional)
   - Caso não tenha, deixe como "Nenhuma"

   **Valor DUT (R$)**
   - Valor do DUT (Documento Único de Transferência) pago ao DETRAN
   - Preencha se aplicável ao tipo de serviço

   **Valor Boleto (R$)**
   - Valor do boleto bancário emitido para o processo
   - Preencha se aplicável

   **Tipo de Serviço**
   - Transferência de Propriedade
   - Licenciamento Anual
   - 2ª Via CRV
   - Comunicação de Venda
   - IPVA
   - Multas
   - Outros

   **Status**: situação inicial (normalmente "Recebido")

   **Valor (R$)**: valor cobrado pelo serviço de despachante

   **Prazo**: data limite para conclusão

   **Observações**: informações adicionais relevantes

   **Documentos Recebidos**: marque os documentos que já foram entregues pelo cliente

3. Clique em **Criar Processo**

### Editando um processo

1. No kanban, clique no card do processo **ou** no ícone de opções (⋯) → **Editar**
2. Altere os campos necessários
3. Clique em **Salvar Alterações**

### Excluindo um processo

1. No card do processo, clique em ⋯ → **Excluir**
2. Confirme a exclusão na janela de diálogo

> ⚠️ **Atenção**: a exclusão é permanente e não pode ser desfeita.

### Filtrando processos

Use os filtros no topo da página:
- **Busca por texto**: pesquisa por nome do cliente, placa do veículo ou número do protocolo
- **Status**: filtra por coluna do kanban
- **Serviço**: filtra pelo tipo de serviço

### Cards do kanban

Cada card exibe:
- Nome do cliente
- Número do protocolo
- Veículo (marca, modelo, placa)
- Tipo de serviço
- **Nome da loja** (se vinculada) com ícone 🏪
- Badge de status
- Valor do serviço e data do prazo
- Badges **DUT** (âmbar) e **Boleto** (azul) quando preenchidos
- Badge **Vencido** em vermelho se o prazo passou

---

## 6. Agenda

O módulo **Agenda** permite agendar compromissos relacionados ao negócio.

### O que você pode fazer:

- Visualizar compromissos em formato de calendário ou lista
- Criar novos compromissos com data, hora e descrição
- Editar ou excluir compromissos existentes
- Receber notificações de compromissos próximos

### Criando um compromisso:

1. Clique em **Novo Compromisso**
2. Informe: Título, Data, Hora, Descrição
3. Salve

---

## 7. Clientes

O módulo **Clientes** centraliza o cadastro de todas as pessoas físicas e jurídicas atendidas.

### Listagem de clientes

Exibe todos os clientes cadastrados com busca por nome, CPF/CNPJ ou telefone.

### Cadastrando um cliente

1. Clique em **Novo Cliente**
2. Preencha:
   - **Nome** (obrigatório)
   - **CPF/CNPJ**
   - **Telefone**
   - **E-mail**
   - **Endereço**
3. Clique em **Salvar**

> **Dica**: você também pode cadastrar clientes diretamente ao criar um novo processo, sem precisar sair da tela.

### Editando e excluindo clientes

- Use o ícone de lápis (✏️) para editar
- Use o ícone de lixeira (🗑️) para excluir

> ⚠️ Excluir um cliente não exclui os processos vinculados a ele.

---

## 8. Veículos

O módulo **Veículos** registra os veículos dos clientes que passaram pelo despachante.

### Cadastrando um veículo

1. Clique em **Novo Veículo**
2. Preencha:
   - **Cliente** (vincular ao dono do veículo)
   - **Marca** e **Modelo** (obrigatórios)
   - **Ano**
   - **Placa** (obrigatória)
   - **Chassi**
   - **RENAVAM**
3. Clique em **Salvar**

> **Dica**: você também pode cadastrar veículos diretamente ao criar um processo.

---

## 9. Lojas

O módulo **Lojas** gerencia as concessionárias, lojas parceiras e indicadores que encaminham clientes ao despachante.

### Tipos de loja

| Tipo | Descrição |
|------|-----------|
| **Concessionária** | Revendedoras de veículos novos/usados |
| **Loja** | Lojas de veículos multimarcas |
| **Indicador** | Pessoas ou empresas que indicam clientes |
| **Despachante Parceiro** | Outros despachantes em parceria |
| **Outro** | Qualquer outra origem |

### Cadastrando uma loja

1. Clique em **Nova Loja**
2. Preencha:
   - **Nome** (obrigatório)
   - **Tipo**
   - **CNPJ**
   - **Responsável / Contato**
   - **Telefone**
   - **E-mail**
   - **Observações**
   - **Ativo**: marque se a loja está ativa (aparece nas listas de processo)
3. Clique em **Salvar**

### Cards de loja

Cada card exibe:
- Nome e CNPJ
- Tipo (com badge colorido)
- Contato, telefone e e-mail
- Total de processos vinculados
- **Saldo financeiro** (vermelho = despachante deve à loja | verde = loja deve ao despachante)

### Sistema de Crédito e Débito

Cada loja possui um controle de saldo financeiro. Para acessar:

1. No card da loja, clique no ícone de **carteira** (💼)
2. O modal de Créditos será aberto

**Painel de saldo:**
- Exibe o saldo atual (positivo = despachante deve à loja; negativo = loja deve ao despachante)
- Mostra totais de créditos e débitos separadamente

**Novo lançamento:**
1. Clique em **Novo Lançamento**
2. Selecione o tipo:
   - **Crédito** — despachante deve à loja (ex: loja adiantou DUT, ressarcimento pendente)
   - **Débito** — loja deve ao despachante (ex: comissão devida, serviço não pago)
3. Informe a data, descrição e valor
4. Clique em **Registrar**

**Histórico:** todos os lançamentos aparecem em ordem cronológica com cor diferenciada (vermelho = crédito/loja; verde = débito/despachante).

> **Como usar na prática:**
> - A loja paga DUT pelo cliente → registre um **Crédito** de R$ X (você deve ressarcir a loja)
> - No acerto mensal, o despachante repassa → registre um **Débito** pelo valor pago (reduz a dívida)
> - O saldo zerado indica que as contas estão quitadas

### Cards de resumo

No topo da página há 4 cards mostrando a quantidade de lojas ativas por tipo (Concessionária, Loja, Indicador, Despachante Parceiro).

---

## 10. Financeiro

O módulo **Financeiro** registra as receitas e despesas do negócio.

> ⚠️ Disponível apenas para **Administradores**.

### Lançando uma receita

1. Clique em **Nova Receita**
2. Informe: descrição, valor, data, categoria
3. Salve

### Lançando uma despesa

1. Clique em **Nova Despesa**
2. Informe: descrição, valor, data, categoria
3. Salve

### Visualização

O módulo exibe o saldo geral, listagem de lançamentos com filtros por período e categoria.

---

## 11. Prazos

O módulo **Prazos** exibe todos os processos com data de prazo próxima ou vencida.

### Como funciona:

O sistema analisa automaticamente todos os processos em aberto e os classifica em:

| Categoria | Critério |
|-----------|----------|
| **Vencidos** | Prazo já passou e processo não foi concluído |
| **Vence Hoje** | Prazo é hoje |
| **Vence em 3 dias** | Prazo nos próximos 3 dias |
| **Vence em 7 dias** | Prazo nos próximos 7 dias |

### Como usar:

- Use este módulo diariamente para priorizar processos urgentes
- Clique em um processo para abrir a edição e atualizar o status

---

## 12. Relatórios

O módulo **Relatórios** oferece análises gerenciais com filtros de período.

> ⚠️ Disponível apenas para **Administradores**.

### Filtros disponíveis

No topo da página, configure:
- **Período**: data de início e data de fim
- **Agrupamento**: mensal ou semanal
- **Status**: todos, concluídos ou pendentes
- **Serviço**: filtrar por tipo de serviço

### Abas de relatório

#### Por Período
Mostra a evolução de processos e valores ao longo do tempo em gráfico e tabela.
- Quantidade de processos por período
- Valor total e valor médio
- Processos concluídos vs. pendentes

#### Por Status
Distribuição dos processos pelos status do kanban.
- Porcentagem de cada status
- Valor total em cada etapa

#### Por Cliente
Ranking de clientes por volume de processos.
- Quantidade de processos por cliente
- Valor total e ticket médio
- Taxa de conclusão

#### Por Serviço
Distribuição por tipo de serviço prestado.
- Processos por categoria de serviço
- Porcentagem e valor total

#### Prazos
Análise de controle de prazos.
- Processos vencidos, no prazo e concluídos

#### Por Loja ⭐ (novo)
Relatório exclusivo por loja de origem.

| Coluna | Descrição |
|--------|-----------|
| **Loja** | Nome e tipo da loja |
| **Processos** | Quantidade no período |
| **Serviços** | Valor total de honorários |
| **DUT** | Total de DUT registrado |
| **Boleto** | Total de boletos registrado |
| **Total Geral** | Soma de serviços + DUT + boleto |
| **Concluídos** | Processos finalizados |
| **Pendentes** | Processos em aberto |

A última linha exibe o **Total Geral** consolidado de todas as lojas.
Processos sem loja vinculada aparecem em linha separada ("Sem loja vinculada").

#### Fluxo de Caixa *(plano Básico ou superior)*
Entradas e saídas ao longo do tempo com saldo acumulado.

#### Receitas / Despesas *(plano Premium ou superior)*
Comparativo de receitas vs. despesas por período.

---

## 13. Notificações

O módulo **Notificações** centraliza todos os avisos do sistema.

### Tipos de notificações:

- Processos com prazo vencendo
- Processos com status atualizado
- Novos processos criados
- Alertas do sistema

### Como usar:

- O ícone de sino (🔔) no topo mostra a contagem de notificações não lidas
- Clique no ícone ou acesse o menu **Notificações** para visualizar todas
- Notificações lidas ficam marcadas automaticamente

---

## 14. Assinatura

O módulo **Assinatura** exibe o plano contratado e os limites disponíveis.

> ⚠️ Disponível apenas para **Administradores**.

### Planos disponíveis

| Plano | Processos/mês | Recursos |
|-------|--------------|----------|
| **Freemium** | Limitado | Funcionalidades básicas |
| **Básico** | Maior limite | + Fluxo de Caixa |
| **Premium** | Ilimitado | + Receitas vs. Despesas |
| **Eterno** | Ilimitado | Acesso completo vitalício |

### Fazendo upgrade

1. Acesse **Assinatura**
2. Visualize o plano atual e os limites
3. Escolha um plano superior e siga as instruções de pagamento

---

## 15. Configurações e Usuários

> ⚠️ Disponível apenas para **Administradores**.

### Gerenciamento de usuários

Em **Configurações**, acesse a aba **Usuários** para:

#### Criar um novo usuário

1. Clique em **Novo Usuário**
2. Preencha:
   - **Nome completo**
   - **E-mail**
   - **Senha**
   - **Perfil**: Funcionário ou Administrador
3. Clique em **Criar usuário**

> **Obs.:** Super Admins também podem criar usuários com perfil Administrador.

#### Editar um usuário

1. No card do usuário, clique em **Editar**
2. Altere nome, e-mail, perfil ou senha
3. Salve

#### Bloquear/desbloquear usuário

- Use o botão de bloqueio no card do usuário
- Usuários bloqueados não conseguem fazer login

#### Perfis de acesso

| Perfil | Ícone | Permissões |
|--------|-------|------------|
| **Super Admin** | 👑 Roxo | Acesso total, gerencia planos e admins |
| **Administrador** | 🛡️ Vermelho | Acesso completo ao negócio |
| **Funcionário** | 👤 Azul | Lançamentos (sem financeiro/relatórios) |

---

## 16. Meu Perfil

Acessível pelo ícone de usuário (👤) no canto superior direito → **Meu Perfil**.

### O que você pode alterar:

#### Nome de exibição
1. Informe seu nome no campo **Nome de exibição**
2. Clique em **Salvar Nome**
3. O nome atualizado aparecerá no cabeçalho do sistema

#### Senha
1. Digite a **nova senha** (mínimo 6 caracteres)
2. Confirme a nova senha
3. Clique em **Alterar Senha**

> ⚠️ O **e-mail** de acesso não pode ser alterado pelo próprio usuário — entre em contato com o administrador se necessário.

---

## 17. Perfis de Acesso

O sistema possui 3 perfis de usuário com diferentes níveis de permissão:

### Funcionário

Perfil para colaboradores que fazem lançamentos operacionais.

**Pode:**
- Criar, editar e visualizar processos
- Visualizar clientes e veículos
- Criar novos clientes e veículos
- Acessar agenda e notificações
- Alterar seu próprio nome e senha

**Não pode:**
- Acessar financeiro
- Acessar relatórios
- Gerenciar usuários
- Acessar configurações
- Visualizar lojas

### Administrador

Perfil para o dono do negócio ou gerente responsável.

**Pode tudo que o Funcionário pode, mais:**
- Acessar e gerenciar financeiro
- Visualizar todos os relatórios
- Gerenciar lojas e créditos
- Criar e editar usuários (funcionários)
- Acessar configurações do sistema
- Gerenciar assinatura

### Super Admin

Perfil exclusivo do operador do sistema (GestDesp).

**Pode tudo que o Administrador pode, mais:**
- Gerenciar planos e preços
- Criar usuários com perfil Administrador
- Alterar perfis de qualquer usuário
- Acesso irrestrito a todos os recursos

---

## Fluxo de Trabalho Sugerido

### Rotina diária recomendada:

1. **Abrir o sistema** → verificar o **Dashboard** para o panorama do dia
2. **Acessar Prazos** → identificar processos urgentes para o dia
3. **Verificar Notificações** → tratar alertas pendentes
4. **Abrir Processos** → atualizar status dos processos trabalhados no dia (arrastar no kanban)
5. **Criar novos processos** conforme documentação for chegando
6. **Agenda** → verificar compromissos do dia

### Rotina mensal recomendada (Administrador):

1. **Relatórios → Por Período**: analisar volume e faturamento do mês
2. **Relatórios → Por Loja**: ver quanto cada loja gerou de movimento e DUT/boleto
3. **Lojas → Créditos**: acessar cada loja parceira, conferir saldo e registrar o acerto do mês
4. **Financeiro**: lançar despesas do mês e conferir o resultado
5. **Relatórios → Fluxo de Caixa**: avaliar a saúde financeira

---

## Dicas e Boas Práticas

- **Vincule sempre a loja** ao criar um processo — isso alimenta automaticamente o Relatório por Loja e o controle de créditos
- **Preencha DUT e Boleto** quando aplicável — esses valores são exibidos no card do kanban e no relatório por loja
- **Mantenha os status atualizados** no kanban — o sistema usa esses dados nos relatórios e alertas
- **Cadastre os documentos recebidos** ao criar o processo — facilita a conferência posterior
- **Use o campo Observações** para registrar informações relevantes do processo (pendências, combinados com o cliente etc.)
- **Inative lojas** ao invés de excluir — os dados históricos são preservados
- **Acesse Prazos diariamente** — processos com prazo vencido ficam em vermelho e precisam de atenção prioritária

---

*GestDesp — Sistema de Gestão Empresarial para Despachantes*
*Desenvolvido por GestaoCorp*
