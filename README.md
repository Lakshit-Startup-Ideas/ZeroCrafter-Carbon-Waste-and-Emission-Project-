# ZeroCraftr

Carbon emissions tracking and compliance reporting platform for small manufacturers.

## Overview

ZeroCraftr is a web-based SaaS platform that helps small manufacturing units track energy consumption, calculate carbon emissions, and generate compliance reports. The platform automates emission calculations using standard factors and provides AI-powered sustainability recommendations.

## Features

- User authentication with role-based access
- Energy and waste data entry
- Automated carbon emissions calculation (Scope 1 & 2)
- Interactive dashboard with data visualization
- PDF and CSV report generation
- AI-powered sustainability recommendations
- Multi-language support (English/Hindi)
- Responsive design for mobile and desktop

## Tech Stack

**Frontend**
- React.js 18+
- TailwindCSS
- Chart.js
- React Router
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt

**Deployment**
- Frontend: Vercel (free tier)
- Backend: Railway/Render (free tier)
- Database: MongoDB Atlas (free tier)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Git

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/zerocraftr.git
cd zerocraftr
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Environment Configuration

Create `.env` file in server directory:
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
LLAMA_API_KEY=your-llama-api-key
NODE_ENV=development
PORT=5000
```

Create `.env` file in client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start development servers
```bash
# From root directory
npm run dev
```

## Project Structure

```
zerocraftr/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── services/
│   └── package.json
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Data Management
- `GET /api/emissions` - Get emission records
- `POST /api/emissions` - Create emission record
- `PUT /api/emissions/:id` - Update emission record
- `DELETE /api/emissions/:id` - Delete emission record

### Reports
- `GET /api/reports/pdf` - Generate PDF report
- `GET /api/reports/csv` - Generate CSV export

### AI Recommendations
- `POST /api/ai/suggestions` - Get sustainability suggestions

## Usage

1. Register/Login to the platform
2. Enter energy consumption and waste disposal data
3. View calculated emissions on the dashboard
4. Generate compliance reports in PDF/CSV format
5. Get AI-powered recommendations for emission reduction

## Development

### Available Scripts

```bash
npm run dev          # Start development servers
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Backend (Railway/Render)
1. Connect repository to hosting platform
2. Set environment variables
3. Deploy from main branch

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

## Development Timeline

- Week 1-2: Setup, authentication, database design
- Week 3-4: Data entry and emissions calculator
- Week 5-6: Dashboard and visualization
- Week 7-8: Report generation
- Week 9-10: AI integration
- Week 11-12: Testing and deployment

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the development team.
