# 📝 Blogify

A clean and minimal blogging platform where you can create, edit, and share your thoughts with the world.

🌐 **Live Demo:** [blogify-client-c15r.onrender.com](https://blogify-client-c15r.onrender.com)

---

## ✨ Features

- 🔐 **User Authentication** — Secure sign up & login
- ✍️ **Create Blogs** — Write and publish your own blog posts
- ✏️ **Edit Blogs** — Update your posts anytime
- 🗑️ **Delete Blogs** — Remove posts you no longer need
- 👤 **User Dashboard** — Manage all your blogs in one place

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB |
| **Hosting** | Render |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/blogify.git
cd blogify
```

---

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm start
```

> Server runs on `http://localhost:5000`

---

### 3. Setup the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file inside the `client` folder:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

> App runs on `http://localhost:3000`

---

## 📁 Project Structure

```
blogify/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
│
├── server/          # Node/Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
│
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

---

## 📸 Screenshots

> _Coming soon — add your screenshots here!_

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📬 Support

Found a bug or have a suggestion? Open an [Issue](../../issues) and I'll get back to you!

---

> Made with ❤️ by adi
