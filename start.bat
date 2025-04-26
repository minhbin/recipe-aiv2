@echo off
set DATABASE_URL=postgresql://neondb_owner:npg_5NFhbOWc6kxq@ep-rapid-waterfall-a4vwzbjk-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
set GEMINI_API_KEY=your_gemini_api_key_here
set NODE_ENV=development

echo Starting Recipe AI application...
echo Database: Neon PostgreSQL
echo.

REM Run database migrations if needed
echo Setting up database tables...
npx drizzle-kit push

REM Start the application in development mode
echo Starting server...
npx cross-env NODE_ENV=development tsx server/index.ts

echo.
echo If the server doesn't start, make sure you have run:
echo npm install
echo.
pause