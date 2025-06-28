# Smart Personal Finance Dashboard

This project is a simple Node.js backend that provides API endpoints for managing personal finances.

## Upload Endpoint

`POST /api/upload` accepts a CSV file (`multipart/form-data` under the `file` field) containing transactions. Valid rows are stored in the database and recurring transactions are detected automatically.

CSV columns supported: `date`, `vendor`, `amount`, `category`.

Response example:

```
{ "inserted": 12 }
```

## Savings Goals

The API exposes CRUD routes for managing savings goals:

- `POST /api/goals`
- `GET /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`

Each goal has a `goalName`, `targetAmount`, `currentSaved` and an optional `deadline`.

## Insights Endpoint

`GET /api/insights` returns quick statistics for the authenticated user including the top spending category this month, most frequent vendor and a savings trend for the last three months.

## Overview Endpoint

`GET /api/overview` returns the current month's totals for the authenticated user.

```
{
  income: number,
  expenses: number,
  savings: number
}
```

`savings` is calculated as `income - expenses`.

## Categorize Endpoint

`POST /api/categorize` accepts a JSON body with an `expenseDescription` string.
It returns a suggested category using OpenAI or keyword matching.

```
{
  "category": "Groceries"
}
```

## Deployment Tips

When deploying on platforms like **Render** or **Railway**:

1. Set environment variables from `.env.example` in the service settings. At a minimum you will need `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `OPENAI_API_KEY`.
2. Configure the build/start command to run `node server.js`.
3. Expose the port defined by the `PORT` variable (these platforms automatically provide one).
4. Ensure your MongoDB Atlas network rules allow connections from your hosting provider.

