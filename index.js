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


    if (text === '/buy') {
        const invoice = {
            chat_id: chatId,
            title: 'План тренировок', // REQUIRED - Add a title
            description: 'Доступ к эксклюзивному плану тренировок', // REQUIRED - Add a description
            payload: JSON.stringify({ user_id: msg.from.id, training_id: 'unique_training_plan_id' }),
            provider_token: '', // Leave empty for Telegram Stars
            currency: 'XTR', // Telegram Stars currency
            prices: [{ label: 'План тренировок', amount: 500 * 100 }], // 500 Stars
            start_parameter: 'purchase_training_plan',
            photo_url: 'https://i.pinimg.com/736x/5b/ad/89/5bad896bc3ec8e5bffe19fdf817f1e47.jpg', // REQUIRED - Add a valid image URL
            photo_width: 640,
            photo_height: 640,
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            send_phone_number_to_provider: false,
            send_email_to_provider: false,
            is_flexible: false,
        };

        bot.sendInvoice(invoice).catch((error) => {
            console.error('Ошибка при отправке инвойса:', error);
        });
    }


});


// Handle pre-checkout query (confirming payment)
bot.on('pre_checkout_query', (query) => {
    bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
        console.error('Ошибка при подтверждении предварительного запроса:', error);
    });
});

// Handle successful payment
bot.on('successful_payment', async (msg) => {
    const chatId = msg.chat.id;
    const paymentPayload = JSON.parse(msg.successful_payment.invoice_payload);

    console.log('✅ Успешный платеж:', paymentPayload);

    const userId = paymentPayload.user_id;
    const trainingId = paymentPayload.training_id;

    try {
        // Add training plan to user (database update)
        await addUserTraining(userId, trainingId);

        bot.sendMessage(chatId, '✅ Ваш план тренировок был успешно добавлен! 🎉');
    } catch (error) {
        console.error('Ошибка при добавлении плана тренировок:', error);
        bot.sendMessage(chatId, '❌ Произошла ошибка при обработке вашей покупки. Пожалуйста, попробуйте позже.');
    }
});

async function addUserTraining(userId, trainingId) {
    console.log(`Добавление плана тренировок ${trainingId} пользователю ${userId}`);
    // Здесь можно добавить логику работы с базой данных
}

console.log('✅ Бот запущен и ожидает сообщения...');