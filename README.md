# Post2ProductAI

Post2ProductAI is a full-stack application that helps users convert their Instagram posts into Amazon product listings automatically and provides analytics to track sales performance across both platforms.

## Features

- Instagram Integration
  - Connect to Instagram Graph API
  - Fetch and display user's posts
  - Select posts to convert to products
  
- Amazon Integration
  - Automatic product listing generation
  - Image and description processing
  - Listing management through Amazon Marketplace API
  
- Analytics Dashboard
  - Track product performance
  - Monitor sales and engagement metrics
  - Visual data representation
  
- User Authentication
  - Secure login/signup system
  - OAuth integration for Instagram and Amazon
  - Role-based access control

## Tech Stack

- Backend: Flask (Python)
- Frontend: React with Tailwind CSS
- Database: MongoDB

## Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB 4.4+
- Instagram Developer Account
- Amazon Seller Account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/post2productai.git
cd post2productai
```

2. Set up the backend:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Update with your credentials
```

3. Set up the frontend:
```bash
cd client
npm install
```

4. Configure environment variables:
- Update `.env` file in the server directory with your credentials
- Update environment variables in the client directory if needed

## Running the Application

1. Start the backend server:
```bash
cd server
flask run
```

2. Start the frontend development server:
```bash
cd client
npm start
```

3. Access the application at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Instagram Endpoints

- POST `/api/instagram/connect` - Connect Instagram account
- GET `/api/instagram/posts` - Get user's Instagram posts

### Amazon Endpoints

- POST `/api/amazon/connect` - Connect Amazon seller account
- POST `/api/amazon/create-listing` - Create new product listing
- GET `/api/amazon/listings` - Get user's product listings

### Analytics Endpoints

- GET `/api/analytics/dashboard` - Get dashboard statistics
- GET `/api/analytics/product/:id` - Get product-specific analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Instagram Graph API
- Amazon Marketplace Web Service (MWS) API
- React and Flask communities

## Environment Variables

Copy the following variables to your `.env` file and update them with your values:

```
# MongoDB Connection String
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret Key (used for token signing)
JWT_SECRET_KEY=your-secret-key-here

# Debug mode (set to False in production)
DEBUG=True
```

## Setup

1. Create a `.env` file in the root directory
2. Copy the environment variables above and update them with your values
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `python server/app.py`

## API Documentation

[Add API documentation here]
