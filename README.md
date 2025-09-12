# BuyInBuyOut

BuyInBuyOut is a **Node.js + Express API** for managing purchase requests, approvals, and items.  
It uses **Prisma** as the ORM, **MySQL** as the database, and integrates **JWT-based authentication** with role-based approval flows.

AI was used to make this README, review the code and make suggestions to improve the code
---

## Features

- 🔐 **Authentication**  
  - Register with username, email, and password.  
  - Login to receive JWT tokens.  
  - Middleware-protected routes using `Bearer <token>`.

- 📦 **Purchase Requests**  
  - Create, list, update, and fetch user-owned requests.  
  - Submit requests for approval.  
  - Approve/Reject requests (restricted to approvers).  
  - View summary reports.

- 🛒 **Item Management**  
  - Create items with name and cost.  
  - Link items to purchase requests.

- 🗄️ **Database Layer**  
  - Prisma ORM with MySQL.  
  - Support for migrations and schema management.

---

## Tech Stack

- [Node.js](https://nodejs.org/)  
- [Express 5](https://expressjs.com/)  
- [Prisma ORM](https://www.prisma.io/)  
- [MySQL](https://www.mysql.com/)  
- [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)  
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)  

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Daniel-P-Lima/BuyInBuyOut.git
cd BuyInBuyOut
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://user:password@localhost:3306/buyinbuyout"
JWT_SECRET="your-secret-key"
PORT=3000
```

- `DATABASE_URL` → Prisma database connection string.  
- `JWT_SECRET` → Secret key used for signing JWT tokens.  
- `PORT` → Express server port (default: `3000`).  

### 4. Setup Prisma

Run the following to apply the schema:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run the server

```bash
npm start
```

The API will be available at:  
```
http://localhost:3000
```

---

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` — Register a new user.  
- `POST /auth/login` — Login and get a JWT.

### Purchase Requests (`/requests`)
- `GET /requests/` — List requests (mine).  
- `GET /requests/:id` — Get a specific request.  
- `POST /requests/` — Create a request.  
- `PATCH /requests/:id` — Update a request.  
- `POST /requests/:id/submit` — Submit a request.  
- `POST /requests/:id/approve` — Approve a request (approvers only).  
- `POST /requests/:id/reject` — Reject a request (approvers only).  
- `GET /requests/reports/summary` — Summary of requests.  
- `POST /requests/createItem` — Create an item.

---

## Scripts

- `npm start` → Runs the server with `nodemon`.  
- `npx prisma migrate dev` → Applies migrations.  
- `npx prisma studio` → Opens Prisma Studio (GUI for database).

---

## Project Structure

```
src/
 ├─ controllers/      # Route handlers
 │   ├─ auth.controller.js
 │   └─ requests.controller.js
 ├─ services/         # Business logic
 │   ├─ auth.services.js
 │   └─ requests.service.js
 ├─ middlewares/
 │   └─ auth.js       # JWT authentication middleware
 ├─ routes/
 │   ├─ auth.routes.js
 │   └─ requests.routes.js
 ├─ infra/
 │   └─ prisma.js     # Prisma client setup
 ├─ app.js            # Express app setup
 └─ server.js         # Entry point (starts server)
```

---

## Development Notes

- Passwords are hashed with **bcrypt (cost 12)**.  
- JWT tokens expire in **15 minutes**.  
- Approver role required for `approve` and `reject`.  
- Prisma schema must define `User`, `PurchaseRequest`, `RequestItems`, `Item`, and `ApprovalHistory` models.

---

## License

This project is licensed under the **ISC License**.
