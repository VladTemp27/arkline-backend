
# Arkline HR Web Application

A comprehensive HR management system built with React frontend and Node.js microservices backend, designed for employee time tracking and accomplishment logging.

## 🏗️ Architecture

The system consists of four main components:

- **Frontend** (React/Vite) - User interface for time tracking and accomplishment management
- **User Service** (Node.js/Express) - User authentication and management
- **Accomplishment Tracker Service** (Node.js/Express) - Time logging and accomplishment tracking
- **Chatbot Service** (Node.js/Express) - AI-powered assistant for HR queries and support

## 📁 Project Structure

```
arkline-hr-webapp/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/          # React context providers
│   │   ├── styles/           # CSS and styling
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── chatbot-service/           # AI chatbot microservice
│   ├── index.js              # Main server file
│   ├── package.json
│   └── ...
├── seeder_service/            # Database seeding utilities
│   ├── seeder-simple.js      # Main seeder script
│   ├── seeder.js            # Alternative seeder
│   ├── package.json
│   └── SEEDER_README.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional, for services)

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Chatbot Service
```bash
cd chatbot-service
npm install
npm start
```

### Database Seeding
```bash
cd seeder_service
npm install
npm run seed
```

## 🎯 Features

### Time Management
- Clock in/out tracking
- Lunch break logging
- Real-time activity status
- Time log history

### Accomplishment Tracking
- Daily accomplishment logs
- Project assignment tracking
- Progress monitoring
- Team collaboration features

### AI Assistant
- HR query support
- Policy information assistance
- Time tracking guidance
- Employee support chat

### User Management
- Role-based access (admin, manager, employee)
- Authentication and authorization
- User profile management

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component primitives
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend Services
- **Node.js/Express** - Server framework
- **MongoDB** - Database
- **Redis** - Caching layer
- **JWT** - Authentication

## 📊 Sample Data

The seeder creates realistic test data including:

### Users
- `mike.wilson` (employee)
- `jane.smith` (admin)
- `bob.anderson` (employee)
- `alice.johnson` (manager)
- `john.doe` (manager)

### Data Types
- Time logs with realistic work patterns
- Accomplishment logs across different teams
- Project assignments and progress tracking
- Role-based permissions

## 🔧 Configuration

### Frontend Proxy Setup
The frontend is configured to proxy API requests:
- `/api/accomplishment-tracking` → `http://localhost:2010`
- `/api/user-service` → `http://localhost:2020`
- `/api/chatbot` → `http://localhost:2030`

### Environment Variables
Required environment variables for services:
```env
MONGO_USERNAME=admin
MONGO_PASSWORD=password
MONGO_HOST=localhost
MONGO_PORT=27017
SECRET_KEY=your_secret_key
```

## 🗄️ Database Schema

### User Service Database
```javascript
{
    username: 'mike.wilson',
    firstName: 'Mike',
    lastName: 'Wilson',
    password: 'mike123',
    role: 'employee'
}
```

### Accomplishment Tracker Database
```javascript
{
    userId: 'user_id',
    dates: {
        '2025-07-30': {
            timeLogs: {
                timeIn: '08:15:00',
                timeOut: '17:15:00',
                lunchBreakStart: '12:15:00',
                lunchBreakEnd: '13:15:00'
            },
            accomplishmentLog: {
                groupName: 'Frontend Team',
                activityType: 'Development',
                module: 'Dashboard',
                activities: [...],
                status: 'In Progress',
                percentageOfActivity: 60
            }
        }
    }
}
```

## 🎨 UI Components

The application uses a modern component library with:
- Responsive sidebar navigation
- Modal dialogs for form inputs
- Scroll areas for data lists
- Label components with accessibility features
- Consistent styling with CSS custom properties

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Sidebar navigation with collapsible menu
- Fixed navigation header
- Responsive grid layouts

## 🔍 Development

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Seeder
npm run seed         # Run database seeder
npm run seed:dev     # Run seeder in watch mode
npm run seed:test    # Run test seeder
```

## 📝 License

ISC

