AI Employee by Fly Hi Social
An AI-powered digital marketing assistant designed to automate social media for Indian SMEs. This full-stack application provides a chat-based interface for business owners to generate, schedule, and publish high-quality, branded social media content.

🚀 About The Project
"AI Employee" is a SaaS platform built to solve a core problem for millions of small and medium-sized businesses in India: the lack of time, budget, and expertise for digital marketing. This application acts as a virtual employee, handling everything from content ideation and creation (including images, videos, and carousels) to scheduling and publishing, with a special focus on local, regional, and cultural relevance.

Core User Flow:

A user signs up and provides basic details about their brand (name, industry, voice, logo).

Through a simple chat interface, they request a campaign (e.g., "a post for our weekend special").

The AI backend generates a complete, multi-format campaign with branded visuals and multiple caption options.

The user can then schedule the post using a content calendar or (in a future version) post it directly to their connected social media accounts.

✨ Key Features
Multi-Modal AI Content: Generates single images, carousels, and videos with text overlays.

Brand Personalization: Automatically watermarks all visual content with the user's uploaded logo.

Strategic Planning: Features AI-powered brainstorming and a 7-day content planner.

Content Calendar: A visual interface to view and manage all scheduled posts.

Secure User Accounts: Full authentication system using Firebase.

Admin Dashboard: A separate, private dashboard to monitor user activity and platform analytics.

🛠️ Built With
This project uses a modern, scalable, serverless architecture.

Frontend: HTML, Tailwind CSS, JavaScript (ES Modules)

Backend: Node.js, Express.js

Database: Firebase Firestore

User Authentication: Firebase Authentication

AI Models:

Text & Strategy: Google Gemini Pro

Image Generation: Google Imagen 3

Deployment: Netlify (for both frontend and serverless functions)

📂 Project Structure
For a successful deployment, your project folder should be structured exactly like this:

ai-employee-app/
  ├── ai_employee_v1.html
  ├── netlify.toml
  ├── package.json
  └── functions/
      └── server.js

Note: The admin_dashboard.html file is a separate, standalone tool and should be kept outside of this main project folder for security.

⚙️ Getting Started
To get your project live, follow these simple steps.

Prerequisites:

A free GitHub account.

A free Netlify account.

A Firebase project with Firestore and Authentication enabled.

A Google AI API Key.

Installation & Deployment:

Clone the repo:

git clone [https://github.com/your-username/ai-employee-app.git](https://github.com/your-username/ai-employee-app.git)


Navigate to the project directory:

cd ai-employee-app


Deploy the Admin Dashboard:

The admin_dashboard.html file should be deployed separately for security.

The easiest way is to use Netlify Drop. Go to app.netlify.com/drop, drag and drop the admin_dashboard.html file, and Netlify will give you a private, live link.