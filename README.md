# Vmail
This project is designed to assist visually impaired individuals in composing and managing emails using voice commands. The system integrates speech recognition and synthesis technologies to facilitate hands-free email interaction.

## FeaturesCompose 
* Emails: Users can compose emails by dictating the recipient's email address, subject, and content.
* Check Inbox: Users can listen to their inbox emails, with options to read the sender, subject, and body of each email.
* Logout: Allows users to safely log out of their email account.

## Technologies Used
* Python: Backend logic for email composition, inbox retrieval, and interaction.
* SpeechRecognition: Library for converting speech to text.
* gTTS (Google Text-to-Speech): Converts text into spoken words for user interaction.
* smtplib, imaplib: Libraries for sending and receiving emails using SMTP and IMAP protocols.
* Beautiful Soup: Used for parsing email content from HTML emails.
* HTML, CSS: Frontend design and user interface.
* JavaScript: Enhances user interaction and handles voice command responses.

## Setup Instructions
1. **Clone the Repository:**
    ```bash
    git clone https:https://github.com/Madhavv69/Hand-Gesture-Recognition-and-Voice-Conversion-for-Deaf-and-Dumb.git
    cd Voice-Based-Email-System
    ```

2. **Install Dependencies:**
    ```bash
   pip install -r requirements.txt
    ```

3. **Set Environment Variables:**
   * Create a .env file in the project directory.
   * Add your email credentials:
    ```bash
    EMAIL_USER=your_email@gmail.com
    EMAIL_APP_PASS=your_app_password
    ```
4.Run the Application
    ```bash
     python app.py
    ```
5.Interact with the Application
* Follow the voice prompts to compose emails, check inbox, or logout.
* Speak clearly and wait for the system to process your commands.
  
## Usage
* Home Page: Start by saying "Option 1" to compose an email, "Option 2" to check your inbox, or "Option 3" to logout.
* Compose Email: Dictate the recipient's email address, subject, and content. Say "Done" when finished.
* Check Inbox: Navigate through emails by saying "Next" or stop reading by saying "Stop".
* Logout: Safely log out from the system by selecting the logout option.
  
## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

