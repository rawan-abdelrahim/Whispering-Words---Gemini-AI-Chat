# Whispering Words - Gemini AI Chat

"Whispering Words" is an elegant and minimalist web-based chat interface powered by Google's Gemini AI. It provides a clean, responsive design for engaging in conversations with an AI, supporting both text and image input.

---

## 🌟 Features

- **Elegant UI/UX**: A thoughtfully designed interface with a focus on readability and a pleasant aesthetic, using a soft, muted color palette.
- **Gemini AI Integration**: Leverages the powerful Gemini API for intelligent and engaging conversational responses.
- **Multi-modal Input**:
  - **Text Chat**: Standard text-based communication with the AI.
  - **Image Attachment**: Send images along with your text prompts to enable multi-modal interactions with Gemini (e.g., "What's in this picture?").
  - **Document Attachment (Frontend Preview Only)**: Allows attaching common document types (.pdf, .doc, .docx, .txt) for display in the chat, _though full content processing for these types requires a custom backend integration._ Text files (`.txt`) _are_ read client-side and their content is sent to Gemini, offering basic document interaction.
- **Responsive Design**: Optimized for seamless use across various devices, from desktops to mobile phones.
- **Markdown Support**: AI responses are rendered with Markdown, supporting headings, lists, code blocks, and more for structured and readable output.
- **Typing Indicator**: A subtle visual cue to indicate when the AI is generating a response.
- **Error Handling**: Displays user-friendly error messages for API issues or invalid inputs.

---

## 🚀 Getting Started

Follow these steps to get "Whispering Words" up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following:

1.  **Web Browser**: A modern web browser (Chrome, Firefox, Safari, Edge).
2.  **Google Cloud Project & Gemini API Key**:
    - You'll need a Google Cloud project with the **Gemini API enabled**.
    - Create an **API key** from the Google Cloud Console.
    - Ensure your API key has the necessary permissions to access the Gemini models (specifically `generativeContent` method).

### Installation

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/YOUR_USERNAME/whispering-words-gemini-chat.git
    cd whispering-words-gemini-chat
    ```

    (Replace `YOUR_USERNAME` with your GitHub username or the repository owner's username.)

2.  **Set Your Gemini API Key**:

    - Open `app.js` in a text editor.
    - Locate the lines:
      ```javascript
      const API_KEY_FOR_LISTING = 'YOUR_GEMINI_API_KEY'; // <<< REPLACE THIS WITH YOUR ACTUAL API KEY
      // ...
      const API_KEY = 'YOUR_GEMINI_API_KEY'; // <<< REPLACE THIS WITH YOUR ACTUAL API KEY
      ```
    - Replace `'YOUR_GEMINI_API_KEY'` with the actual API key you obtained from Google Cloud. **Keep your API key secret in production environments\!** For a public GitHub repository like this, it's generally fine for a demo, but for sensitive applications, you'd want to proxy requests through a secure backend server.

3.  **Open in Browser**:

    - Simply open the `index.html` file in your web browser. You can do this by navigating to the file in your file explorer and double-clicking it, or by using a local server if you have one set up (e.g., `Live Server` extension for VS Code).

    <!-- end list -->

    ```bash
    # Example using Python's http.server (run in the project root directory)
    python -m http.server 8000
    # Then open your browser to http://localhost:8000
    ```

---

## 🛠️ Project Structure

- `index.html`: The main HTML file defining the chat interface structure.
- `styles.css`: Contains all the CSS for styling the application, including variables for easy theme customization.
- `app.js`: The core JavaScript file handling:
  - User input and message display.
  - Image and document attachment previews.
  - Interaction with the Google Gemini API.
  - Markdown rendering using `marked.js`.
- `./assets/`: (Optional) A folder for any images, icons, or other static assets.

---

## 🎨 Customization

The design is highly customizable through CSS variables defined in `styles.css`.

You can easily change the color scheme by modifying these variables:

```css
:root {
  --primary-bg: #f8f4e3; /* Light Cream */
  --secondary-bg: #eae6d7; /* Slightly darker cream/beige */
  --text-color: #2e3136; /* Deep Charcoal */
  --accent-color: #917140; /* Muted Gold/Bronze */
  --border-color: #cfcbc0; /* Soft Grey/Taupe */
  /* ... and more */
}
```

You can also adjust fonts by changing the `font-family` properties in `styles.css`.

---

## ⚠️ Important Considerations

- **API Key Security**: Directly embedding your API key in client-side JavaScript (`app.js`) is generally **NOT recommended for production applications**. This project does it for simplicity and ease of demonstration. For production, you should proxy all API requests through a secure backend server to protect your API key.
- **Gemini Model Availability**: The Gemini API models (e.g., `gemini-1.5-flash`, `gemini-pro`) may have regional restrictions or different version availability. The included `listAvailableModels()` function in `app.js` can help you debug and find the correct model name for your region and API key.
- **File Processing**:
  - **Images**: Images are base64 encoded and sent directly to the Gemini API as `inlineData` parts.
  - **Text Files (`.txt`)**: The content of `.txt` files is read directly in the browser and sent as plain text to the Gemini API.
  - **Other Document Types (`.pdf`, `.doc`, `.docx`)**: For these, only the file name is displayed in the chat interface. **The actual content of these files is NOT sent to the Gemini API directly from the frontend.** To process the content of PDFs or Word documents, you would need a **backend server** that can parse these file types (e.g., using libraries like `pdf-parse` or `mammoth.js`) and then integrate that extracted text into the Gemini API request, likely using Retrieval Augmented Generation (RAG) techniques.

---

## 🤝 Contributing

Contributions are welcome\! If you have suggestions for improvements, bug fixes, or new features, please open an issue or submit a pull request.

---

<video src="./Whispering Words - Gemini AI Chat - Brave 2025-07-15 22-58-23.mp4" controls width="600">
  Your browser does not support the video tag.
</video>

