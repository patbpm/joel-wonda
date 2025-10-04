
# iTunes Search App

A simple iTunes search application built with React and Node.js that allows users to search the iTunes Store and save their favorite items.

## Features

- 🔍 **Search iTunes Store**: Find music, movies, podcasts, audiobooks, TV shows, and more
- 📱 **Simple Interface**: Clean, user-friendly design  
- ❤️ **Favorites List**: Save items you like (stored locally during session)
- 🔒 **Secure API**: JWT authentication for API requests
- 🎨 **Responsive Design**: Works on desktop and mobile

## Installation Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies  
```bash
cd frontend
npm install
```

## Running the Application

### 1. Start Backend Server
```bash
cd backend
npm start
```
Backend will run on: http://localhost:5000

### 2. Start Frontend (in a new terminal)
```bash
cd frontend  
npm start
```
Frontend will run on: http://localhost:3000

## How to Use

1. Open http://localhost:3000 in your browser
2. Enter a search term (e.g., "Taylor Swift", "Avengers", "Joe Rogan")
3. Select media type (music, movie, podcast, etc.) or leave as "all"
4. Click Search to see results
5. Click the heart icon to add/remove items from favorites
6. Use the "Favorites" tab to view saved items

## Project Structure

```
├── backend/           # Node.js Express server
│   ├── routes/        # API routes (auth, search)
│   ├── middleware/    # JWT authentication
│   ├── utils/         # Logger utility
│   └── app.js         # Express app configuration
├── frontend/          # React application  
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service
│   │   └── App.js      # Main app component
└── README.md
```

## API Endpoints

- `POST /api/auth/token` - Generate JWT token
- `GET /api/search` - Search iTunes Store
- `GET /health` - Health check

## Technologies Used

**Backend:**
- Node.js & Express
- JWT for authentication  
- Axios for iTunes API calls
- Helmet for security
- Morgan for logging

**Frontend:**
- React 19
- Axios for API calls
- Lucide React for icons
- CSS for styling

## Notes

- No user registration required
- Favorites are stored in memory (lost when page refreshes)
- Uses iTunes Search API (no API key needed)
- Simple and lightweight implementation