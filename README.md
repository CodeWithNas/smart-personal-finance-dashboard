# Smart Personal Finance Dashboard

This project is a simple Node.js backend that provides API endpoints for managing personal finances.

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

