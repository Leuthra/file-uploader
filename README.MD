# Firebase - UPLOADER

This project is a web-based file uploader built with Node.js, Express, and Firebase. It allows users to upload files with a size limit of 50MB and provides a simple interface for managing uploads.

## Features

- File upload with a size limit of 50MB
- File storage on Firebase
- Simple and clean user interface
- Donation popup for user contributions

## Technologies Used

- Node.js
- Express
- Firebase
- Multer
- HTML/CSS/JavaScript

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Leuthra/uploader.git
    cd uploader
    ```

2. Install the dependencies:
    ```sh
    npm install --save
    ```

3. **Create the `firebaseServiceAccountKey.json` file**:

    To use Firebase Admin SDK, you need a **service account key** file for authentication. Follow these steps to create the file:

    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Select your project.
    - In the left sidebar, click on **Project Settings** (gear icon).
    - Go to the **Service accounts** tab.
    - Click the **Generate new private key** button at the bottom of the page.
    - This will download a JSON file. Rename this file to `firebaseServiceAccountKey.json` and place it in the root directory of your project.

4. Create a `.env` file in the root directory and add your Firebase credentials:
    ```env
    FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket-url
    PUBLIC_URL=http://localhost:3000/uploads
    ```

    Make sure to replace `your-firebase-storage-bucket-url` with the actual Firebase storage bucket URL found in your Firebase project settings.

5. Start the server:
    ```sh
    npm start
    ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. Select a file to upload using the file input.
2. Click the "Upload" button to start the upload process.
3. Wait for the upload to complete and see the status message.
4. The uploaded file URL will be displayed in the upload history.

## File Structure

- `public/`: Contains static files (HTML, CSS, JavaScript)
- `server.js`: Main server file
- `Dockerfile`: Docker configuration
- `package.json`: Project dependencies and scripts

## API Docs Example

```js
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function romiCdn(filePath) {
  const formData = new FormData();
  formData.append('fileInput', fs.createReadStream(filePath));

  try {
    const response = await fetch('https://localhost:3000/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const fileUrl = await response.json();
      console.log('Successfully:', fileUrl);
    } else {
      const errorResponse = await response.json();
      console.error('Oops something went wrong:', errorResponse);
    }
  } catch (error) {
    console.error('Oops something went wrong:', error.message);
  }
}

// Example usage:
romiCdn('/path/to/your/file.jpg');
```

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

Special thanks to **[SazumiVicky/uploader-r2](https://github.com/SazumiVicky/uploader-r2/)** for providing the base reference for the uploader functionality in this project.