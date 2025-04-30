# DreamForger 🚀

DreamForger is an innovative platform designed to help students break free from digital distractions and focus on achieving their dreams. By providing personalized roadmaps, skill development tracking, and a supportive community, DreamForger transforms aspirations into actionable goals.

## 🌟 Features

### Personalized Dream Roadmaps
- AI-powered skill generation based on your dream
- Customized learning paths with clear milestones
- Progress tracking and achievement system

### Skill Development
- Interactive skill mastery roadmaps
- Task-based learning approach
- Real-time progress tracking
- Achievement system with XP and quests

### Community & Support
- Connect with like-minded dreamers
- Find study buddies with similar goals
- Location-based buddy matching
- AI Mentor for personalized guidance

### Smart Features
- AI-powered mentor chat
- Voice interaction capabilities
- Personalized recommendations
- Progress analytics

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn-ui for components
- Framer Motion for animations

### Backend
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM
- Alembic for migrations
- Pydantic for data validation

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+
- PostgreSQL

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload
```

## 🌐 Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## 📝 License

This project is licensed under the MIT License.
