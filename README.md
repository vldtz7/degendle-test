# DEGENDLE 🎮

A daily crypto guessing game with serverless API for secure answer validation.

## Features

- 🔒 **Secure** - Answers stored server-side, never exposed to client
- 📅 **Daily puzzles** - Same puzzle for everyone, changes at 00:00 UTC
- 💾 **Progress saved** - LocalStorage remembers your guesses
- 🚦 **Rate limited** - Prevents brute force attacks
- ⭐ **Animations** - Stars rain on win, tears fall on lose

## Project Structure

```
degendle-app/
├── app/
│   ├── api/
│   │   ├── puzzle/
│   │   │   └── route.js    # GET - Returns today's hint (no answer!)
│   │   └── guess/
│   │       └── route.js    # POST - Validates guesses server-side
│   ├── layout.jsx          # Root layout
│   └── page.jsx            # Main game component
├── package.json
├── next.config.js
└── README.md
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy!

The serverless functions (`/api/puzzle` and `/api/guess`) work automatically.

### Other Platforms

Works with any platform that supports Next.js 16.1+:
- Netlify
- AWS Amplify
- Railway
- Render

## Adding Puzzles

Edit the `puzzles` array in both API routes:

```javascript
// In /app/api/puzzle/route.js and /app/api/guess/route.js
const puzzles = [
  { hint: "WAGBO", answer: "okay bears", category: "NFT Project" },
  { hint: "GMGM", answer: "good morning", category: "Crypto Slang" },
  // Add more puzzles here...
];
```

**Pro tip:** In production, move puzzles to a database (Vercel KV, Supabase, etc.) and create a shared module to avoid duplication.

## API Endpoints

### GET /api/puzzle

Returns today's puzzle hint (never the answer!).

**Response:**
```json
{
  "hint": "WAGBO",
  "category": "NFT Project",
  "dayNumber": 740
}
```

### POST /api/guess

Validates a guess server-side.

**Request:**
```json
{
  "guess": "okay bears",
  "guessNumber": 1
}
```

**Response (correct):**
```json
{
  "correct": true,
  "guessNumber": 1,
  "gameOver": true,
  "answer": "okay bears"
}
```

**Response (wrong, game continues):**
```json
{
  "correct": false,
  "guessNumber": 1,
  "gameOver": false
}
```

**Response (wrong, game over):**
```json
{
  "correct": false,
  "guessNumber": 5,
  "gameOver": true,
  "answer": "okay bears"
}
```

## Security

- ✅ Answers never sent to client until game over
- ✅ Rate limiting (20 requests/minute per IP)
- ✅ Input validation on all endpoints
- ✅ No answer in client-side code

## Tech Stack

- Next.js 16.1
- React 19.2
- Serverless API Routes

---

by vldtz x claude
