---

# parents.chat Enhanced Version

This project is an upgraded version of the original **parents.chat** website. It includes a React frontend, a Node.js + Express backend, integration with the **GROQ API** for chatbot responses, and **MongoDB** for data storage.
The project is deployed live on **Render**.

---

## ✨ Features

✅ Dark mode toggle
✅ Login and signup system
✅ Improved FAQ and chat UI
✅ Chat history storage (MongoDB)
✅ Voice input for chat
✅ Text-to-speech bot replies
✅ Secure backend with Express + MongoDB
✅ Integrated GROQ API for chatbot responses

---

## 🛠 Tech Stack

* **Frontend** → React, TailwindCSS, Vite
* **Backend** → Node.js, Express
* **Database** → MongoDB
* **AI** → GROQ API
* **Deployment** → Render

---

## 🚀 Live Demo

You can check out the deployed site here:
👉 [Live on Render](https://parents-chat-live.onrender.com)

---

## 💻 Local Setup Instructions

Follow these steps to run the project locally:

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Rohit-1301/Parents.chat.git
cd parents-chat-enhanced
```

### 2️⃣ Install frontend & backend dependencies

```bash
npm install
cd backend
npm install
cd ..
```

### 3️⃣ Set up environment variables

* In the **backend** folder, create a `.env` file:

```
MONGODB_URL=your_mongodb_connection_string
```

* In the **main project root** (outside backend), create another `.env` file:

```
VITE_GROQ_API_KEY=your_groq_api_key
```

### 4️⃣ Run the backend server

```bash
cd backend
npm start
```

### 5️⃣ Run the frontend app

In another terminal window:

```bash
npm run dev
```

---

## 📂 Project Structure

```
/backend         → Node + Express backend server  
/public          → Static public assets  
/src             → React app source code  
.env             → Frontend environment variables (GROQ API key)  
/backend/.env    → Backend environment variables (MongoDB URL)
```

---

## 🌐 API Integrations

* **GROQ API** → Handles chatbot responses.
* **MongoDB** → Stores user data, chat history, and session details.

---

## 🤝 Contributions

Feel free to fork, improve, and submit a pull request!
If you find any bugs or want to suggest features, open an issue.

---


