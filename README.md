# Barilo

Uma ferramenta que vai te ajudar a economizar dinheiro e tempo entre supermercados e refeições.

## Tech Stack

- Go
- RabbitMQ
- ChatGPT
- PostgreSQL

## Architecture & Design

Aqui estão algumas informações de eu projetei o MPV usando conceitos de DDD.

### Arquitecture choices

- [x] API REST -> Clean Architecture
  - Strategy pattern
  - SOLID
- [x] Workers -> Clean Architecture
  - Strategy pattern
  - SOLID
  
### Design

```mermaid
graph LR
  A((Mobile)) ----> B[Whatsapp API]
  B -->|<small>http </small>| C
  
  C --->|<small>http</small>| E[Gemini AI]    
  C -->|<small>http</small>| D[Open AI]
  C --->|<small>http</small>| H[AWS S3 Storage]
  F[Worker] --->|<small>http</small>| H[AWS S3 Storage]
      
  subgraph Barilo
      C[Barilo API]
      db[(PostgreSQL)]

      C ---> db
      C ---> RabbitMQ
      F[Worker] --> RabbitMQ
      F[Worker] --> db

  end
```

## Class Diagram

```mermaid
---
title: Barilo
---
classDiagram
  User
  Assistant
  Thread
  Message
  
  AIProvider "1" o-- "*" Assistant
  Message "1" --o "1" Process
  ProcessOutput o-- Message
  Thread "1" o-- "1...*" Message
  Store "1" o-- "*" Product
  Category "1" o-- "*" Product
    
  class User {
    -id : string
    -phoneNumber: string
    -name: string
    -isActive: boolean
    -createdAt: timestamp
    -updatedAt: timestamp
  }
  class Store {
    -id : string
    -name: string
    -address: string
  }
  class Category {
    -id : string
    -name: string
  }
  class Product {
    -id : string
    -name: string
    -unit: string
    -price: float
    -categoryId: string
    -storeId: string
  }
  class AIProvider {
    -id : string
    -name : string
  }
  class Assistant {
    -id : string
    - providerId: string
  }
  class Thread {
    -id : string
  }
  class Message {
    -id : string
    -threadId: string : fk
    -content: JSON
  }
  class Process {
    -type: enum
  }
  class ProcessOutput {
    processId : string
    messageId : string
    threadId : string
    assistantId : string
  }
```

### Whatsapp Conversation Workflow

```mermaid
sequenceDiagram
  User->>Whatsapp API: Send a text message
  Whatsapp API->>+Barilo API: forward message /webhook
  Barilo API-->>Rabbit MQ: [message.received]
  Barilo API-->>-Whatsapp API: Ok 204
  par
    Note over Barilo API,Mongo DB: Async
    Rabbit MQ->>Barilo API: [message.received]
    Barilo API->>ChatGPT: Get recipes
    ChatGPT-->>Barilo API: Recipes list
    Barilo API-->>Mongo DB: Save results
    Barilo API-->>Rabbit MQ: [recipe.created]
  end
  par
    Note over Barilo API,Internet: Async
    Barilo API->>Internet: Get recipes
    Internet-->>Barilo API: Return recipe links
    Barilo API-->>Whatsapp API: Process recipes and send response
    Whatsapp API-->>User: Here's some recipes!
  end
```