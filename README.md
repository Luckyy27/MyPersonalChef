# My Personal Chef

My Personal Chef is a full-stack recipe application that lets users browse recipes, view step-by-step instructions, save favorites, and get recipe suggestions based on the ingredients they already have.

This repository contains:

- `frontend/`: React web application
- `backend/`: Node.js + Express REST API connected to MongoDB

## Demo (Local)

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Why this project exists

This project was built to demonstrate a complete MERN-style application with:

- A responsive, modern UI
- A REST API that persists data in MongoDB
- Admin CRUD workflows
- A “pantry match” feature that turns user ingredients into recipe suggestions

## Key Features

### User Features

- Browse recipes
- Search recipes by title
- Filter recipes by category (Veg / Non-Veg) and type (Breakfast, Desserts, Fast Food, etc.)
- View recipe details (ingredients, steps, cooking time, difficulty, etc.)
- Watch recipe videos (optional YouTube link)
- Save and manage favorites
- Pantry suggestions
  - Add ingredients you have
  - Get recipe recommendations ranked by ingredient matches
  - Requires a minimum of 3 ingredients for better quality suggestions

### Admin Features

- Add recipes
- View all recipes
- Edit recipes (including category, type, and YouTube URL)
- Delete recipes
- Review and moderate user feedback

## Tech Stack

### Frontend

- React (Create React App)
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express
- Mongoose
- MongoDB
- CORS

## Project Structure

```text
My-Personal-Chef/
  backend/
    models/
    server.js
    package.json
  frontend/
    public/
    src/
    package.json
  README.md
```

## How the app works (High Level)

### Data Flow

- The React frontend calls the Express API using `fetch()`.
- The API reads/writes recipes, users, favorites, and feedback in MongoDB.

### Pantry Suggestions (How matching works)

1. The user adds ingredients to the pantry.
2. The frontend POSTs them to `POST /recipes/pantry-match`.
3. The backend loads all recipes and counts approximate ingredient matches.
4. Results are filtered to recipes with at least **3 matching ingredients** and sorted by match count.

## Local Setup

### Prerequisites

- Node.js (LTS recommended)
- MongoDB Community Server (running locally)

### 1) Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2) Environment variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/my_personal_chef
JWT_SECRET=replace_with_a_secure_random_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Important note:

- The current backend code connects directly to `mongodb://127.0.0.1:27017/my_personal_chef` in `server.js`. If you want `.env` to be authoritative, update the backend to read `process.env.MONGO_URI`.

Gemini AI note:

- `GEMINI_API_KEY` is required for the YouTube Recipe Auto-Fill feature (admin-only). Do not commit this key.

### 3) Start MongoDB

Make sure MongoDB is running and accessible at `mongodb://127.0.0.1:27017`.

### 4) Run the backend

From `backend/`:

```bash
node server.js
```

You should see:

- `MongoDB connected`
- `Server running on port 5000`

### 5) Run the frontend

From `frontend/`:

```bash
npm start
```

## Application Routes (Frontend)

Note: routes are defined in `frontend/src/App.js`.

User-facing:

- `/` Home
- `/recipes` All recipes
- `/recipe/:id` Recipe details
- `/favorites` Favorites
- `/pantry` Pantry suggestions

Admin:

- `/admin/add-recipe` Add recipe
- `/admin/view-recipes` Manage recipes
- `/admin/feedback` Feedback moderation

## API Reference (Backend)

Base URL:

- `http://localhost:5000`

### Recipes

- `GET /recipes`
  - Returns all recipes (sorted by newest first)
- `GET /recipes/:id`
  - Returns a single recipe
- `POST /add-recipe`
  - Creates a recipe
- `PUT /recipes/:id`
  - Updates a recipe
- `DELETE /recipes/:id`
  - Deletes a recipe
- `POST /recipes/pantry-match`
  - Body:

    ```json
    { "ingredients": ["tomato", "onion", "rice"] }
    ```
  - Returns ranked matches with an extra `matchCount` field

### AI (Gemini) – YouTube Recipe Auto-Fill

