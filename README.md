
# Projeto NotaDez

## 📌 Visão Geral
O NotaDez é um sistema web desenvolvido como parte da disciplina Projeto Integrador 2 (PI II) do curso de Engenharia de Software – PUC-Campinas (2025).  
O objetivo do projeto é oferecer aos docentes uma ferramenta simples e eficiente para gerenciar notas de estudantes, indo além das planilhas tradicionais, com funcionalidades específicas para controle acadêmico.


## 👥 Equipe
- Time X (substituir pelo número do time no CANVAS)  
- Integrantes:
  - Cristian Eduardo Fava – 25000636
  - Allan Giovanni Matias Paes - 25008211
  - Murilo Rigoni - 25006049
  - Nome do integrante 4 – RA   
  - Nome do integrante 5 – RA  

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
- Frontend: HTML5, CSS3, Bootstrap (opcional)  
- Banco de Dados: MySQL, PostgreSQL ou Oracle  
- IDE: Visual Studio Code ou JetBrains WebStorm  
- Controle de Versão: Git + GitHub  

## 🚀 Como Executar o Projeto

### 1. Clonar o Repositório
git clone https://github.com/SEU-USUARIO/PI_II_ES_TIME_X.git  
cd PI_II_ES_TIME_X  

### 2. Instalar Dependências
npm install  

### 3. Configurar Banco de Dados
Criar um banco de dados relacional (MySQL/PostgreSQL/Oracle).  
Configurar credenciais no arquivo `.env`:  

DB_HOST=localhost  
DB_USER=usuario  
DB_PASS=senha  
DB_NAME=notadez  

### 4. Executar o Backend
npm run dev  

### 5. Acessar o Frontend
http://localhost:3000  

## 📂 Estrutura do Repositório
PI_II_ES_TIME_X/  
│── src/  
│   ├── backend/        # Código do servidor Node.js  
│   ├── frontend/       # HTML, CSS, JS  
│   ├── database/       # Scripts SQL  
│── docs/               # Documentação adicional  
│── README.md           # Este arquivo  
│── package.json  
│── .gitignore  

## 📝 Regras do Projeto
- Nome do repositório: PI_II_ES_TIME_X (substituir X pelo número do time no CANVAS).  
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