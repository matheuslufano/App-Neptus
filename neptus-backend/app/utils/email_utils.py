import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.app_config import APP_CONFIG

def send_email(subject, recipient, html_content):
    if not APP_CONFIG.MAIL_USERNAME or APP_CONFIG.MAIL_USERNAME == 'email@exemplo.com':
        print(f"DEBUG: Email would be sent to {recipient} with subject '{subject}'")
        return

    msg = MIMEMultipart()
    msg['From'] = f"Neptus - Suporte <{APP_CONFIG.MAIL_USERNAME}>"
    msg['To'] = recipient
    msg['Subject'] = subject

    msg.attach(MIMEText(html_content, 'html'))

    try:
        server = smtplib.SMTP(APP_CONFIG.MAIL_SERVER, APP_CONFIG.MAIL_PORT)
        if APP_CONFIG.MAIL_USE_TLS:
            server.starttls()
        server.login(APP_CONFIG.MAIL_USERNAME, APP_CONFIG.MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Error sending email: {e}")
