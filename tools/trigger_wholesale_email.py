import sys
import json

def send_wholesale_email(user_email, price_list_url):
    """
    MOCK: This tool simulates sending a secure email containing the wholesale price list
    to the newly approved wholesale client.
    """
    print(f"📧 [Email System Mock] Preparing to send email to {user_email}")
    print("------------------------------------------------------------")
    print(f"Subject: Your Wholesale Account has been Approved!")
    print(f"Body:\nWelcome!\nYou can securely view the wholesale prices here:\n{price_list_url}")
    print("------------------------------------------------------------")
    print("✅ Email sent successfully.")
    
    # In production, this would make a requests.post to Resend/Sendgrid API
    
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python trigger_wholesale_email.py <user_email> <price_list_url>")
        sys.exit(1)
        
    user_email = sys.argv[1]
    url = sys.argv[2]
    send_wholesale_email(user_email, url)
