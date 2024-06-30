from flask import Flask, render_template, request, redirect, url_for
import os
import imaplib
import smtplib
import email
from bs4 import BeautifulSoup
import re

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compose', methods=['GET', 'POST'])
def compose():
    if request.method == 'POST':
        recipient_email = request.form['email']
        email_subject = request.form['subject']
        email_content = request.form['content']

        email_user = os.getenv('EMAIL_USER')
        email_app_pass = os.getenv('EMAIL_APP_PASS')

        mail = smtplib.SMTP('smtp.gmail.com', 587)
        mail.ehlo()
        mail.starttls()
        mail.login(email_user, email_app_pass)
        mail.sendmail(email_user, recipient_email, f"Subject: {email_subject}\n\n{email_content}")
        mail.close()
        return redirect(url_for('index'))

    return render_template('compose.html')

@app.route('/inbox')
def inbox():
    email_user = os.getenv('EMAIL_USER')
    email_pass = os.getenv('EMAIL_APP_PASS')

    try:
        mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
        mail.login(email_user, email_pass)
        mail.select('Inbox')

        status, total = mail.select('Inbox')
        result, unseen = mail.search(None, 'UnSeen')
        unseen_count = len(unseen[0].split())

        inbox_item_list = mail.uid('search', None, "ALL")[1][0].split()
        emails = []
        for email_uid in reversed(inbox_item_list):
            result, email_data = mail.uid('fetch', email_uid, '(RFC822)')
            raw_email = email_data[0][1].decode("utf-8")
            msg = email.message_from_string(raw_email)

            from_header = email.utils.parseaddr(msg['From'])[1]
            subject_header = msg['Subject']

            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))

                    if "attachment" not in content_disposition:
                        payload = part.get_payload(decode=True)
                        if payload:
                            body = payload.decode()
                            body = BeautifulSoup(body, 'html.parser').get_text()
                            body = re.sub(r'\s+', ' ', body).strip()
            else:
                body = msg.get_payload(decode=True)
                if body:
                    body = body.decode()
                    body = BeautifulSoup(body, 'html.parser').get_text()
                    body = re.sub(r'\s+', ' ', body).strip()

            emails.append({
                'from': from_header,
                'subject': subject_header,
                'body': body
            })

        mail.close()
        mail.logout()
        return render_template('inbox.html', emails=emails, total=total[0].decode('utf-8'), unseen=unseen_count)
    except imaplib.IMAP4.error as e:
        print(f"IMAP login failed: {e}")
        return "There was an issue logging in to your email. Please try again later."

@app.route('/logout')
def logout():
    return render_template('logout.html')

if __name__ == '__main__':
    app.run(debug=True)
