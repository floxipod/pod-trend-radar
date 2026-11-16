import os
import requests

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

if not TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN is missing")

url = f"https://api.telegram.org/bot{TOKEN}/getMe"

try:
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    data = response.json()

    if data.get("ok"):
        print("Bot connected successfully!")
        print("Bot username:", data["result"]["username"])
    else:
        raise RuntimeError(f"Telegram API error: {data}")

except requests.RequestException as error:
    raise RuntimeError(f"Connection failed: {error}") from error
