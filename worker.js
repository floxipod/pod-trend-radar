const API = "https://api.telegram.org";

async function telegram(env, method, payload) {
  const response = await fetch(`${API}/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(`Telegram API request failed: ${method}`);
  }
  return data.result;
}

async function sendMessage(env, chatId, text, replyMarkup) {
  const payload = { chat_id: chatId, text };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  return telegram(env, "sendMessage", payload);
}

function mainMenu() {
  return {
    inline_keyboard: [
      [{ text: "📈 اكتشاف الترندات", callback_data: "trends" }],
      [{ text: "🔍 تحليل النيتش", callback_data: "niche" }],
      [{ text: "💡 أفكار التصميم", callback_data: "ideas" }],
      [{ text: "🏆 تحليل المنافسين", callback_data: "competitors" }],
      [{ text: "📅 الفرص الموسمية", callback_data: "seasonal" }],
    ],
  };
}

const menuText =
  "مرحباً بك في POD Trend Radar 🚀\n\n" +
  "مساعدك لاكتشاف فرص السوق في Etsy وRedbubble.\n\n" +
  "اختر الخدمة التي تريدها:";

const answers = {
  trends: "📈 اكتشاف الترندات: هذه الخدمة قيد التطوير.",
  niche: "🔍 تحليل النيتش: هذه الخدمة قيد التطوير.",
  ideas: "💡 أفكار التصميم: هذه الخدمة قيد التطوير.",
  competitors: "🏆 تحليل المنافسين: هذه الخدمة قيد التطوير.",
  seasonal: "📅 الفرص الموسمية: هذه الخدمة قيد التطوير.",
};

async function handleUpdate(update, env) {
  if (update.message?.chat?.id) {
    const text = update.message.text || "";
    if (text === "/start" || text.startsWith("/start ")) {
      await sendMessage(env, update.message.chat.id, menuText, mainMenu());
    } else if (text.startsWith("/")) {
      await sendMessage(env, update.message.chat.id, "استخدم /start لعرض القائمة الرئيسية.");
    }
    return;
  }

  if (update.callback_query) {
    const query = update.callback_query;
    await telegram(env, "answerCallbackQuery", { callback_query_id: query.id });
    const answer = answers[query.data] || "اختر خدمة من القائمة الرئيسية.";
    if (query.message?.chat?.id) {
      await sendMessage(env, query.message.chat.id, answer);
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response("POD Trend Radar Worker is running.", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/register") {
      if (!env.SETUP_SECRET || request.headers.get("authorization") !== `Bearer ${env.SETUP_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
      }
      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_WEBHOOK_SECRET) {
        return new Response("Missing Telegram secrets", { status: 500 });
      }

      const webhookUrl = `${url.origin}/webhook`;
      await telegram(env, "setWebhook", {
        url: webhookUrl,
        secret_token: env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: true,
      });
      return Response.json({ ok: true, webhook: webhookUrl });
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      if (!env.TELEGRAM_WEBHOOK_SECRET ||
          request.headers.get("x-telegram-bot-api-secret-token") !== env.TELEGRAM_WEBHOOK_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }
      if (!env.TELEGRAM_BOT_TOKEN) {
        return new Response("Bot token is not configured", { status: 500 });
      }

      try {
        const update = await request.json();
        await handleUpdate(update, env);
        return new Response("ok");
      } catch {
        return new Response("Webhook processing failed", { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
