# RAG Explorer Frontend

The frontend for a Retrieval-Augmented Generation (RAG) application that processes complex PDFs containing text, tables, images, and charts.

## Features

- Modern, responsive UI built with React and Material UI
- Document upload with drag-and-drop functionality
- Chat interface for querying documents using RAG
- Conversation management with history
- Source attribution for transparent AI responses
- Display of different content types (text, tables, images)

## Technologies Used

- React for the UI framework
- Material UI for component styling
- React Router for navigation
- Axios for API communication
- React Markdown for message formatting
- React Dropzone for file uploading

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components for different routes
- `/src/services` - API services for backend communication
- `/src/assets` - Static assets like images and icons

## Backend Integration

This frontend communicates with a Django backend API. Make sure the backend server is running on `http://localhost:8000` (or update the proxy setting in package.json). 