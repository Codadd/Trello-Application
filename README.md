# Trello Clone - Project Assignment

A modern Trello-like task management application built with React, Firebase, and Vite. This project allows users to create boards, lists, and cards with drag-and-drop functionality.

## Features

- **User Authentication**: Google Sign-In via Firebase Authentication
- **Board Management**: Create, edit, and delete boards
- **List Management**: Add lists within boards
- **Card Management**: Create cards with titles and descriptions
- **Drag & Drop**: Intuitive drag-and-drop using @dnd-kit
- **Real-time Updates**: Data syncs automatically with Firebase Firestore
- **Responsive Design**: Works on desktop and mobile devices
- **Private Routes**: Protected pages requiring authentication

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM v7
- **Backend**: Firebase (Authentication + Firestore)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable

## Installation

1. **Clone the repository:**

   ```bash
   git clone <your-gitlab-repo-url>
   cd trello-assignment
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Set up Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google Provider)
   - Enable Firestore Database
   - Copy your config to `.env` file

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
trello-assignment/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Card.jsx       # Card component
│   │   ├── List.jsx       # List component
│   │   ├── Navbar.jsx     # Navigation bar
│   │   └── PrivateRoute.jsx # Protected route wrapper
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx   # Authentication context
│   │   └── BoardContext.jsx  # Board state management
│   ├── firebase/          # Firebase configuration
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Home/dashboard page
│   │   ├── BoardDetail.jsx # Individual board view
│   │   └── SignIn.jsx     # Sign-in page
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables (NOT committed)
├── .gitignore             # Git ignore rules
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json           # Dependencies
├── postcss.config.js      # PostCSS config
├── tailwind.config.js    # Tailwind config
└── vite.config.js         # Vite config
```

## Security Rules

### Firebase Firestore Rules (Recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /boards/{boardId} {
      allow read, write: if request.auth != null;
    }
    match /boards/{boardId}/lists/{listId} {
      allow read, write: if request.auth != null;
    }
    match /boards/{boardId}/lists/{listId}/cards/{cardId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Merge Request

## License

This project is for educational purposes as part of an assignment.

## Author

Your Name - [Your GitLab Profile]

## Acknowledgments

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Firebase](https://firebase.google.com/) - Google's app development platform
- [@dnd-kit](https://dndkit.com/) - Lightweight drag and drop library
