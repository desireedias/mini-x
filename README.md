# 𝕏 Mini X — Redes Sociais

O **Mini X** é uma aplicação web full-stack inspirada no X (antigo Twitter). O projeto permite a criação de contas, edição de perfil, publicação de mensagens, sistema de seguidores com feed dinâmico e interações.

🚀 **Link do Deploy (Produção):** [https://mini-x-omega.vercel.app](https://mini-x-omega.vercel.app)

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
* **Framework:** Next.js (React)
* **Estilização:** Tailwind CSS & Shadcn/UI
* **Gerenciamento de Estado/Sessão:** Better Auth
* **Hospedagem:** Vercel

### **Back-end**
* **Framework:** Python com Django & Django REST Framework (DRF)
* **Autenticação:** JWT / Bearer Token
* **Hospedagem:** Render

### **Banco de Dados**
* **Database:** PostgreSQL (Supabase)

---

## ✨ Funcionalidades

- [x] **Autenticação e Conta:** Cadastro e login de usuários com persistência de sessão.
- [x] **Configuração de Perfil:** Alteração parcial ou completa de foto (avatar), banner, nome, bio e senha.
- [x] **Sistema de Seguir:** Opção de seguir/deixar de seguir outros usuários com contagem em tempo real de seguidores e seguidos.
- [x] **Feed Personalizado:** Exibição dinâmica de publicações dos usuários seguidos e dos seus próprios posts.
- [x] **Sugestões de Conexão:** Lista de usuários recomendados para seguir.
- [x] **Interações:** Criação de postagens e curtidas.

---

## 🚀 Como Executar o Projeto Localmente

### **Pré-requisitos**
* Node.js (v18 ou superior)
* Python 3.10+
* Git

---

### **1. Executando o Front-end (Next.js)**

```bash
# Clone o repositório
git clone [https://github.com/SEU_USUARIO/mini-x.git](https://github.com/SEU_USUARIO/mini-x.git)

# Acesse a pasta do projeto
cd mini-x

# Instale as dependências
npm install

# Configure a variável de ambiente criando um arquivo .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Inicie o servidor de desenvolvimento
npm run dev
```

### **2. Executando o Back-end (Django)**

```bash
# Acesse a pasta do backend (ou clone o repositório backend separado)
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# No Linux/Mac:
source venv/bin/activate
# No Windows:
venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações do banco de dados
python manage.py migrate

# Inicie o servidor Django
python manage.py runserver
```

---

## 🔗 Endpoints Principais da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/register/` | Criação de novo usuário |
| `GET` | `/api/posts/` | Listagem do feed de publicações |
| `POST` | `/api/posts/` | Criar nova publicação |
| `GET` | `/api/users/suggested/` | Listar sugestões de usuários |
| `POST` | `/api/users/<username>/follow/` | Seguir / Deixar de seguir usuário |
| `GET` | `/api/users/<username>/` | Detalhes do perfil e contador |


## ⚙️ Variáveis de Ambiente

O projeto é estruturado em monorepo. Crie um arquivo `.env` na **raiz do projeto** para o desenvolvimento local:

### `.env` (Raiz do Monorepo)

```env
# Configurações do Django
SECRET_KEY=sua_chave_secreta_aqui
DEBUG=True

# Conexão unificada com o PostgreSQL local
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/minix_db"

# Variáveis individuais do Banco
DB_NAME=minix_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5433
```

### `.env` (Dentro da pasta frontend/)

```env
NEXT_PUBLIC_API_URL="[http://127.0.0.1:8000](http://127.0.0.1:8000)"
BETTER_AUTH_URL="[http://127.0.0.1:8000](http://127.0.0.1:8000)"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

```




