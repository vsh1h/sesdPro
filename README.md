# Library Management System – Backend

A Library Management System backend API built using Node.js, TypeScript, Express, and MongoDB. The project follows Object-Oriented Programming (OOP) principles and a clean layered architecture to ensure scalability, maintainability, and clarity.

This backend application implements real-world features such as CRUD operations, authentication, validation, search, filtering, pagination, and centralized error handling.

---

## Features

- CRUD operations for Books, Users, and Borrow records  
- Role-based access control (Admin and Member)  
- Book borrowing and return functionality  
- Automatic tracking of book availability  
- Full-text search on books  
- Filtering, sorting, and pagination  
- JWT-based authentication  
- Centralized error handling  
- Clean OOP architecture (Controller → Service → Repository)

---

## Architecture

The application follows a clear separation of concerns:

```txt
Controller → Service → Repository → Database
```

- Controllers handle HTTP requests and responses
- Services contain business logic and validations
- Repositories manage database interactions
- Models define entities and schemas

---

## Technology Stack

- Node.js
- TypeScript
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt

---

## Sample API Request

```http
GET /api/books?search=harry&page=1&limit=10&sort=title
```

This endpoint supports search, filtering, sorting, and pagination.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5550
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Running the Project Locally

```bash
npm install
npm run dev
```

The server will start at:

```
http://localhost:5550
```

---

## Purpose

This project was developed to demonstrate Object-Oriented Programming concepts, clean backend architecture, and real-world REST API development using TypeScript.

---

