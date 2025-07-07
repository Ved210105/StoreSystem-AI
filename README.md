# StoreSystem-AI 🛒

A full-stack e-commerce platform with AI-powered features including AR visualization, chatbot assistance, and intelligent product recommendations.

## 🚀 Features

- **AI-Powered Chatbot**: Intelligent customer support with markdown rendering
- **AR Product Visualization**: Augmented reality product previews
- **Smart Recommendations**: AI-driven product suggestions
- **User Authentication**: Secure login/register system with JWT
- **Admin Dashboard**: Complete product and order management
- **Real-time Notifications**: Live updates for orders and messages
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🏗️ Project Structure

```
Hackathon-Project/
├── backend/                 # Node.js/Express API
│   ├── middleware/         # Authentication & authorization
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   └── utils/             # Helper functions
├── frontend/              # React TypeScript app
│   ├── src/
│   │   ├── components/    # React components
│   │   └── assets/        # Static assets
│   └── public/            # Public files
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Marked** - Markdown rendering
- **DOMPurify** - XSS protection

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/Ved210105/StoreSystem-AI.git
cd StoreSystem-AI
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/storesystem
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

Start the backend server:
```bash
npm start
# or for development with nodemon
npx nodemon server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/storesystem
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Ensure MongoDB is accessible
3. Deploy to platforms like:
   - Heroku
   - Vercel
   - Railway
   - DigitalOcean

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Firebase Hosting

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### AI Assistant
- `POST /api/assistant/chat` - Chat with AI assistant

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ved Suthar**
- GitHub: [@Ved210105](https://github.com/Ved210105)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database
- All contributors and supporters

---

⭐ **Star this repository if you found it helpful!**