- `POST /api/ai/import-recipe`
  - Purpose: Extract recipe fields from a YouTube video using Gemini.
  - Body:

    ```json
    {
      "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
    }
    ```

  - Response:
    - `status`: `"ok"` | `"partial"` | `"error"`
    - `source`: `"transcript"` or `"description"`
    - `confidence`: number (0..1)
    - `recipe`: `{ title, ingredients, steps, cookingTime, difficulty, image }`
    - `transcript`: metadata about transcript attempts (useful for debugging)

- `GET /api/ai/models`
  - Lists available Gemini models for your API key (debug endpoint).

### Auth / Users

- `POST /create-user`
- `POST /login`

### Favorites

- `GET /favorites/:email`
- `POST /favorites/:email`
- `DELETE /favorites/:email/:recipeId`

### Feedback

- `POST /api/feedback`
- `GET /api/feedback`
- `PATCH /api/feedback/:id`
- `DELETE /api/feedback/:id`

## Data Model (MongoDB)

### Recipe

Recipes are stored in MongoDB and include fields such as:

- `title`
- `ingredients` (array)
- `steps` (array)
- `image`
- `rating`
- `cookingTime`
- `difficulty`
- `category`
- `type`
- `servings`
- `heatLevel`
- `youtubeUrl` (optional)
- `createdAt`

## Recipes Page Filters (Category + Type)

The `/recipes` page supports two-level filtering:

- **Category (primary)**
  - `Veg` / `Non-Veg`
- **Type (secondary)**
  - `Breakfast`, `Desserts`, `Fast Food`, `Lunch`, `Dinner`, `Snacks`, `Beverages`, `Other`

Admins set these values when adding or editing recipes.

## YouTube Support

If a recipe has a valid `youtubeUrl`, the recipe detail page extracts the video ID and plays it in a modal.

Supported formats include:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

## Gemini YouTube Recipe Auto-Fill (Admin)

This project includes an admin workflow to auto-fill the recipe form from a YouTube URL.

Where:

- Frontend: `frontend/src/pages/AdminAddRecipe.js`
- Backend: `backend/server.js` (`POST /api/ai/import-recipe`)

How to use:

1. Open the Admin Add Recipe page.
2. Paste a YouTube URL into **YouTube URL (Auto-Fill)**.
3. Click **Auto-Fill from YouTube**.
4. Review the populated fields, make edits if needed, then click **Publish Recipe**.

Notes:

- The feature does not auto-save. It only fills the form.
- If `image` is missing from AI output, the backend uses the YouTube thumbnail as a safe fallback.
- `steps` may be returned as an array or as a single string; the backend normalizes both.

## Troubleshooting

### Pantry shows “minimum 3 ingredients” even after typing 3

If you typed `tomato,onion,rice` as a single entry, the pantry would previously count it as **one** ingredient.

The pantry input now supports comma-separated entries, so:

- `tomato,onion,rice` becomes 3 ingredients

### No pantry results even after adding ingredients

- Add ingredients that actually exist in your saved recipes’ ingredient lists.
- Try broader ingredients (e.g., `onion`, `tomato`, `oil`) to test matching.

### Frontend can’t reach backend

- Confirm backend is running at `http://localhost:5000`
- Confirm CORS allows `http://localhost:3000`

### Auto-Fill adds image + ingredients but not steps

Common reasons:

- The YouTube video transcript/captions are not accessible (blocked/disabled), so the backend falls back to the video description.
- The video description contains ingredients but does not contain step-by-step instructions.

What to check:

- Call the endpoint directly and inspect the response fields:
  - `source` should tell you if it used `transcript` or `description`.
  - `transcript.success` indicates whether captions were successfully fetched.
- Try a different video where the description includes numbered steps, or a video with accessible captions.
- If you consistently see transcript failures, the limitation is on the YouTube side; the backend will still return partial results.

### MongoDB connection issues

- Confirm MongoDB is running
- Confirm the connection string in `backend/server.js`

## Security Notes

- Current auth is simplified (plain password comparison). Do not use as-is for production.
- If you plan to deploy, add proper password hashing, input validation, and secure session/JWT handling.

## Future Improvements

- Use `.env` values for MongoDB URI and port consistently
- Replace plaintext auth with hashed passwords
- Add server-side input validation (e.g., Joi/Zod)
- Add pagination for large recipe lists
- Add automated tests
- Add a production deployment guide (Render/Netlify/Vercel)

## License

This project is provided for educational use. Add an explicit license if you plan to distribute it.
