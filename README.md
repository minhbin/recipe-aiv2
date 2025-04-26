# Recipe AI

Recipe AI is an AI-powered conversational cooking assistant that provides instant culinary guidance through an intelligent chatbox interface. It delivers personalized recipe generation and cooking support using Google's Gemini API.

## Features

- **AI Chat Interface**: Conversational interface for recipe requests and cooking questions
- **Meal Planner**: Generate and save personalized meal plans for the week
- **Saved Plans**: View, manage, and clear saved meal plans

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS for styling
- **Backend**: Express.js server
- **AI**: Google Gemini AI API integration
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query for data fetching
- **UI Components**: Customized Shadcn/UI components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database
- Google Gemini API key

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/recipe-ai.git
cd recipe-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/recipe_ai
GEMINI_API_KEY=your_gemini_api_key
```

4. Initialize the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## Usage

- **Chat Interface**: Ask any cooking or recipe related question
- **Meal Planner**: Generate daily or weekly meal plans
- **Saved Plans**: Access your saved meal plans

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the recipe generation
- Shadcn/UI for the component library
- Replit for development and hosting services