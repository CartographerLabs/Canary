console.log("Starting content script");

// Store the original content of the webpage
const originalContent = document.body.innerHTML;

// Extract text content from the webpage
const textContent = document.body.innerText;

// Send the extracted text content to the background script
chrome.runtime.sendMessage({ action: "sendText", text: textContent }, function(response) {
  if (response && response.success) {
    console.log("Text sent to background script successfully");
    console.log("Extracted Text:", response.extractedText.replace("[Classification]", "").replace("[Reasoning]", "-")); // Log the extracted text with replacements
    
    // Check if the word "publish" is present in the text
    const containsPublish = response.extractedText.toLowerCase().includes('is extremist');
    
    if (containsPublish) {
      console.log("Extremist content found");
      // If the word "publish" is found, replace the entire content of the webpage with "no" message
      document.body.innerHTML = `
        <div class="central-container">
          <div class="error-container">
            <span class="material-icons error-icon">lock</span>
            <h1 class="error-heading">This page cannot be displayed</h1>
            <br>
            <p class="error-message">We detected potentially harmful content.</p>
            <br>
            <p class="error-detail">${response.extractedText.replace("[Classification]", "").replace("[Reasoning]", "-")}</p>
            <br>
            <div class="learn-more-links">
            <a href="https://www.gov.uk/government/publications/new-definition-of-extremism-2024/new-definition-of-extremism-2024" target="_blank" class="learn-more-link-uk">Learn More (UK)</a>
            <a href="https://www.fbi.gov/investigate/terrorism" target="_blank" class="learn-more-link-us">Learn More (US)</a>
          </div>
          <br>
          <p>Canary</p>
            </div>
        </div>
      `;
      
      // Inject CSS styles into the page
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .central-container {
          max-width: 600px;
          width: 100%;
          padding: 20px;
        }
        .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .error-icon {
          font-size: 96px;
          color: #dd1919; /* Google Red */
          margin-bottom: 20px;
        }
        .error-heading {
          font-size: 36px;
          color: #333; /* Dark Gray */
          margin-bottom: 10px;
        }
        .error-message {
          font-size: 24px;
          color: #666; /* Light Gray */
          margin-bottom: 20px;
        }
        .error-detail {
          font-size: 14px;
          color: #999; /* Lighter Gray */
          line-height: 1.5; /* Adjust line height for better spacing */
        }
        .learn-more-link {
          font-size: 18px;
          color: #007bff; /* Blue */
          text-decoration: none;
          margin-top: 20px;
          cursor: pointer;
        }
        .learn-more-link:hover {
          text-decoration: underline;
        }
      `;
      document.head.appendChild(style);
    } else {
      console.log("No extremist content found");
    }
  } else {
    console.error("Failed to send text to background script");
  }
});
