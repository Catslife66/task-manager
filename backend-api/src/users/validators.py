import re


def check_password_strength(value:str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r'[a-z]', value):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not re.search(r'[A-Z]', value):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not re.search(r'\d', value):
        raise ValueError("Password must contain at least one number.")
    if not re.search(r'[^a-zA-Z0-9]', value):
        raise ValueError("Password must contain at least one special character.")
    return value