
# Projeto NotaDez

## 📌 Visão Geral
O NotaDez é um sistema web desenvolvido como parte da disciplina Projeto Integrador 2 (PI II) do curso de Engenharia de Software – PUC-Campinas (2025).  
O objetivo do projeto é oferecer aos docentes uma ferramenta simples e eficiente para gerenciar notas de estudantes, indo além das planilhas tradicionais, com funcionalidades específicas para controle acadêmico.


## 👥 Equipe
- Time 1  
- Integrantes:
  - Cristian Eduardo Fava – 25000636
  - Allan Giovanni Matias Paes - 25008211
  - Murilo Rigoni - 25006049
  - Mateus de Souza Campos – 25009935   
  - Emilly Morelatto Barbosa – 25503163  

## ⚙️ Funcionalidades Principais
1. Autenticação de Usuário  
   - Cadastro com nome, e-mail, celular e senha.  
   - Recuperação de senha via e-mail.  
   - Sem acesso anônimo ou modo visitante.  

2. Gerenciamento de Instituições, Disciplinas e Turmas  
   - Cadastro de instituições, cursos, disciplinas e turmas.  
   - Exclusão controlada com confirmação (modal ou e-mail).  

3. Cadastro e Importação de Alunos  
   - Inclusão manual de estudantes.  
   - Importação via CSV (apenas duas colunas: matrícula e nome).  
   - Prevenção de duplicatas pelo identificador.  

4. Componentes de Nota  
   - Cadastro de provas, atividades e exercícios.  
   - Notas numéricas de 0.00 a 10.00 com duas casas decimais.  
   - Fórmula fixa para cálculo da média simples ou ponderada.  

5. Apontamento de Notas  
   - Lançamento de notas por componente.  
   - Interface em tabela com modo de visualização seguro.  

6. Cálculo de Nota Final  
   - Coluna automática de cálculo da média.  
   - Fórmula simples ou ponderada definida pelo docente.  

7. Exportação de Notas  
   - Exportação apenas em CSV.  
   - Arquivo gerado somente quando todas as notas estiverem lançadas.  
   - Nome do arquivo no padrão: YYYY-MM-DD_HHmmssms-TurmaX_Sigla.csv.  

## 🖥️ Tecnologias Utilizadas
- Backend: Node.js (última versão LTS) com TypeScript  
- Frontend: HTML5, CSS3, Bootstrap
- Banco de Dados: MySQL
- IDE: Visual Studio Code
- Controle de Versão: Git + GitHub  

## 🚀 Como Executar o Projeto

### 1. Clonar o Repositório
git clone https://github.com/AllanMatiass/PI-II-ES-TIME-1/
cd PI_II_ES_TIME_1 

### 2. Instalar Dependências
npm install  

### 3. Configurar Banco de Dados
Criar um banco de dados relacional (MySQL/PostgreSQL/Oracle).  
Configurar credenciais no arquivo `.env`:  

DB_HOST=localhost  
DB_USER=usuario  
DB_PASS=senha  
DB_NAME=nota_dez_db 

### 4. Compilar o typescript do backend
cd ./backend
npm run build

### 5. Executar o Backend
npm run dev  

### 6. Acessar o Frontend
Iniciar pelo Liver Server  

## 📂 Estrutura do Repositório
PI_II_ES_TIME_1/
│
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── db/
│ │ ├── errors/
│ │ ├── middlewares/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── tests/
│ │ ├── types/
│ │
│ ├── uploads/
│ ├── dist/
│ ├── node_modules/
│
├── docs/
│ ├── Conceitual PI.brM3
│ ├── LógicoPI.brM3
│ ├── MAPA MENTAL - Sistema Nota 10.pdf
│ └── Requisitos RF PI2 atualizado removidos.pdf
│
├── frontend/
│ ├── components/
│ ├── fonts/
│ ├── node_modules/
│ ├── pages/
│ ├── scripts/
│ ├── styles/

## 📝 Regras do Projeto
- Nome do repositório: PI_II_ES_TIME_1  
- Criar branches para cada funcionalidade antes de integrar na main.  
- Criar TAG de release final: 1.0.0-final.  
- Todos os arquivos devem conter comentários explicativos e identificação do autor.  
- Uso obrigatório do GitHub Projects para apontamento de esforço e horas.  
- Participação obrigatória nas reuniões de orientação com apresentação de progresso individual.  
- Convites no GitHub apenas para integrantes, orientador(a) e banca (quando autorizado).  

## 🎯 Entrega Final
- Código funcionando sem necessidade de ajustes durante a banca.  
- Projeto preparado com plano de contingência.  
- Apresentação de até 20 minutos para a banca avaliadora.  

## 📜 Direitos Autorais
Este projeto é de uso estritamente acadêmico no contexto da disciplina Projeto Integrador 2 – Engenharia de Software – PUC-Campinas (2025).  
Qualquer uso externo ou comercial deve ser previamente autorizado pelos autores do documento de visão.
