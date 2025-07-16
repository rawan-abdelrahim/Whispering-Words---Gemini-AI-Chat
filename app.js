document.addEventListener('DOMContentLoaded', () => {
  const chatHistory = document.getElementById('chat-history');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const imageUploadInput = document.getElementById('image-upload');
  const fileUploadInput = document.getElementById('file-upload');
  const attachedItemPreviewContainer = document.getElementById(
    'attached-item-preview-container'
  );

  let messages = [];
  let attachedImageBase64 = null;
  let attachedImageMimeType = null;
  let attachedFile = null; // Store File object for upload
  let attachedFileContentForChat = null; // Store content for .txt files if read by backend

  // --- TEMPORARY DEBUGGING FUNCTION: LIST AVAILABLE MODELS ---
  // Make sure to replace 'YOUR_GEMINI_API_KEY' with your actual key below!
  async function listAvailableModels() {
    // Use the same API key as your main chat for consistency in checking model access
    const API_KEY_FOR_LISTING = 'YOUR_GEMINI_API_KEY'; // <<< REPLACE THIS WITH YOUR ACTUAL API KEY
    try {
      console.log(
        '--- Attempting to list available models for your API Key ---'
      );
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY_FOR_LISTING}`
      );
      const data = await response.json();
      console.log('Full Available Models Response:', data);

      if (data && data.models) {
        console.log("\n--- Models supporting 'generateContent' method ---");
        let foundContentModel = false;
        data.models.forEach((model) => {
          if (
            model.supportedGenerationMethods &&
            model.supportedGenerationMethods.includes('generateContent')
          ) {
            console.log(
              `- Model Name: ${model.name}, Display Name: ${
                model.displayName || 'N/A'
              }`
            );
            foundContentModel = true;
          }
        });
        if (!foundContentModel) {
          console.log(
            "No models found that support 'generateContent' for this API key/region. This is likely the cause of your issue."
          );
          console.log(
            'Double-check your API key and its associated project permissions.'
          );
        } else {
          console.log(
            "\nIf you see 'gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-pro', or 'gemini-pro-vision' above, use that exact string (without 'models/') for your 'modelName' variable in the fetch request."
          );
        }
      } else if (data && data.error) {
        console.error(
          'Error from ListModels API (check your API_KEY_FOR_LISTING):',
          data.error.message
        );
      } else {
        console.log(
          'Unexpected response format when listing models. Check network tab for response details.'
        );
      }
    } catch (error) {
      console.error('Error listing models (network/fetch issue):', error);
    }
  }

  // Call the temporary debugging function when the page loads
  listAvailableModels();
  // --- END TEMPORARY DEBUGGING FUNCTION ---

  // Function to append messages to the chat history
  function appendMessage(sender, text, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    let processedText = text;

    if (sender === 'User') {
      // User message content will be added separately below the input during submission
      // This function is primarily for AI and error messages now
    } else if (sender === 'Bot') {
      messageDiv.classList.add('ai-message');
      if (typeof marked !== 'undefined') {
        processedText = marked.parse(text);
      } else {
        processedText = `<p>${text}</p>`;
      }
      messageDiv.innerHTML = processedText;
    } else if (isError) {
      messageDiv.classList.add('error-message');
      messageDiv.innerHTML = `<p><span style="font-weight: bold; color: #CC0000;">${sender}:</span> ${text}</p>`;
    }

    messageDiv.classList.add('fade-in');
    chatHistory.appendChild(messageDiv);
    messageDiv.addEventListener(
      'animationend',
      () => {
        messageDiv.classList.remove('fade-in');
      },
      { once: true }
    );
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Function to show a typing indicator
  function showTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.classList.add('message', 'ai-message', 'typing-indicator');
    indicatorDiv.innerHTML = `<p>...</p>`;
    chatHistory.appendChild(indicatorDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return indicatorDiv;
  }

  // Function to remove the typing indicator
  function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }

  // Function to clear all attached items
  function clearAttachedItems() {
    attachedImageBase64 = null;
    attachedImageMimeType = null;
    attachedFile = null;
    attachedFileContentForChat = null;
    imageUploadInput.value = '';
    fileUploadInput.value = '';
    attachedItemPreviewContainer.innerHTML = '';
    console.log('Attached items cleared.');
  }

  // Handle image upload preview
  imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      clearAttachedItems(); // Clear any previously attached items first

      if (!file.type.startsWith('image/')) {
        appendMessage(
          'Error',
          'Please select an image file (e.g., JPG, PNG, GIF).',
          true
        );
        imageUploadInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        attachedImageBase64 = e.target.result.split(',')[1];
        attachedImageMimeType = file.type;
        console.log(
          'Image attached. MimeType:',
          attachedImageMimeType,
          'Base64 length:',
          attachedImageBase64.length
        );

        const imgPreview = document.createElement('div');
        imgPreview.classList.add('attached-item-preview', 'image-preview');
        imgPreview.innerHTML = `
                    <img src="${e.target.result}" alt="Attached image preview" />
                    <span class="file-name">${file.name}</span>
                    <span class="remove-attachment" title="Remove attachment">&times;</span>
                `;
        attachedItemPreviewContainer.appendChild(imgPreview);
        imgPreview
          .querySelector('.remove-attachment')
          .addEventListener('click', clearAttachedItems);
      };
      reader.readAsDataURL(file);
    } else {
      clearAttachedItems();
    }
  });

  // Handle generic file upload preview (document)
  fileUploadInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
      clearAttachedItems();

      const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      if (
        !allowedFileTypes.includes(file.type) &&
        !file.name.match(/\.(pdf|doc|docx|txt)$/i)
      ) {
        appendMessage(
          'Error',
          'Unsupported file type. Please upload PDF, DOC, DOCX, or TXT.',
          true
        );
        fileUploadInput.value = '';
        return;
      }

      attachedFile = file; // Store the File object to send to backend or frontend

      const filePreview = document.createElement('div');
      filePreview.classList.add('attached-item-preview', 'file-preview');
      let fileIcon = '📄';
      if (file.type.includes('pdf')) fileIcon = '📃';
      else if (
        file.type.includes('word') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx')
      )
        fileIcon = '📝';
      else if (file.type.includes('text')) fileIcon = '🗒️';

      filePreview.innerHTML = `
                <span class="file-icon">${fileIcon}</span>
                <span class="file-name">${file.name}</span>
                <span class="remove-attachment" title="Remove attachment">&times;</span>
            `;
      attachedItemPreviewContainer.appendChild(filePreview);
      filePreview
        .querySelector('.remove-attachment')
        .addEventListener('click', clearAttachedItems);

      // ✅ NEW: Read .txt file directly in the frontend
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachedFileContentForChat = e.target.result;
          console.log(
            'تم قراءة محتوى الملف النصي:',
            attachedFileContentForChat
          );
        };
        reader.readAsText(file);
      }
    } else {
      clearAttachedItems();
    }
  });

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();

    // Check for any content before proceeding
    if (
      !userMessage &&
      !attachedImageBase64 &&
      !attachedFileContentForChat &&
      !attachedFile
    ) {
      console.log('No input, image, or file to send.');
      return;
    }

    // --- Display User Message and Attachment in Chat History ---
    const messageDivForUser = document.createElement('div');
    messageDivForUser.classList.add('message', 'user-message', 'fade-in');

    if (userMessage) {
      const userMessageContent = document.createElement('p');
      userMessageContent.textContent = userMessage;
      messageDivForUser.appendChild(userMessageContent);
    }

    if (attachedImageBase64) {
      const imgElement = document.createElement('img');
      imgElement.src = `data:${attachedImageMimeType};base64,${attachedImageBase64}`;
      imgElement.alt = 'Attached image';
      imgElement.style.maxWidth = '150px';
      imgElement.style.maxHeight = '150px';
      imgElement.style.marginTop = '10px';
      imgElement.style.borderRadius = '8px';
      imgElement.style.display = 'block';
      messageDivForUser.appendChild(imgElement);
      console.log('User message includes attached image in history display.');
    } else if (attachedFileContentForChat) {
      // If it's a text file whose content was read by backend
      const fileInfoElement = document.createElement('div');
      fileInfoElement.classList.add('attached-file-info');
      fileInfoElement.innerHTML = `
                <span class="file-icon">📄</span>
                <span class="file-name">${attachedFile.name}</span>
                <p class="file-backend-note"><em>(Text content processed by backend)</em></p>
            `;
      messageDivForUser.appendChild(fileInfoElement);
      console.log(
        'User message includes attached file (content processed) in history display.'
      );
    } else if (attachedFile) {
      // If it's a non-text file that needs RAG (or simply not handled yet)
      const fileInfoElement = document.createElement('div');
      fileInfoElement.classList.add('attached-file-info');
      fileInfoElement.innerHTML = `
                <span class="file-icon">📎</span>
                <span class="file-name">${attachedFile.name}</span>
                <p class="file-backend-note"><em>(File content processing requires a backend server.)</em></p>
            `;
      messageDivForUser.appendChild(fileInfoElement);
      console.log(
        'User message includes attached file (backend needed) in history display.'
      );
    }

    chatHistory.appendChild(messageDivForUser);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Disable input and buttons immediately
    userInput.disabled = true;
    chatForm.querySelector('button[type="submit"]').disabled = true;
    imageUploadInput.disabled = true;
    fileUploadInput.disabled = true;

    const typingIndicator = showTypingIndicator(); // Show typing indicator

    // --- Prepare Parts for Gemini API Call ---
    const parts = [];
    if (userMessage) {
      parts.push({ text: userMessage });
    }

    if (attachedImageBase64) {
      parts.push({
        inlineData: {
          mimeType: attachedImageMimeType,
          data: attachedImageBase64,
        },
      });
      console.log('Adding image to Gemini parts.');
    }

    // --- CRITICAL FIX FOR CONTENTS ARRAY ---
    // ALWAYS push the user's parts to the messages history *unless* it's a file
    // that's explicitly not going to Gemini directly.
    if (attachedFileContentForChat) {
      parts.push({ text: attachedFileContentForChat });
      messages.push({ role: 'user', parts: parts });
      console.log('Messages history with .txt file content:', messages);
    } else if (attachedFile === null) {
      messages.push({ role: 'user', parts: parts });
      console.log('Messages history for Gemini:', messages);
    } else {
      console.log(
        'Generic file attached, skipping direct Gemini API call for content analysis.'
      );
      removeTypingIndicator(typingIndicator);
      appendMessage(
        'Bot',
        `Acknowledged: "${attachedFile.name}". For content processing, a backend RAG system is required.`,
        false
      );

      if (!userMessage && !attachedImageBase64) {
        messages = [];
      }

      clearAttachedItems();
      userInput.disabled = false;
      chatForm.querySelector('button[type="submit"]').disabled = false;
      imageUploadInput.disabled = false;
      fileUploadInput.disabled = false;
      userInput.focus();
      return;
    }

    // Clear frontend state *after* preparing the payload, before API call
    clearAttachedItems();

    try {
      const API_KEY = 'YOUR_GEMINI_API_KEY'; // <<< REPLACE THIS WITH YOUR ACTUAL API KEY

      // Use the model name you confirmed from the console output of listAvailableModels()
      // Using a specific flash version (e.g., -002) is often more reliable than just 'flash'
      const modelName = 'gemini-1.5-flash'; // <<< CONSIDER CHANGING TO 'gemini-1.5-flash-002' or 'gemini-1.5-pro' IF THIS FAILS

      console.log(
        `Sending request to Gemini model: ${modelName}. Contents:`,
        messages
      );

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages,
          }),
        }
      );

      const data = await response.json();
      removeTypingIndicator(typingIndicator);
      console.log('Gemini API raw response:', data); // Log the full API response for debugging

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        appendMessage('Bot', reply);
        messages.push({ role: 'model', parts: [{ text: reply }] }); // Add bot's reply to history
      } else {
        const errorMessage =
          data?.error?.message ||
          'No response or unexpected format from Gemini.';
        appendMessage('Error', errorMessage, true);
        console.error('Gemini API response error or empty reply:', data);
      }
    } catch (error) {
      removeTypingIndicator(typingIndicator);
      appendMessage(
        'Error',
        `Failed to connect to Gemini: ${error.message}`,
        true
      );
      console.error('Gemini API Error (catch block):', error);
    } finally {
      userInput.disabled = false;
      chatForm.querySelector('button[type="submit"]').disabled = false;
      imageUploadInput.disabled = false;
      fileUploadInput.disabled = false;
      userInput.focus();
    }
  });
});
