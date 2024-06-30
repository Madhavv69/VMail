// Define speak function globally
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    console.log("Speaking: " + text);
    window.speechSynthesis.speak(utterance);
}

// Function to start voice recognition
function startRecognition(field, callback) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = function(event) {
        const value = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized command: " + value);
        callback(value, field);
    };

    recognition.onerror = function(event) {
        console.error("Error occurred in recognition: " + event.error);
        startRecognition(field, callback);
    };
}

// Function to preprocess email address from voice input
function preprocessEmailAddress(text) {
    const numberWords = { 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
                          'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'zero': '0' };
    for (const word in numberWords) {
        if (numberWords.hasOwnProperty(word)) {
            text = text.replace(new RegExp(word, 'g'), numberWords[word]);
        }
    }
    text = text.replace(/ /g, '').toLowerCase();
    text = text.replace(/attherate|at/g, '@').replace(/dot/g, '.');
    return text;
}

// Function to handle composing email input through voice commands
function handleComposeInput(value, field) {
    let step = field.step || 1;
    let recipientEmail = field.recipientEmail || '';
    let emailSubject = field.emailSubject || '';
    let emailContent = field.emailContent || '';

    if (step === 1) {
        recipientEmail = preprocessEmailAddress(value);
        document.getElementById('recipient').value = recipientEmail;
        speak("Please say the subject of your email.");
        step++;
    } else if (step === 2) {
        emailSubject = value;
        document.getElementById('subject').value = emailSubject;
        speak("Please start dictating your email content. Say 'done' when finished.");
        step++;
    } else if (step === 3) {
        if (value.toLowerCase() === 'done') {
            emailContent = document.getElementById('body').value.trim();
            if (recipientEmail && emailSubject && emailContent) {
                sendEmail(recipientEmail, emailSubject, emailContent);
            } else {
                speak("Some required inputs are missing. Please try again.");
                step = 1;
                startRecognition('recipient', handleComposeInput);
            }
        } else {
            document.getElementById('body').value += value + " ";
            startRecognition('body', handleComposeInput);
        }
    }

    // Save current step and inputs to fields
    field.step = step;
    field.recipientEmail = recipientEmail;
    field.emailSubject = emailSubject;
    field.emailContent = emailContent;
}

// Function to send email
function sendEmail(recipient, subject, content) {
    const email_user = 'your_email@example.com'; // Replace with your email
    const email_app_pass = 'your_app_password'; // Replace with your app password

    const mail = new XMLHttpRequest();
    mail.open('POST', 'https://api.mailgun.net/v3/your_domain.com/messages', true);
    mail.setRequestHeader('Authorization', 'Basic ' + btoa('api:key-6f8xxxxxxxxxxxxxxxxxxxxxxxxx'));
    mail.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    mail.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log('Mail sent successfully');
        } else {
            console.log('Error occurred in mail sending');
        }
    };
    mail.send(`from=${email_user}&to=${recipient}&subject=${subject}&text=${content}`);
    speak(`Email has been sent to ${recipient}.`);
    window.location.href = '/';
}

// Function to read emails from inbox
function readEmails(index) {
    const emails = JSON.parse(document.getElementById('emails-data').innerText);
    if (index >= emails.length) {
        speak("No more emails.");
        return;
    }
    const email = emails[index];
    speak(`Email ${index + 1}: From ${email.from}, Subject: ${email.subject}, Body: ${email.body}`);
    startRecognition(index, function(command) {
        if (command.includes('next')) {
            readEmails(index + 1);
        } else if (command.includes('stop')) {
            speak("Stopping email reading.");
        } else {
            speak("I didn't understand that. Please say 'next' or 'stop'.");
            startRecognition(index, arguments.callee);
        }
    });
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded.");

    const path = window.location.pathname;

    if (path === '/') {
        let optionsGiven = false;

        function provideOptions() {
            speak("Project: Voice based Email for visually impaired. Please say Option 1 to Compose a Mail, Option 2 to Check Your Inbox, or Option 3 to Logout.");
            optionsGiven = true;
        }

        function handleUserChoice() {
            startRecognition('choice', function(command) {
                if (command.includes('option 1') || command.includes('option one') || command.includes('compose')) {
                    window.location.href = '/compose';
                } else if (command.includes('option 2') || command.includes('option two') || command.includes('inbox')) {
                    window.location.href = '/inbox';
                } else if (command.includes('option 3') || command.includes('option three') || command.includes('logout')) {
                    window.location.href = '/logout';
                } else {
                    speak("I didn't understand Your command. Please select from those three options.");
                    handleUserChoice();
                }
            });
        }

        function startWorkflow() {
            if (!optionsGiven) {
                provideOptions();
            } else {
                handleUserChoice();
            }
        }

        startWorkflow();
    } else if (path === '/compose') {
        let fields = { step: 1, recipientEmail: '', emailSubject: '', emailContent: '' };
        speak("Your Choice:");
        startRecognition('choice', function(value) {
            handleComposeInput(value, fields);
        });
    } else if (path === '/inbox') {
        speak("Reading your inbox. Say 'next' to go to the next email, or 'stop' to stop.");
        readEmails(0);
    } else if (path === '/logout') {
        speak("You have successfully logged out.");
    }
});
