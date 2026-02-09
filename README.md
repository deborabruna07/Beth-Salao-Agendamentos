# SGA – Sistema de Gerenciamento e Agendamento para Salão de Beleza

## 📌 Visão Geral

O **SGA (Sistema de Gerenciamento e Agendamento para Salão de Beleza)** é uma aplicação web criada para resolver um problema real de salões de beleza:
**organizar agendamentos levando em conta serviços com tempo ativo e tempo de espera**, permitindo encaixes inteligentes e evitando conflitos de horário.

O sistema é **dividido em duas áreas bem definidas**:

* 👤 **Área do Cliente** – focada no agendamento
* 🛠️ **Área do Administrador** – focada na gestão do sistema

---

## 🎯 Objetivos do Projeto

* Automatizar o processo de agendamento de serviços;
* Evitar conflitos de horários;
* Permitir encaixes durante tempos de espera;
* Melhorar o aproveitamento do tempo da profissional;
* Facilitar a gestão da agenda do salão;
* Servir como projeto prático para estudo e portfólio.

---

## 🧩 Estrutura do Sistema

### 👤 Área do Cliente

Funcionalidades disponíveis para o cliente:

* Informar o nome;
* Selecionar o serviço desejado;
* Escolher a data por meio de um **calendário interativo**;
* Visualizar apenas **dias disponíveis**;
* Exibição dinâmica dos **horários disponíveis**;
* Bloqueio automático de:

  * Dias fechados;
  * Dias anteriores à data atual;
  * Horários já ocupados;
* Feedback visual com mensagens de sucesso ou erro;
* Interface simples e intuitiva.

---

### 🛠️ Área do Administrador

Funcionalidades exclusivas do administrador:

* Cadastro de serviços com:

  * Tempo ativo inicial (min);
  * Tempo de espera (min);
  * Tempo ativo final (min);
* Visualização completa dos agendamentos;
* Cancelamento de agendamentos individuais;
* Ação crítica para **limpar todos os agendamentos** (com alerta);
* Geração automática de relatório em **CSV**;
* Persistência dos dados com **SQLite**.

---

## ⚙️ Regras de Negócio Implementadas

* Um serviço pode conter **tempo de espera**, permitindo encaixe de outros clientes;
* O sistema calcula automaticamente o horário final do serviço;
* Não permite:

  * Agendar em dias fechados;
  * Agendar em dias anteriores;
  * Conflitos de horário;
* Agenda atualizada dinamicamente conforme os agendamentos.

---

## 🛠️ Tecnologias Utilizadas

* **TypeScript**
* **JavaScript**
* **HTML**
* **CSS/ Tailwind CSS**
* **Git & GitHub**

---

## ▶️ Como Executar o Projeto

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/beth-salao-agendamentos.git
cd beth-salao
```

### 2️⃣ Criar e ativar o ambiente virtual

```bash
python -m venv venv
venv\Scripts\activate
```

### 3️⃣ Instalar as dependências

```bash
npm install
```

### 4️⃣ Executar a aplicação

```bash
npm run dev
```

Acesse no navegador:

```
http://localhost:8081/
```

---

## 📊 Relatórios

O sistema gera automaticamente o arquivo **`agendamentos.csv`**, contendo:

* Nome do cliente
* Serviço
* Data
* Horário de início
* Horário de término
* Status do agendamento

---

## 👨‍💻 Autor

Desenvolvido por **Débora Bruna**