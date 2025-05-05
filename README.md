---

# parents.chat Enhanced

This is an upgraded version of parents.chat — now with a slick React frontend, a secure Node.js + Express backend, smart chatbot replies powered by GROQ’s gemma-2-9b-it model, and MongoDB to keep everything stored neatly.
It’s live and running on Render.

---

## ✨ What’s Inside

✅ Dark mode/Ligh mode toggle
✅ Login + signup
✅ Cleaner FAQ + chat UI
✅ Chat history saved in MongoDB
✅ Voice input for messages
✅ Bot replies with text-to-speech
✅ Secured backend (Express + MongoDB)
✅ GROQ API (using the gemma-2-9b-it model) for chatbot responses

---

## 🛠 Tech Stack

* **Frontend:** React, TailwindCSS, Vite
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **AI Integration:** GROQ API
* **Deployment:** Render

---

## 🚀 Live Demo

Check it out here:
👉 [parents.chat on Render](https://parents-chat-live.onrender.com)

---

## 💻 Run It Locally

Want to run this on your machine? Follow these steps.

### 1️⃣ Clone the repo

```bash
git clone https://github.com/Rohit-1301/Parents.chat.git
cd parents-chat-enhanced
```

### 2️⃣ Install dependencies

For both frontend and backend:

```bash
npm install
cd backend
npm install
cd ..
```

### 3️⃣ Set up environment variables

* **Backend (`/backend/.env`):**

```
MONGODB_URL=your_mongodb_connection_string
```

* **Frontend (`/.env`):**

```
VITE_GROQ_API_KEY=your_groq_api_key
```

### 4️⃣ Start the backend server

```bash
cd backend
npm start
```

### 5️⃣ Start the frontend app

In another terminal:

```bash
npm run dev
```

---

## 📂 Project Layout

```
/backend         → Express server  
/public          → Static files  
/src             → React app  
.env             → Frontend environment vars  
/backend/.env    → Backend environment vars (MongoDB)
```

---

## 🌐 API Connections

* **GROQ API** (gemma-2-9b-it): Powers the chatbot’s replies
* **MongoDB:** Saves users, chat logs, sessions

---

## ⚠ Important Note

After signing up or logging in, you might need to refresh the page once to see your username update in the header.

Also, for testing, feel free to use dummy emails like `ab@gmail.com` or `test123@example.com`. You don’t need a real email.

---

## 🤝 Contribute

Got ideas? Found bugs?
Fork the repo, improve things, and send a pull request.
You can also open an issue to report bugs or suggest features.

---
