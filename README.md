# Kapsul 💊

<div align="center">
  <img src="public/kapsul.svg" alt="Kapsul Logo" width="120" height="120" />
  <h1>The Operating System for Your Second Brain</h1>
  
  <p>
    <strong>Capture. Organize. Recall.</strong><br/>
    A premium, cinematic interface for managing your digital life.
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a>
  </p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
</div>

<br />

## ✨ Features

Kapsul provides a seamless experience for capturing and organizing your thoughts, links, and media.

- 🔐 **Secure Authentication**: Robust sign-up and sign-in flow powered by Firebase, including Google Auth support.
- 🎨 **Cinematic UI/UX**: A dark-themed, glassmorphic design with smooth animations and transitions using Framer Motion.
- 📱 **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- 🚀 **Performance**: Built on Vite for lightning-fast development and production builds.
- 🧩 **Modular Components**: Uses a modern component architecture with Shadcn/UI and Lucide icons.
- 🧠 **Second Brain Functionality**:
    - 📹 Save Videos
    - 🔗 Save Links
    - 📝 Write Notes
    - 🔍 Global Search
    - ⌨️ Keyboard First (Command Palette)

## 🛠 Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend / Auth**: [Firebase](https://firebase.google.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router](https://reactrouter.com/)
- **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kapsul.git
   cd kapsul
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory (use `.env.example` as a reference if available) and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5173` to view the application.

## 📂 Project Structure

```bash
kapsul/
├── public/              # Static assets (icons, images)
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Header, Sidebar, etc.
│   │   ├── ui/          # Shadcn UI components
│   │   └── ...
│   ├── lib/             # Utilities (utils, firebase config)
│   ├── pages/           # Page components (Auth, Dashboard, etc.)
│   ├── store/           # State management (Zustand)
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables
├── package.json         # Project dependencies and scripts
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ for the thinkers and creators.</p>
</div>
