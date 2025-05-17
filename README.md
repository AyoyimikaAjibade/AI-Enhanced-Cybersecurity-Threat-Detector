# AI-Enhanced Cybersecurity Threat Detector

An advanced cybersecurity application that uses AI and machine learning to detect and analyze potential security threats in network traffic and system logs.

## Features

- **Real-time Threat Detection**: Monitors network traffic and system logs to identify anomalies and potential security threats
- **AI-Powered Analysis**: Utilizes transformer models to analyze patterns and predict potential threats
- **Interactive Dashboard**: Visualizes security metrics, alerts, and system status
- **Alert Management**: Tracks and manages security alerts with severity levels and resolution status
- **Network Traffic Analysis**: Detailed analysis of network packets with anomaly highlighting
- **User Authentication**: Secure login and registration system

## Tech Stack

### Frontend
- React.js
- Material UI
- Chart.js for data visualization
- Axios for API communication

### Backend
- Flask (Python)
- Flask-JWT-Extended for authentication
- SQLAlchemy for database ORM
- PostgreSQL for data storage
- Redis for caching and real-time features

### Machine Learning
- PyTorch
- Hugging Face Transformers
- Scikit-learn

### Infrastructure
- Docker and Docker Compose for containerization
- Nginx for serving the frontend and proxying API requests

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AyoyimikaAjibade/AI-Enhanced-Cybersecurity-Threat-Detector.git
cd AI-Enhanced-Cybersecurity-Threat-Detector
```

2. Start the application using Docker Compose:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost
   - pgAdmin (Database Management): http://localhost:5050
     - Email: admin@example.com
     - Password: admin

### Development

To rebuild containers after making changes:
```bash
docker-compose build
docker-compose up -d
```

## Project Structure

```
.
├── backend/                  # Flask backend API
│   ├── api/                  # API routes and controllers
│   ├── models/               # Database models
│   ├── services/             # Business logic and services
│   ├── ml/                   # Machine learning models and utilities
│   └── Dockerfile            # Backend container configuration
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── App.js            # Main application component
│   │   └── index.js          # Entry point
│   └── Dockerfile            # Frontend container configuration
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Hugging Face for transformer models
- Material UI for the component library
- Chart.js for data visualization components