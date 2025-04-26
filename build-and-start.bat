@echo off
set DATABASE_URL=postgresql://neondb_owner:npg_5NFhbOWc6kxq@ep-rapid-waterfall-a4vwzbjk-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
set GEMINI_API_KEY=your_gemini_api_key_here
set NODE_ENV=production

echo Building Recipe AI application...
echo.

REM Build the application
echo Building frontend...
npx vite build

echo Building backend...
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

REM Start the application in production mode
echo.
echo Starting server in production mode...
npx cross-env NODE_ENV=production node dist/index.js

pause