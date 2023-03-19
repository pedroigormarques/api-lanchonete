# API - Lanchonete

## Descrição

Esta API foi elaborada para estudo e treinamento. As funcionalidades disponibilizadas por ela buscam atender, principalmente, o controle do estoque de várias lanchonetes. Dessa forma, utilizando um sistema de autenticação, é possível interagir com as rotas do estoque, do cardápio e dos pedidos de cada uma das lanchonetes de modo individual e seguro.

Para seu desenvolvimento, foi utilizado como linguagem o **TypeScript** e como ferramenta o **NestJs**. A princípio, sua organização foi pensada para buscar atingir uma arquitetura limpa e baseada em testes. No caso da persistência dos dados, foi utilizado o banco de dados **MongoDB**.

## API em execução para testes

Para testar suas funcionalidades, o link de acesso para um deploy em funcionamento se encontra em **[https://api-lanchonete.onrender.com](https://api-lanchonete.onrender.com)**. Para consultar as rotas disponíveis, acesse **[https://api-lanchonete.onrender.com/api](https://api-lanchonete.onrender.com/api)**

## Instalação

Comando para instalar a API:

```bash
$ npm install
```

Também deve ser criado 3 arquivos contendo as variáveis de ambiente para cada necessidade: `.env`, `.dev.test` e `.e2e.test`. As variáveis necessárias em cada uma delas são: `URL_BANCO`, `NOME_DATABASE`, `JWT_CONSTANTS_SECRET` e `JWT_EXPIRES_IN`

## Rodando a API

Comandos para rodar a API localmente:

```bash
# Como desenvolvedor
$ npm run start:dev

# Como modo de produção
$ npm run start:prod
```

## Testes

Comandos para a execução dos testes da API localmente:

```bash
# Testes unitários
$ npm run test

# Testes de cobertura
$ npm run test:cov

# Testes de integração
$ npm run test:integracao

# Testes e2e - Executando os testes de integração, porém, utilizando o banco de dados configurado
$ npm run test:integracao-e2e
```
