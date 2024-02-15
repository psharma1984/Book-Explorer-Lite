# Book Explorer Lite 
This a simple web application for exploring and discovering books. It allows users to search for books by title and save favorite books for later reference. User can also review the books and see others reviews. Ratings are given to book on the basis of number of reviews.

## Features

    User Authentication: Users can create accounts, log in, and log out to access personalized features such as saving favorite books, reviewing a book.
    Search Books: Users can search for books using keywords or titles.
    View Book Details: Detailed information about each book is displayed, including title, author, description, and cover image, reviews and ratings
    Save Favorites: Users can save their favorite books to a list for easy access later.
    Reviews: User can review a book, update or delete his review. User can see other people reviews for a particular book.
## Project Deployment

This project is deployed and live on Render.com. You can access it using the following link:
[View Deployed Project on Render.com](https://book-explorer-lite.onrender.com/)   

## Getting Started
## Prerequisites

Before running the application, ensure you have the following dependencies installed:
    Node.js and 
    npm (Node Package Manager)
    
## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/psharma1984/react-todo.git

2. Navigate to the project directory
   ```
   cd book-explorer-lite

3. Install dependencies
   ```
   npm install
## Environment Variables

The application uses environment variables to store sensitive information and configuration settings. These variables are loaded from a .env file located in the root directory of the project.You need to create this file manually before running the application. The .env file should define the following variables:

    MONGO_URI: URI for your MongoDB database. Ensure it includes the protocol (mongodb://), hostname, port (if different from the default), and database name.
    API_KEY : Store your API key in this variable. I'm using Google Books API.
    SESSION_SECRET: Secret key used for session management. It should be a long, randomly generated string. It is used to sign session cookies.
    
## Usage 
1. Start the appliaction
   ```
   npm start
 Open your browser and go to [http://localhost:3000](http://localhost:3000) to access the Book Explorer Lite application.

