<h1 align="center">E-Commerce Backend</h1>
<p align="center">API com endpoints para criação de usuários, produtos, compras e avaliações com autenticação e autorização</p>
<p align="center"><a href="https://veiga-ecommerce-backend.herokuapp.com/api/" target="_blank"><b>🔗 Demo com Swagger</b></a></p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white"/>
</p>

## 📑 Índice
<!--ts-->
   * [📌 Features](#-features)
   * [📚 Docs e Demo](#-docs-e-demo)
   * [🔧 Instalação](#-instalação)
   * [🔩 Testes](#-testes)
   * [🖇️ Requisições no Insomnia](#%EF%B8%8F-requisições-no-insomnia)
   * [💻 Tecnologias](#-tecnologias)
   * [📄 Licença](#-licença)
<!--te-->

## 📌 Features

- [x] CRUD de usuários
-   [x] Autenticação de usuário
    -   [x] Rotação de Refresh Token
        -   [x] Detecção de Reuso Automático
-   [x] Autorização de usuário (admin)
- [x] CRUD de produtos
  - [x] Upload de imagens
- [x] CRUD de categorias
- [x] CRUD de compras

## 📚 Docs e Demo
[🔗 Demo usando Swagger](https://veiga-ecommerce-backend.herokuapp.com/api)

[🔗 Docs usando Compodoc no GitHub Pages](https://alvaromrveiga.github.io/ecommerce-backend/)

- #### Representação dos módulos com Compodoc:
    ![Compodoc-App-Module](https://github.com/alvaromrveiga/ecommerce-backend/blob/main/assets/compodoc.png)

## 🔧 Instalação

1. Você precisará ter o [Node.js](https://nodejs.org/en/) instalado

2. Instalação

  ```bash
    # Clona o projeto para sua máquina
    git clone https://github.com/alvaromrveiga/ecommerce-backend

    # Entra na pasta do projeto
    cd ecommerce-backend

    # Instala as dependências
    yarn
  ```

3. Crie um arquivo .env na raiz do projeto preenchendo as informações descritas no [.env.example](https://github.com/alvaromrveiga/ecommerce-backend/blob/main/.env.example)

4. Iniciar servidor

  ```bash
    # Roda as migrations
    yarn migrate:dev 

    # Inicia o servidor em modo de desenvolvimento
    yarn start:dev

    # O servidor abrirá na porta 3000. 
    # Você pode acessar a documentação com Swagger em http://localhost:3000/api/

    # Para visualizar o banco de dados
    yarn prisma studio
  ```    

## 🔩 Testes

- Crie um arquivo .env.test na raiz do projeto alterando no mínimo o banco de dados que colocou no .env
  - Exemplo: postgresql://username:password@localhost:5432/<ins>ecommerce-test</ins>?schema=public
    
  ```bash
    # Roda as migrations no bando de testes
    yarn migrate:test 

    # Roda todos os testes unitários e de integração
    # Pode demorar alguns poucos minutos
    # 10 suites e 187 testes
    yarn test:all

    # Roda apenas os testes unitários
    yarn test

    # Roda apenas os testes de integração
    yarn test:e2e

    # Para visualizar o banco de dados de testes
    yarn studio:test
  ```

- #### Cobertura dos testes:
     ![Test-Coverage](https://github.com/alvaromrveiga/ecommerce-backend/blob/main/assets/test-coverage.png)

## 🖇️ Requisições no Insomnia
A coleção de 30 requisições para testar o projeto no [Insomnia](https://insomnia.rest/download) pode ser encontrada [aqui](https://github.com/alvaromrveiga/ecommerce-backend/blob/main/assets/insomnia-requests.json). 
  - Para importar no Insomnia:
    - Clique na engrenagem no canto superior direito
    - Aba de Data 
    - Import Data
    - From File
    - Selecione o arquivo insomnia-requests.json dentro da pasta assets na raiz do projeto

## 💻 Tecnologias

- [Typescript](https://www.typescriptlang.org/) - tooling e minimizar erros
- [Node.js](https://nodejs.org/en/) e [NestJS](https://nestjs.com/) com [Express](https://expressjs.com/) - construir o servidor
- [Prisma](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/) - armazenar dados
- [Passport](https://www.passportjs.org/) e [passport-jwt](https://www.passportjs.org/packages/passport-jwt/) - autenticação com Json Web Token
- [Class-validator](https://github.com/typestack/class-validator) e [class-transformer](https://github.com/typestack/class-transformer) - validações nos dados de entrada dos endpoints
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) - hashs de senhas
- [currency.js](https://currency.js.org/) - cálculos monetários
- [ms](https://github.com/vercel/ms) - cálculo da data de expiração do refresh token
- [Prisma-error-enum](https://github.com/vinpac/prisma-error-enum) - identificar os códigos para tratar as exceções do prisma
- [Jest](https://jestjs.io/), [SuperTest](https://github.com/visionmedia/supertest) - testes
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) e [compodoc](https://github.com/compodoc/compodoc) - documentação
- [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/) - linting e formatação de código

## 📄 Licença

[MIT](https://github.com/alvaromrveiga/ecommerce-backend/blob/main/LICENSE.md)
