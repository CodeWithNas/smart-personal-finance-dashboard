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
