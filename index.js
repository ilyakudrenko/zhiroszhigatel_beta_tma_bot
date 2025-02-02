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
            reply_markup: {
                keyboard: [
                    [{text: 'Запустить', web_app: {url: webAppUrl}}]
                ]
            }
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

bot.on('successful_payment', async (msg) => {
    const chatId = msg.chat.id;
    const paymentPayload = JSON.parse(msg.successful_payment.invoice_payload);

    console.log("Оплата завершена:", paymentPayload);

    const userId = paymentPayload.user_id;
    const trainingId = paymentPayload.training_id;

    try {
        // Добавляем тренировочный план пользователю
        await addUserTraining(userId, trainingId);

        await bot.sendMessage(chatId, `✅ Ваш план тренировок добавлен! 🎉`);
    } catch (error) {
        console.error("Ошибка при добавлении тренировки:", error);
        await bot.sendMessage(chatId, "❌ Ошибка при обработке покупки, попробуйте позже.");
    }
});