# CDN File Uploader

A file uploader built with Node.js and Express that supports multiple file types, including images, documents, videos, presentations, and spreadsheets. The project includes MIME type validation to ensure only specific file types are uploaded. It also supports multiple storage options, including local storage, and Firebase Storage.

## Features
- Supports file upload for images, videos, gifs, documents (PDF, DOC, DOCX), presentations (PPT, PPTX), and spreadsheets (XLS, XLSX).
- MIME type and extension validation for uploaded files.
- Supports three different storage options: **Local**, and **Firebase**.
- Configurable via environment variables.
- **Vercel-ready**: This project can be easily deployed to Vercel for hosting.

## Tech Stack
- **Node.js**
- **Express.js**
- **Multer**: For handling file uploads.
- **fs (File System)**: For file handling in the local filesystem.
- **Firebase Admin SDK**: For Firebase storage (if using Firebase).
- **dotenv**: For environment variable management.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Leuthra/cdn-uploader.git
   cd cdn-uploader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file to configure environment variables:
   ```bash
   touch .env
   ```

   **Example `.env` file:**
   ```bash
   # System environment variables
   PORT=3000
   PUBLIC_URL=http://localhost:3000
   STORAGE=local  # Options: 'local', 'firebase'

   # Firebase environment variables (if using Firebase)
   FIREBASE_STORAGE_BUCKET=gs://your-firebase-bucket
   PUBLIC_URL_FIREBASE=https://firebasestorage.googleapis.com/v0/b/your-firebase-bucket/o
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

| Variable Name                | Description                                              | Default Value    |
| ---------------------------- | -------------------------------------------------------- | ---------------- |
| `PORT`                       | Port number for the server                               | `3000`           |
| `PUBLIC_URL`                 | Public URL for accessing the app                         | `http://localhost:3000` |
| `STORAGE`                    | Storage option (`local`, `firebase`, or `drive`)         | `local`          |
| `FIREBASE_STORAGE_BUCKET`     | Firebase storage bucket name (only if using Firebase)    | N/A              |
| `PUBLIC_URL_FIREBASE`         | Public URL template for Firebase storage                 | N/A              |

## Storage Options

This project supports three different storage options. You can choose the storage method by setting the `STORAGE` variable in your `.env` file to either `local`, `firebase`.

### 1. Local Storage
Files are stored on the server's filesystem in the `uploads/` directory, which acts as local storage. Files will be served via the `/file` route, even if stored locally.

### 2. Firebase Storage
To use Firebase Storage, set the `STORAGE` variable to `firebase` and configure the Firebase-specific environment variables such as `FIREBASE_STORAGE_BUCKET`. Uploaded files will still be accessed using the `/file` route.

You can find more detailed setup instructions in the [**FIREBASE.md**](./FIREBASE.md) file.

## Usage

1. **File Upload**: 
   Send a `POST` request to `/upload` with a file using the form field `fileInput`. The file will be saved in the specified storage method (local, Firebase, or Google Drive).

   Example with **cURL**:
   ```bash
   curl -X POST http://localhost:3000/upload -F "fileInput=@/path/to/your/file.jpg"
   ```

2. **Allowed File Types**:
   The following file types are allowed for upload:
   - Images: `.jpeg`, `.jpg`, `.png`, `.gif`
   - Documents: `.pdf`, `.doc`, `.docx`
   - Presentations: `.ppt`, `.pptx`
   - Spreadsheets: `.xls`, `.xlsx`
   - Videos: `.mp4`, `.avi`, `.mov`, `.mkv`

3. **Access Uploaded Files**:
   All uploaded files, regardless of the storage method (local, Firebase, or Google Drive), will be accessible through the `/file` route. For example:

   - **Local Storage**: `http://localhost:3000/file/your-file-name`
   - **Firebase Storage**: `http://localhost:3000/file/your-file-name`
   - **Google Drive**: `http://localhost:3000/file/your-file-name`

## Hosting on Vercel

This project is fully compatible with **Vercel**. You can easily deploy it by pushing the repository to a GitHub repository and connecting it with Vercel. The configuration file `vercel.json` is included to handle deployment.

Once deployed, all files will be accessible via the `/file` route on your Vercel domain. The **uploads/** folder is used for local storage when the `STORAGE` is set to `local`.

### Steps to Deploy on Vercel:

1. Push your project to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/), sign in, and create a new project by importing your repository.
3. Set the required environment variables in the Vercel project settings.
4. Deploy the project.

## Project Structure

```
.
├── config/                 # Configuration files (e.g., Firebase)
├── controllers/            # Route controllers for handling requests
├── middlewares/            # Custom middleware (e.g., IP handling, validation)
├── public/                 # Public assets (e.g., HTML, CSS, JS files)
├── routes/                 # Express routes
├── uploads/                # Directory where uploaded files are stored (local storage only)
├── utils/                  # Utility functions (e.g., helpers for file handling)
├── .env                    # Environment variables configuration (to be created)
├── .gitignore              # Git ignore file
├── firebase.json           # Firebase configuration (if applicable)
├── package.json            # Node.js dependencies and scripts
├── README.md               # Project documentation
├── server.js               # Main server file
├── vercel.json             # Vercel deployment configuration
├── FIREBASE.md             # Firebase setup instructions
```

## Dependencies

- **express**: Web framework for Node.js.
- **multer**: Middleware for handling `multipart/form-data`, used for uploading files.
- **fs**: Node.js built-in module for interacting with the file system.
- **firebase-admin**: For Firebase integration (if using Firebase storage).
- **googleapis**: For Google Drive integration (if applicable).
- **dotenv**: For environment variable management.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.