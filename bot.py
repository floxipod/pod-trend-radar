
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
)

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📈 اكتشاف الترندات", callback_data="trends")],
        [InlineKeyboardButton("🔍 تحليل النيتش", callback_data="niche")],
        [InlineKeyboardButton("💡 أفكار التصميم", callback_data="ideas")],
        [InlineKeyboardButton("🏆 تحليل المنافسين", callback_data="competitors")],
        [InlineKeyboardButton("📅 الفرص الموسمية", callback_data="seasonal")],
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "مرحباً بك في POD Trend Radar 🚀\n\n"
        "مساعدك لاكتشاف فرص السوق في Etsy وRedbubble.\n\n"
        "اختر الخدمة التي تريدها:",
        reply_markup=reply_markup,
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    messages = {
        "trends": "📈 اكتشاف الترندات: هذه الخدمة قيد التطوير.",
        "niche": "🔍 تحليل النيتش: هذه الخدمة قيد التطوير.",
        "ideas": "💡 أفكار التصميم: هذه الخدمة قيد التطوير.",
        "competitors": "🏆 تحليل المنافسين: هذه الخدمة قيد التطوير.",
        "seasonal": "📅 الفرص الموسمية: هذه الخدمة قيد التطوير.",
    }

    await query.message.reply_text(
        messages.get(query.data, "اختر خدمة من القائمة الرئيسية.")
    )

def main():
    if not TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is missing")

    app = ApplicationBuilder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    from telegram.ext import CallbackQueryHandler
    app.add_handler(CallbackQueryHandler(button_handler))

    print("POD Trend Radar is starting...")
    app.run_polling()

if __name__ == "__main__":
    main()
