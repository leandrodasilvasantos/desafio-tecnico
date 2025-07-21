# Desafio Técnico 

## Sistema de Cadastro de Fundos de Investimento

O sistema implementa um formulário completo para cadastro e gerenciamento de fundos de investimento, utilizando as tecnologias da stack da empresa.

### Estrutura do Projeto

```
outliers_challenge/
├── backend/                    # API Django REST Framework
│   ├── outliers_backend/      # Configurações do projeto
│   ├── fundos/                # App principal
│   │   ├── models.py          # Modelos de dados
│   │   ├── serializers.py     # Serializers da API
│   │   ├── views.py           # ViewSets da API
│   │   └── management/        # Comandos customizados
│   ├── requirements.txt       # Dependências Python
│   └── Dockerfile            # Container do backend
├── frontend/                  # Interface React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── services/          # Serviços de API
│   │   └── utils/            # Utilitários e validações
│   ├── package.json          # Dependências Node.js
│   └── Dockerfile           # Container do frontend
├── docker-compose.yml        # Orquestração dos serviços
└── README.md                # Este arquivo
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Docker e Docker Compose instalados
- Git para clonar o repositório
- Portas 3000, 5432 e 8000 disponíveis

### Execução com Docker 

1. **Clone o repositório:**
```bash
git clone https://github.com/leandrodasilvasantos/desafio-tecnico.git
cd desafio-tecnico
```

2. **Execute o ambiente completo:**
```bash
docker-compose build --no-cache
docker-compose up -d
```
3. **Verificando status de database (db), backend e front end**
```bash
docker-compose ps
```

4. **Execute as migrações e carregue dados de exemplo:**
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py load_sample_data
```

4. **Acesse a aplicação:**
- http://localhost:3000



## 📊 Modelo de Dados

### Entidades Principais

#### Fundo
- **id_fundo**: Identificador único (auto-incremento)
- **st_cnpj_fundo**: CNPJ do fundo (obrigatório, único)
- **st_classe_fundo**: Classe ANBIMA (obrigatório)
- **st_estrategia_fundo**: Estratégia de investimento (obrigatório)
- **st_obs_fundo**: Observações gerais (opcional)
- **cod_quantum_fundomaster**: Código do fundo master (opcional)
- **st_cnpj_fundomaster**: CNPJ do fundo master (opcional)
- **created_at**: Data de criação
- **updated_at**: Data de atualização

#### Relatório
- **id**: Identificador único
- **nome**: Nome do relatório (único)
- **descricao**: Descrição do relatório
- **ativo**: Status do relatório

#### FundoRelatorio 
- **fundo**: Referência ao fundo
- **relatorio**: Referência ao relatório

### Validações Implementadas

#### Backend (Django)
- Validação de formato e dígito verificador do CNPJ
- Unicidade do CNPJ do fundo
- Validação de relacionamento fundo master
- Validações de campos obrigatórios

#### Frontend (React)
- Formatação automática de CNPJ
- Validação em tempo real
- Feedback visual de erros
- Validação de formulário antes do envio

## 🔌 API Endpoints

### Fundos
- `GET /api/fundos/` - Lista todos os fundos (com paginação)
- `POST /api/fundos/` - Cria um novo fundo
- `GET /api/fundos/{id}/` - Detalhes de um fundo específico
- `PUT /api/fundos/{id}/` - Atualiza um fundo
- `DELETE /api/fundos/{id}/` - Remove um fundo
- `GET /api/fundos/classes/` - Lista classes disponíveis
- `GET /api/fundos/estrategias/` - Lista estratégias disponíveis

### Relatórios
- `GET /api/relatorios/` - Lista todos os relatórios ativos
- `GET /api/relatorios/{id}/` - Detalhes de um relatório específico

### Parâmetros de Busca
- `?search=termo` - Busca geral em CNPJ, classe, estratégia e observações
- `?cnpj=valor` - Filtro por CNPJ
- `?classe=valor` - Filtro por classe
- `?estrategia=valor` - Filtro por estratégia
- `?relatorio=valor` - Filtro por relatório

## 🎨 Interface do Usuário

### Funcionalidades Implementadas

#### Listagem de Fundos
- Visualização em cards responsivos
- Busca e filtros em tempo real
- Paginação automática
- Ações rápidas (visualizar, editar, excluir)

#### Formulário de Cadastro/Edição
- Campos organizados em seções lógicas
- Validação em tempo real
- Formatação automática de CNPJ
- Seleção múltipla de relatórios
- Campos condicionais para fundo master

#### Visualização de Detalhes
- Layout organizado e profissional
- Informações completas do fundo
- Histórico de criação e atualização
- Navegação intuitiva

### Design System
- Componentes baseados em shadcn/ui
- Tema consistente com Tailwind CSS
- Design responsivo para mobile e desktop
- Feedback visual para ações do usuário



1. **Cadastro de Fundo Válido**
   - Preenchimento correto de todos os campos
   - Validação de CNPJ
   - Associação com relatórios

2. **Validações de Erro**
   - CNPJ inválido
   - Campos obrigatórios vazios
   - CNPJ duplicado

3. **Fundo Master**
   - Relacionamento correto
   - Validações condicionais


Projeto desenvolvido por Leandro Santos, proibido uso comercial, se trata de um teste técnico.
