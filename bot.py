import os
import requests

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

if not TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN is missing")

url = f"https://api.telegram.org/bot{TOKEN}/getMe"
response = requests.get(url, timeout=20)
data = response.json()

if data.get("ok"):
    print("Bot connected successfully:", data["result"]["username"])
else:
    raise RuntimeError(data)
