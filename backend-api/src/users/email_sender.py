def send_password_change_email(to_email: str, confirm_url: str) -> None:
    print(f"[DEV EMAIL] To: {to_email}\nClick to confirm password change: {confirm_url}")