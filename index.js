const TelegramBot = require('node-telegram-bot-api');
const token = '7761056672:AAEe8gPZjn3L47D-nrQvUOtAA3nPNnMVfzM';
const bot = new TelegramBot(token, {polling: true});
const webAppUrl = 'https://zhiroazhigatel.netlify.app/';


// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Добро пожаловать в Жиросжигатель! Мы рады видеть вас среди наших пользователей. Впереди вас ждут эффективные тренировки и проверенные методики, которые помогут вам достичь своих целей. Если у вас есть вопросы или нужна помощь, наша команда всегда готова поддержать вас. Удачи и успешных тренировок! 💪🔥', {

        })

        await bot.sendMessage(chatId, 'Перейти в никуда', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Войти', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }
});

async function sendInvoice(chatId, title, trainingId, price) {
    try {
        await bot.sendInvoice(
            chatId,
            title, // Заголовок платежа
            "Доступ к эксклюзивному плану тренировок", // Описание платежа
            JSON.stringify({ user_id: chatId, training_id: trainingId }), // Payload
            "", // Telegram Stars (оставляем пустым)
            "XTR", // Валюта (Telegram Stars)
            [{ label: title, amount: price * 100 }], // Цена в Stars
            {
                need_name: false,
                need_phone_number: false,
                need_email: false,
                need_shipping_address: false
            }
        );

        console.log("✅ Инвойс отправлен!");
    } catch (error) {
        console.error("❌ Ошибка при отправке инвойса:", error);
        bot.sendMessage(chatId, "❌ Ошибка при создании инвойса. Попробуйте позже.");
    }
}

// ✅ Бот обрабатывает команду покупки (от Mini App)
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Проверяем, есть ли запрос на оплату
    if (text && text.startsWith("PAYMENT_REQUEST|")) {
        const parts = text.split("|");
        if (parts.length < 4) {
            return bot.sendMessage(chatId, "❌ Ошибка: неверный формат запроса.");
        }

        const trainingId = parts[1];
        const price = parseInt(parts[2], 10);
        const title = parts[3];

        console.log(`✅ Обрабатываем платеж: ID ${trainingId}, Цена ${price}, Название ${title}`);

        // Отправляем инвойс
        await sendInvoice(chatId, title, trainingId, price);
    }
});

// ✅ Подтверждение оплаты
bot.on("pre_checkout_query", async (query) => {
    await bot.answerPreCheckoutQuery(query.id, true);
});

// 🎉 Обработка успешной оплаты
bot.on("successful_payment", async (msg) => {
    const chatId = msg.chat.id;
    const paymentInfo = msg.successful_payment;

    try {
        // Извлекаем user_id и training_id из payload
        const payload = JSON.parse(paymentInfo.invoice_payload);
        const userId = payload.user_id;
        const trainingId = payload.training_id;

        console.log(`🎉 Оплата успешна! UserID: ${userId}, TrainingID: ${trainingId}`);

        // ✅ Здесь можно добавить пользователя в базу данных

        await bot.sendMessage(chatId, `✅ Поздравляем! Вы купили план тренировок 🎉\nТеперь он доступен в вашем профиле.`);
    } catch (error) {
        console.error("❌ Ошибка при обработке покупки:", error);
        bot.sendMessage(chatId, "⚠ Ошибка при обработке платежа. Свяжитесь с поддержкой.");
    }
});

console.log("🚀 Bot is running...");


// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const text = msg.text;
//
//     if (text.startsWith("PAYMENT_REQUEST|")) {
//         const parts = text.split("|");
//         if (parts.length < 4) {
//             return bot.sendMessage(chatId, "❌ Ошибка: неверный формат запроса.");
//         }
//
//         const trainingId = parts[1];
//         const price = parseInt(parts[2], 10);
//         const title = parts[3];
//
//         console.log(`✅ Обрабатываем платеж: ID ${trainingId}, Цена ${price}, Название ${title}`);
//
//         try {
//             await bot.sendInvoice(
//                 chatId,
//                 title, // ✅ Заголовок
//                 "Доступ к эксклюзивному плану тренировок", // ✅ Описание
//                 JSON.stringify({ user_id: chatId, training_id: trainingId }), // ✅ Уникальный payload
//                 "", // ✅ Token не нужен для Stars
//                 "XTR", // ✅ Валюта (Telegram Stars)
//                 [{ label: title, amount: price * 100 }], // ✅ Цена в Stars
//                 {
//                     need_name: false,
//                     need_phone_number: false,
//                     need_email: false,
//                     need_shipping_address: false
//                 }
//             );
//
//             console.log("✅ Инвойс отправлен!");
//         } catch (error) {
//             console.error("❌ Ошибка при отправке инвойса:", error);
//             bot.sendMessage(chatId, "❌ Ошибка при создании инвойса. Попробуйте позже.");
//         }
//     }
// });
//
// // ✅ Подтверждение оплаты
// bot.on("pre_checkout_query", async (query) => {
//     await bot.answerPreCheckoutQuery(query.id, true);
// });
//
// // 🎉 Успешная оплата
// bot.on("successful_payment", async (msg) => {
//     const chatId = msg.chat.id;
//     const paymentInfo = msg.successful_payment;
//
//     try {
//         const payload = JSON.parse(paymentInfo.invoice_payload);
//         const userId = payload.user_id;
//         const trainingId = payload.training_id;
//
//         console.log(`🎉 Оплата успешна! UserID: ${userId}, TrainingID: ${trainingId}`);
//
//         await bot.sendMessage(chatId, `✅ Поздравляем! Вы купили план тренировок 🎉 Теперь он доступен в вашем профиле.`);
//
//     } catch (error) {
//         console.error("❌ Ошибка при обработке покупки:", error);
//         bot.sendMessage(chatId, "⚠ Ошибка при обработке платежа. Свяжитесь с поддержкой.");
//     }
// });
//
// console.log("🚀 Bot is ready!");




//
// // 💰 Handle /buy command to request payment with Telegram Stars
// bot.onText(/\/buy/, async (msg) => {
//     const chatId = msg.chat.id;
//
//     try {
//         await bot.sendInvoice(
//             chatId,
//             "План тренировок", // ✅ Title (REQUIRED)
//             "Доступ к эксклюзивному плану тренировок", // ✅ Description (REQUIRED)
//             `purchase_${chatId}_${Date.now()}`, // ✅ Unique Payload (Order ID)
//             "", // ✅ Leave provider_token empty for Telegram Stars
//             "XTR", // ✅ Currency for Telegram Stars
//             [
//                 { label: "План тренировок", amount: 1 } // ✅ 500 Stars
//             ],
//             {
//                 need_name: false,
//                 need_phone_number: false,
//                 need_email: false,
//                 need_shipping_address: false,
//                 send_phone_number_to_provider: false,
//                 send_email_to_provider: false,
//                 is_flexible: false
//             }
//         );
//
//         console.log("✅ Инвойс успешно отправлен!");
//
//     } catch (error) {
//         console.error("❌ Ошибка при отправке инвойса:", error);
//     }
// });
//
// // ✅ Handle successful payments
// bot.on("pre_checkout_query", async (query) => {
//     await bot.answerPreCheckoutQuery(query.id, true);
// });
//
// // ✅ Handle successful payments (confirm training plan purchase)
// bot.on("successful_payment", async (msg) => {
//     const chatId = msg.chat.id;
//     const paymentInfo = msg.successful_payment;
//     let payload;
//
//     try {
//         // Check if payload is valid JSON or just a plain string
//         if (paymentInfo.invoice_payload.startsWith("{")) {
//             payload = JSON.parse(paymentInfo.invoice_payload); // If JSON, parse it
//         } else {
//             payload = { order_id: paymentInfo.invoice_payload }; // Otherwise, store as a string
//         }
//
//         console.log("✅ Оплата завершена!", paymentInfo);
//
//         // Extract user_id and training_id from payload (if available)
//         const userId = payload.user_id || chatId;
//         const trainingId = payload.training_id || "default_training_plan";
//
//         // Here, you should save the purchase to a database or give the user access
//         await bot.sendMessage(chatId, `🎉 Оплата прошла успешно! Вы получили доступ к плану тренировок.`);
//
//     } catch (error) {
//         console.error("❌ Ошибка при обработке покупки:", error);
//         bot.sendMessage(chatId, "⚠ Ошибка при обработке платежа. Свяжитесь с поддержкой.");
//     }
// });
//
// console.log("🚀 Bot is ready!");