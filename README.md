<!-- ```markdown -->

# Invoice Management System

## Overview

This project consists of two microservices: `invoice-creation-service` and `email-sender`. The `invoice-creation-service` handles the creation and management of invoices, while the `email-sender` listens for events and sends emails accordingly.

## Prerequisites

- Docker
- Docker Compose

## Setup

To start all the containers required for this project, run the following command in the project root:

```sh
docker-compose up
```

## Services

### Invoice Creation Service

This service is responsible for creating and managing invoices.

#### Endpoints

- **POST /invoices**: Create a new invoice.
- **GET /invoices**: Retrieve all invoices.
- **GET /invoices/:id**: Retrieve a single invoice by ID.

#### Environment Variables

- `MONGO_URI`: MongoDB connection string.
- `RABBITMQ_URI`: RabbitMQ connection string.

#### Key Files

- [invoice.controller.ts](invoice-creation-service/src/invoice.controller.ts): Defines the endpoints for invoice operations.
- [invoice.service.ts](invoice-creation-service/src/invoice.service.ts): Contains the business logic for managing invoices.
- [invoice.module.ts](invoice-creation-service/src/invoice.module.ts): Configures the module and its dependencies.
- [app.module.ts](invoice-creation-service/src/app.module.ts): Main application module.

#### Dockerfile

The Dockerfile for the `invoice-creation-service` is configured to use Node.js version 21, install dependencies, build the project, and start the application in production mode.

```dockerfile
FROM node:21
WORKDIR /app2
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

#### Testing

To run the tests for the `invoice-creation-service`, use:

```sh
npm run test
```

### Email Sender Service

This service listens for events and sends emails.

#### Event Handling

- **Event: summary_created**: Triggered when a summary is created.

#### Environment Variables

- `RABBITMQ_URI`: RabbitMQ connection string.

#### Key Files

- [email-sender.controller.ts](email-sender/src/email-sender.controller.ts): Handles incoming events and logs email sending.

#### Testing

To run the tests for the `email-sender`, use:

```sh
npm run test
```

## Development

### Building

To build the project, run:

```sh
npm run build
```

## Author

- [Ahsan Amin](mailto:amin.ahsan2@gmail.com)

