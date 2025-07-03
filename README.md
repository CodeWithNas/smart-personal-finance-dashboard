# Smart Personal Finance Dashboard

A full‑stack application to track income, expenses, savings and investments. The project consists of a Node.js/Express API with MongoDB and a React dashboard built with Vite and Tailwind CSS.

## Tech Stack

### Backend
- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **JWT** authentication stored in HTTP cookies
- **Multer** for CSV uploads
- **OpenAI** API for expense categorization
- **dotenv**, **cors**, **cookie-parser**

### Frontend
- **React** with **Vite**
- **Tailwind CSS**
- **Recharts** for charts
- **React Router**
- **React Hot Toast** for notifications

### Tools
- PostCSS
- ESLint/Prettier (if configured)

## Setup

### Backend
1. Copy `.env.example` to `.env` and fill in your credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```

### Frontend
1. Install dependencies inside `client`:
   ```bash
   cd client && npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

## Environment Variables
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `CLIENT_URL` | Frontend URL (used for CORS) |
| `OPENAI_API_KEY` | API key for OpenAI categorization |
| `PORT` | Server port (default 3000) |

## API Endpoints

### Auth
- `POST /api/auth/register` – create a new user (sets JWT cookie)
- `POST /api/auth/login` – authenticate user (sets JWT cookie)

### Transactions
- `GET /api/transactions` – list all transactions
- `POST /api/transactions` – create a transaction
- `PUT /api/transactions/:id` – update transaction
- `DELETE /api/transactions/:id` – delete transaction

### Income & Expenses
- `GET /api/income` / `POST /api/income`
- `GET /api/expenses` / `POST /api/expenses`

### Savings
- `POST /api/savings` – create saving goal
- `POST /api/savings/:id/contribute` – add contribution
- `GET /api/savings` – list savings
- `PUT /api/savings/:id` – update goal
- `DELETE /api/savings/:id` – delete goal

### Investments
- `GET /api/investments`
- `POST /api/investments`
- `PUT /api/investments/:id`
- `DELETE /api/investments/:id`

### Goals
- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`

### Insights & Overview
- `GET /api/insights` – top category, frequent vendor and savings trend
- `GET /api/overview` – summary for current month

### File Upload & Categorization
- `POST /api/upload` – upload CSV of transactions
- `POST /api/categorize` – returns category suggestion using OpenAI

## Sample Request
```bash
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "secret"
}
```
Response:
```json
{ "token": "<jwt>" }
```

## Frontend Features
- JWT cookie based auth with protected routes
- Dashboard with income/expense charts
- Manage budgets, savings, investments and goals
- CSV upload for bulk transactions
- Request validation middleware protects the API
- AI powered expense categorization using OpenAI

## Folder Structure
```
.
├── server.js
├── models/
├── routes/
├── middleware/
├── client/
    ├── src/
        ├── pages/
        ├── components/
        ├── services/
```

## Deployment
1. Set env vars from `.env.example` on your host.
2. Build the frontend:
   ```bash
   cd client && npm run build
   ```
3. Serve `client/dist` with your preferred server or a static host and run `node server.js`.

## Screenshot
![Dashboard Screenshot](docs/screenshot.png)

## Contributing
PRs and issues are welcome! Feel free to open a discussion or contact the maintainer.

