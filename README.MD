# Multi-Storage File Uploader

This project is a web-based file uploader built with Node.js and Express, supporting two storage options: **Firebase** or **Local storage**. You can configure the storage method via environment variables. Users can upload files up to a size limit of 50MB, and the app provides a simple interface for managing uploads.

## Features

- **Multi-Storage Option**: Switch between Firebase Storage or Local storage using environment configuration.
- File upload with a size limit of 50MB.
- File management and history.
- Simple and clean user interface with copy-to-clipboard functionality for uploaded file links.
- Option to proxy Firebase Storage files through the local server.

## Technologies Used

- Node.js
- Express
- Firebase (optional)
- Multer
- HTML/CSS/JavaScript

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Leuthra/file-uploader.git
   cd file-uploader
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure your storage options.

   - For **local storage**:

     ```env
     STORAGE=local
     PUBLIC_URL=http://localhost:3000/uploads
     ```

   - For **Firebase storage**, you need a Firebase service account:

     ```env
     STORAGE=firebase
     FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket-url
     PUBLIC_URL=https://your-firebase-storage-url
     ```

4. If you choose **Firebase Storage** as your storage option, you'll need to set up your **Firebase service account**:

   - Download the service account key JSON from Firebase Console.
   - Place the file in the root of the project as `firebaseServiceAccountKey.json`.

   The JSON file should look something like this:

   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "your-private-key-id",
     "private_key": "your-private-key",
     "client_email": "your-client-email",
     "client_id": "your-client-id",
     ...
   }
   ```

5. Start the server:

   ```bash
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. Select a file to upload using the file input.
2. Click the "Upload" button to start the upload process.
3. Wait for the upload to complete and see the status message.
4. After the upload:
   - You can copy the link of the uploaded file.
   - When you reload the page, the history will display the latest file that was uploaded.

## Multi-Storage Configuration

### Local Storage

By setting `STORAGE=local` in the `.env` file, files will be saved locally on the server in the `public/uploads` directory. The file history and access will be based on this local storage.

- Example `.env` for local storage:

  ```env
  STORAGE=local
  PUBLIC_URL=http://localhost:3000/uploads
  ```

### Firebase Storage

By setting `STORAGE=firebase` in the `.env` file, files will be uploaded to Firebase Storage, and the history will show files hosted on Firebase. The app will proxy Firebase files through the local server for easy access.

- Example `.env` for Firebase storage:

  ```env
  STORAGE=firebase
  FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket-url
  PUBLIC_URL=https://your-firebase-storage-url
  ```

- Ensure you have set up the `firebaseServiceAccountKey.json` file correctly as explained in the installation section.

## API Documentation

Here’s an example of how you can use the API to upload a file:

### Uploading a File via API

```js
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function uploadFile(filePath) {
  const formData = new FormData();
  formData.append('fileInput', fs.createReadStream(filePath));

  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Uploaded successfully:', result.url_response);
    } else {
      const errorResponse = await response.json();
      console.error('Upload failed:', errorResponse);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage:
uploadFile('/path/to/your/file.jpg');
```

## File Structure

- `public/`: Contains static files (HTML, CSS, JavaScript).
- `server.js`: Main server file.
- `package.json`: Project dependencies and scripts.
- `firebaseServiceAccountKey.json`: Firebase service account key (if using Firebase storage).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Author

Developed by Romi Muharom

- [Instagram](https://www.instagram.com/romi_muh05)
- [GitHub](https://github.com/Leuthra)
- [Website](https://romidev.tech)

## Thank You

Special thanks to [SazumiVicky](https://github.com/SazumiVicky/uploader-r2) for the reference code used in the uploader system.