# [ShipStation](https://shipstation.ai)

ShipStation, https://shipstation.ai is ever growing work on agents and tools that empowers Dick and John folks to consume the wonders of AI for getting tasks done reliably.
This project leverages Anthropic's AI tools capabilities to streamline the website creation process.

To begin with, we are optimising simple landing page websites, next stop being generic connect-anything-to-anything services.

Imagine working on some new platform which has solved a lot of good problems but just doesn't work effectively for you as the provioder of the service can't understand you and you can't understand the provider.

Our WIP tool is able to solve it with very high accuracies, say 95% of the time so that you, the saas provider and the required integration partner never need to be aware of each other and things get done for you.

## Features

- User authentication (login/signup) via SupaBase
- Basic landing page to communicate with user and understand what would make them happy
- View previously generated projects and featured websites
- Option to use personal Anthropic API key for free usage
- Integrated payment options via Razorpay/PayPal for purchasing credits
- Real-time progress tracking during website generation

## Project Structure

The project is divided into two main parts:
1. Server-side (Node.js) - located in the `server` folder
2. Client-side (React with Vite) - located in the `client` folder
3. Public folder for serving the shipstation.ai website

## Prerequisites

- Node.js (v20 or later recommended)
- npm or yarn
- Anthropic API key 
- Razorpay account (for payment integration)
- Supabase account (for auth and more)
- Heroku for the server (for deploying itself)
- Bucketeer Heroku Addon for storing and retrieving the generated website

## Setup Instructions

### Server Setup

1. Clone the repository
```bash
git clone https://github.com/daytimedrinkingclub/shipstation-backend.git
```
2. Install server dependencies:
```bash
npm install
```
3. Install client depenencies
```bash
cd client
npm install
cd ../
```
4. Setup environments: Copy `.env.template` to `.env` and fill in the required environment variables. Do this for both server and client folders, it needs to be done for both.
5. Start the backend server from the repo directory
```bash
npm run dev
```
6. Start the client from the client directory
```bash
cd client
npm run dev
```

## Environment Variables

Ensure all environment variables are properly set in both `.env` files. Refer to the `.env.template` files for the required variables.

## Usage

1. Access the application through the browser (default: `http://localhost:5173`) Refer client dev server logs of npm run dev
2. Sign up or log in to your account
3. Choose between creating a landing page or portfolio
4. Add the details for getting a website as output.

The websites are stored in s3 bucket and served on the path
https://shipstation.ai/site/website-slug

## Next moves

Since you came here looking for it, it was also waiting for you to contribute to the project.
As for the next rabbithole, visit https://freeaitools.com
We all are limited by the desire to learn things and energy to validate. Thankfully, we are making it easier for you.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Do good, be good.