# 🎫 Concert Booking Microservices

NestJS-based microservice system for booking concert tickets, using MongoDB, Redis, RabbitMQ, and gRPC.

## Features

- Auth service with JWT login/signup  
- Booking with Redis seat locking and MongoDB persistence  
- RabbitMQ-based seat booking event flow  
- gRPC call from booking-service to concert-service to validate concert data  
- Clean architecture with DTOs, services, and guards  
- Dockerized microservices with isolated `.env` configs  

## 🛠 Project Scaffold

Each service was created using NestJS CLI:

```bash
nest new auth-service
nest new booking-service
nest new concert-service
```

Each service lives in `apps/`, with its own MongoDB connection and optional Redis/RabbitMQ setup.

## ⚙️ Running the System

Use Docker Compose to start everything:

```bash
docker-compose up -d
```

This will launch:

- MongoDB instances for each service  
- Redis for booking-service  
- RabbitMQ broker  
- Auth, Booking, and Concert services  

If having a problem with MONGO_URL format from .env, please fix like this:

```bash
export MONGO_URL=mongodb://concert_user:concert_pass@localhost:27017/<your-db>?authSource=admin
```

## MongoDB Seeding Required

Before using the system, you must seed the concert and seat data into MongoDB.

> A seeding script is already provided in the project.

To run the seed script: npm run seed

## Start Services
We can run the three services in parallel using concurently:

```bash
npm run start:dev
```
## RabbitMQ Setup

RabbitMQ is used for asynchronous messaging between services.

- `booking-service` publishes `seat.booked` after a successful booking  
- `concert-service` consumes `seat.booked` and updates seat data in MongoDB  

Each service uses its own connection and channel (via `amqplib`).  
Exchange: `seat.exchange`  
Routing key: `seat.booked`  
Queue: `seat.booked.queue`

## 📡 gRPC Setup

gRPC is used for synchronous calls:

- `booking-service` calls `concert-service` to validate concert info before booking  

The `.proto` file defines a `GetConcert` method, which is implemented in `concert-service` using `@GrpcMethod()`.

## ⚠️ Missing Feature: Add Seats API

This system intentionally skips the "Add Seats" API.

Normally, that endpoint would:

1. Accept new seat data via HTTP  
2. Insert them into MongoDB  
3. Initialize Redis stock using keys like:  
   ```
   concert:<concertId>:seat_type:<seatTypeId>:seat:<seatId>:stock = 1
   ```

Since this feature was left out to focus on booking and message flow, Redis must be preloaded manually before booking.  
If Redis is empty, the system will return "Tickets sold out".

## 🔐 Auth (JWT)

All protected routes require:

```
Authorization: Bearer <your_token>
```

Example payload inside the token:

```json
{
  "sub": "user_id",
  "email": "user@example.com"
}
```

`user_id` is extracted using `@CurrentUserId()` decorator.

## 📦 API Endpoints

| Method | Route           | Description                    |
|--------|------------------|--------------------------------|
| POST   | /auth/signup     | Register new user              |
| POST   | /auth/login      | Authenticate and get JWT       |
| POST   | /bookings        | Book a seat (requires JWT)     |
| GET    | /bookings/my     | View current user's bookings   |

## 📂 Project Structure

```
apps/
├── auth-service/
├── booking-service/
│   ├── grpc/
│   ├── rabbitmq/
│   └── redis/
└── concert-service/
    ├── proto/
    ├── consumer/
    └── database/
```

## ⚠️ Notes

- Redis keys must be preloaded before booking works  
- MongoDB URLs must be exported manually if not using Docker  
- RabbitMQ and gRPC must be active for full booking flow to function  
