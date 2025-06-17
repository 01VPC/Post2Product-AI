# 🛍️ Post2Product AI – Social Media to Amazon Listing Automation

**Post2Product AI** is a Generative AI-powered platform designed to help social media sellers (Instagram/Facebook) seamlessly convert their posts into SEO-optimized Amazon product listings. It automates listing creation, integrates with Amazon via SP-API, and offers a real-time analytics dashboard — bridging the gap between casual social selling and structured e-commerce.

---

## 🚀 Features

- 🔍 **Content Extraction**  
  Fetch captions, images, hashtags, and metadata from Instagram/Facebook using the Graph API.

- 🤖 **AI-Powered Product Generator**  
  NLP and Vision models convert social media content into structured, optimized Amazon listings.

- 📦 **Amazon SP-API Integration**  
  Seamless one-click upload of listings to Amazon.

- 📊 **Sales Dashboard**  
  Real-time analytics for views, clicks, conversions, and product performance.

- 🛒 **Inventory Sync** *(Planned)*  
  Auto-updates inventory between internal backend and Amazon.

- 📁 **Secure Data Storage**  
  User data, posts, listings, and analytics securely stored in MongoDB.

- 📷 **Image Enhancement** *(Optional)*  
  AI-based clarity, cropping, and optimization for product visuals.

---

## 🧱 Tech Stack

| Layer       | Technology                             |
|-------------|-----------------------------------------|
| **Frontend** | ReactJS, TailwindCSS                    |
| **Backend**  | Flask (Python), Blueprints architecture |
| **AI/ML**    | Open-source LLMs (GPT/BERT), Vision APIs|
| **Database** | MongoDB                                 |
| **APIs**     | Facebook Graph API, Amazon SP-API       |
| **Deployment**| AWS EC2, Firebase *(alternative)*       |
| **Versioning**| Git, GitHub                            |

---

## 🛠️ Workflow Overview

1. **Login & Connect**: User logs in and connects Instagram & Amazon accounts.
2. **Post Selection**: User selects an existing post or uploads a new one.
3. **Content Extraction**: System extracts captions, images, and metadata.
4. **AI Conversion**: AI generates a ready-to-publish Amazon product listing.
5. **User Review**: User reviews, edits (optional), and approves the listing.
6. **Publish to Amazon**: Listing is uploaded via SP-API.
7. **Analytics**: Dashboard displays real-time performance metrics and inventory.

---

## 🔐 Environment Setup

Create a `.env` file at the project root and add the following variables:

```env
GRAPH_API_KEY=your_graph_api_key
AMAZON_SP_API_KEY=your_amazon_sp_api_key
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key

# Clone the repository
git clone https://github.com/your-username/post2product-ai.git
cd post2product-ai/backend

# Install dependencies
pip install -r requirements.txt

# Run the Flask backend
python run.py

cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
