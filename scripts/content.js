// Flag to enable/disable debug mode
const debugMode = true;

// Debug log function to conditionally log messages based on debug mode
function debugLog(message) {
  if (debugMode) {
    console.log(message);
  }
}

debugLog("Starting content script");

// Store the original content of the webpage
const originalContent = document.body.outerHTML;

// Extract text content from the webpage
const textContent = document.body.innerText;

// Send the extracted text content to the background script
chrome.runtime.sendMessage({ action: "sendText", text: textContent }, function(response) {
  // Handle response from background script
  if (response && response.success) {
    debugLog("Text sent to background script successfully");

    // Check for test content
    const containsTestString = textContent.toLowerCase().includes('is_extremism_test');
    let responseText;

    if (containsTestString) {
      debugLog("Is test");
      // Define response text for test content
      responseText = '[Classification] Is Extremist [Reasoning] This content is a test. The following is the definition this tool uses for extremism: "Extremism is the promotion or advancement of an ideology based on violence, hatred or intolerance, that aims to: 1. negate or destroy the fundamental rights and freedoms of others; or 2. undermine, overturn or replace the UK’s system of liberal parliamentary democracy and democratic rights; or 3. intentionally create a permissive environment for others to achieve the results in (1) or (2)" ';
    }

    // Log the extracted text with replacements
    debugLog("Extracted Text:", responseText.replace("[Classification]", "").replace("[Reasoning]", "-"));

    // Check if extremist content is present in the text
    const containsExtremism = responseText.toLowerCase().includes('is extremist');

    if (containsExtremism) {
      debugLog("Extremist content found");
      // Replace webpage content with error message
      document.body.innerHTML = `
        <div class="central-container">
          <div class="error-container">
            <span class="material-icons error-icon">lock</span>
            <h1 class="error-heading">This page cannot be displayed</h1>
            <br>
            <p class="error-message">We detected potentially harmful content.</p>
            <br>
            <p class="error-detail">${responseText.replace("[Classification]", "").replace("[Reasoning]", "-")}</p>
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
      debugLog("No extremist content found");
    }
  } else {
    console.error("Failed to send text to background script");
  }
});
