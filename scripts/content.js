// Debug log function to conditionally log messages based on debug mode
function debugLog(message) {
  if (debugMode) {
      console.log(message);
  }
}

// Flag to enable/disable debug mode
const debugMode = true; // Set to true to enable debug mode

// Function to ask for permission
function askForPermission() {
  // Check if permission status is already saved
  chrome.storage.local.get('permissionGranted', function (data) {
      if (data.permissionGranted === undefined) {
          // Create a popup to ask for permission
          const popup = document.createElement('div');
          popup.innerHTML = `
          
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Icons" />
          <div class="popup-container">
              <div class="popup-content">
                  <div class="icon-container">
                  <span class="material-icons" id="lockIcon" style="color: grey; font-size: 64px;">
                      lock_open_right
                    </span>
                  </div>
                  <h3>Canary</h3>
                  <br>
                  <p>First time using Canary? We leverage the Google Vertex AI API to enhance your browsing security. To proceed, please grant consent below for us to share data on the HTML webpages you've visited with this third party.</p>
                  <div class="popup-buttons">
                      <button id="grantPermission" class="button">Grant</button>
                      <button id="denyPermission" class="button">Deny</button>
                  </div>
              </div>
          </div>
      `;
      
      // Style the popup
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
          .popup-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(255, 255, 255, 0.9); /* Neutral background color */
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
          }
          .popup-content {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px; /* Rounded corners */
              text-align: center;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); /* Drop shadow for depth */
          }
          .icon-container {
              margin-bottom: 20px;
          }
          .icon-container .material-icons {
              width: 64px;
              height: 64px;
          }
          .popup-buttons button {
              margin: 10px;
              padding: 10px 20px;
              border: none;
              border-radius: 4px; /* Rounded corners for buttons */
              cursor: pointer;
              font-weight: bold; /* Bold font for buttons */
          }
          #grantPermission {
              background-color: #1a73e8; /* Google Blue */
              color: #fff; /* White text */
          }
          #denyPermission {
              background-color: #e8eaed; /* Light gray background */
              color: #202124; /* Dark gray text */
          }
          .button:hover {
              filter: brightness(0.9); /* Darken button on hover */
          }
      `;
      
          // Append popup and styles to document body
          document.body.appendChild(popup);
          document.head.appendChild(style);

          // Event listener for grant permission button
          document.getElementById('grantPermission').addEventListener('click', function () {
              // Save permission status
              chrome.storage.local.set({ permissionGranted: true });
              // Remove the popup
              popup.remove();
          });

          // Event listener for deny permission button
          document.getElementById('denyPermission').addEventListener('click', function () {
              // Remove the popup
              popup.remove();
          });
      }
  });
}

// Function to send text content to background script
function sendTextToBackground(textContent) {
  // Retrieve permission status from storage
  chrome.storage.local.get('permissionGranted', function (data) {
      const permissionGranted = data.permissionGranted;

      // Send the extracted text content to the background script only if permission is granted
      if (permissionGranted) {
          chrome.runtime.sendMessage({ action: "sendText", text: textContent }, function (response) {
              // Handle response from background script
              if (response && response.success) {
                  debugLog("Text sent to background script successfully");

                  // Check for test content
                  let responseText = response.extractedText.toLowerCase();
                  const containsTestString = textContent.includes('is_extremism_test');

                  if (containsTestString) {
                      debugLog("Is test");
                      // Define response text for test content
                      responseText = '[Classification] Is Extremist [Reasoning] This content is a test. The following is the definition this tool uses for extremism: "Extremism is the promotion or advancement of an ideology based on violence, hatred or intolerance, that aims to: 1. negate or destroy the fundamental rights and freedoms of others; or 2. undermine, overturn or replace the UK’s system of liberal parliamentary democracy and democratic rights; or 3. intentionally create a permissive environment for others to achieve the results in (1) or (2)" ';
                  }

                  // Log the extracted text with replacements
                  debugLog("Extracted Text:" + textContent);

                  debugLog("Response Text:" + responseText.replace("[Classification]", "").replace("[Reasoning]", "-"));

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
      } else {
          debugLog("Permission not granted to send text to background");
      }
  });
}

//chrome.storage.local.remove('permissionGranted');

debugLog("Starting content script");

// Store the original content of the webpage
const originalContent = document.body.outerHTML;

// Extract text content from the webpage
const textContent = document.body.innerText;

// Ask for permission before sending text content to background script
askForPermission();

// Send the extracted text content to the background script
sendTextToBackground(textContent);
