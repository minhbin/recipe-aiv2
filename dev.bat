@echo off
set NODE_ENV=development
echo Starting Recipe AI in development mode...
npx cross-env NODE_ENV=development tsx server/index.ts