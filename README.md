# 🎯 Outbox Pattern using ExpressJs Typescript

## 📌 Overview
The Outbox Pattern is a robust architectural strategy designed to ensure reliable event publishing in distributed systems. It addresses the notorious dual-write problem—where a service must update its database and publish an event simultaneously—by decoupling these operations. Instead of sending events directly to a message broker, the service writes them to an "outbox" table within the same transactional boundary as the business data. A separate process then reads from this table and dispatches events asynchronously.

This pattern is especially valuable in microservices architectures where data consistency and fault tolerance are critical. It ensures that events are never lost due to broker failures or network issues, and that they are only published if the corresponding database transaction succeeds.

By leveraging this approach, developers can build systems that are both event-driven and transactionally safe, without resorting to complex distributed transactions. It simplifies debugging, improves observability, and enhances scalability by separating concerns. Whether you're working with modular monoliths or microservices, the Outbox Pattern is a proven solution for reliable messaging.

## ❗ Problem
- Traditional event publishing risks data inconsistency due to separate transactions for DB and message broker.

- Dual-write failures can lead to lost events or orphaned data.

- Distributed transactions (e.g., 2PC) are complex and hard to scale.

- Lack of observability in direct broker publishing makes debugging difficult.

- Retry logic becomes messy when events fail mid-transaction.

- Systems become tightly coupled to messaging infrastructure.

- Network failures or broker downtime can break critical workflows.

## ✅ Benefits
- Ensures atomicity between business data and event publishing.

- Enables event-driven architecture without distributed transactions.

- Improves resilience against broker or network failures.

- Enhances observability with clear audit trails in the outbox table.

- Simplifies error handling and retry mechanisms.

- Supports scalable decoupling of services via asynchronous dispatch.

- Promotes clean separation of concerns in system design.

## 🚀 Installation

### 🐳 Install Docker Desktop
- Download and install Docker: [Docker Desktop](https://www.docker.com/products/docker-desktop/)


### 💾 Setup Redis Using Docker

```bash
docker pull redis
docker run --name my-redis -d -p 6379:6379 redis
```

#### 📦 Project Setup
- Clone the Repository
```bash
git clone <your-repo-url>
cd <your-project-directory>
``` 
- 🧰 Setup `util` Service
    - Move into the util solution and create an .env file:
    ```bash
    NODE_ENV=development

    # Redis
    REDIS_HOST = 127.0.0.1
    #Local Docker
    #DB_HOST=host.docker.internal
    #REDIS_USERNAME = username
    #REDIS_PASSWORD = password
    REDIS_DB = 0
    REDIS_PORT = 6379

    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Build the utility package:
    ```bash
    npm run build
    ```
    - Link the package:
    ```bash
    npm link
    ```
- 🗄️ Setup `db` service
    - Move into the db solution and create an .env file:
    ```bash
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=root
    DB_DATABASE=outbox
    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Build the utility package:
    ```bash
    npm run build
    ```
    - Generate TypeORM Entities
    ```bash
    npm run typeorm:generate
    ```
    - Apply Migrations
    ```bash
    npm run typeorm:migrate
    ```
     - Link the package:
    ```bash
    npm link
    ```
- 🌐 Setup `api` Service
    - Move into the api solution and create an .env file:
    ```bash
    NODE_ENV=development
    PORT=3000

    # Logging
    LOG_FORMAT=dev
    LOG_DIR=logs

    # CORS Config
    ORIGIN=*
    CREDENTIALS=true

    # Redis
    REDIS_HOST = 127.0.0.1
    #Local Docker
    #DB_HOST=host.docker.internal
    #REDIS_USERNAME = username
    #REDIS_PASSWORD = password
    REDIS_DB = 0
    REDIS_PORT = 6379

    # Database
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=root
    DB_DATABASE=outbox

    # Rate Limiter
    RATE_LIMITER=1000
    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Link the `util` and `db` package:
    ```bash
    npm link <utilurl> <dburl>
    ```
    - Build the Api service:
    ```bash
    npm run build
    ```
    - Run the API in development mode:
    ```bash
    npm run dev:api
    ```
    - Run the Cron Job Worker
    ```bash
    npm run dev:cron
    ```
    - Run the BullMq Consumer Worker
    ```bash
    npm run dev:bullmq
    ```
📌 Note: 
- Run the following script one by one which services executed in separate process.
```
npm run dev:api
npm run dev:cron
npm run dev:bullmq
```

- This demo uses [Pipeline Workflow](https://github.com/KishorNaik/Sol_pipeline_workflow_expressJs) provides a structured approach to executing sequential operations, ensuring safe execution flow, error resilience, and efficient logging.

#### Source Code
- DB
    - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/tree/main/db/src/core/modules

- Api
    - User Module
        - Endpoint
            - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/modules/users/apps/features/v1/createUsers/endpoints/index.ts
        - Event Publish
            - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/modules/users/apps/features/v1/createUsers/events/publish/SendEmail/index.ts
        - CRON Job Runner
            - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/modules/users/apps/features/v1/createUsers/job/index.ts
        - Endpoint and CRON job Worker Registration
            - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/modules/users/users.Module.ts
    - Notification Module
        - Event Subscribe
            - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/modules/notifications/apps/features/v1/welcomeEmail/events/subscribe/index.ts
        - Bull Mq Event Worker Registration
            - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/modules/notifications/notification.Module.ts
    - app.Module
        - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/modules/app.Module.ts
    - Server
        - https://github.com/KishorNaik/Outbox_Pattern_ExpressJs_Typescript/blob/main/api/src/server.ts