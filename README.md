<h1 align="center">E-Commerce Backend</h1>
<p align="center">API com endpoints para criação de usuários, produtos, compras e avaliações com autenticação e autorização</p>
<p align="center"><a href="https://alvaromrveiga.github.io/ecommerce-backend/" target="_blank"><b>🔗 Documentação com Compodoc e GitHub Pages</b></a></p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white"/>
</p>

## 📑 Índice
<!--ts-->
   * [📌 Features](#-features)
   * [🔧 Instalação](#-instalação)
   * [💻 Tecnologias](#-tecnologias)
   * [📄 Licença](#-licença)
<!--te-->

## 📌 Features

- [x] CRUD de usuários
-   [x] Autenticação de usuário
-   [x] Autorização de usuário (admin)
- [x] CRUD de produtos
  - [x] Upload de imagens
- [x] CRUD de categorias
- [ ] CRUD de compras

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
  
5. Rodar os testes
    - Crie um arquivo .env.test na raiz do projeto alterando no mínimo o banco de dados que colocou no .env
      - Exemplo: postgresql://username:password@localhost:5432/<ins>ecommerce-test</ins>?schema=public
    
  ```bash
    # Roda as migrations no bando de testes
    yarn migrate:test 

    # Roda todos os testes
    yarn test:all

    # Roda apenas os testes unitários
    yarn test

    # Roda apenas os testes de integração
    yarn test:e2e

    # Para visualizar o banco de dados de testes
    yarn studio:test
  ```

## 💻 Tecnologias

- [Typescript](https://www.typescriptlang.org/) - minimizar erros e tooling
- [Node.js](https://nodejs.org/en/) e [NestJS](https://nestjs.com/) com [Express](https://expressjs.com/) - construir o servidor
- [Prisma](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/) - armazenar dados
- [Passport](https://www.passportjs.org/) e [passport-jwt](https://www.passportjs.org/packages/passport-jwt/) - autenticação com Json Web Token
- [Class-validator](https://github.com/typestack/class-validator) e [class-transformer](https://github.com/typestack/class-transformer) - validações nos dados de entrada dos endpoints
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) - hashs de senhas
- [Prisma-error-enum](https://github.com/vinpac/prisma-error-enum) - identificar os códigos para tratar as exceções do prisma
- [Jest](https://jestjs.io/), [SuperTest](https://github.com/visionmedia/supertest) e [ms](https://github.com/vercel/ms) - testes
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) e [compodoc](https://github.com/compodoc/compodoc) - documentação
- [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/) - linting e formatação de código

## 📄 Licença

[MIT](https://github.com/alvaromrveiga/ecommerce-backend/blob/main/LICENSE.md)
