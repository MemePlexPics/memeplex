import { MAX_FREE_USER_CHANNEL_SUBS } from '../../../../../constants'
import { PREMIUM_PLANS } from '../../../../../constants/publisher'

export const ru = {
  message: {
    start: () => `
Добро пожаловать в @MemePushBot!

Этот бот позволяет автоматизировать нахождение новых мемов.

- Пользователь может подписаться на интересующие его тематики, используя ключевые слова или фразы.
- Бот индексирует большое количество телеграм-каналов с мемами в режиме реального времени, распознаёт текст с изображений, и, в случае совпадения по ключевым фразам, присылает пользователю найденное изображение.

Таким образом, пользователям не нужно тратить время на поиск контента.

Бота можно использовать для ведения своего канала с мемами, добавив его администратором канала с правами на отправку сообщений. Привязанный к каналу бот будет добавлять к отправляемому сюда мему кнопку для постинга мема прямо в канал.
    `,
    channelUnlinked: () => 'Канал успешно отвязан.',
    memePostedSuccessfully: () => 'Мем успешно опубликован.',
    adminRightForPost: () =>
      'Для публикации мема в канал необходмо предоставить боту админ-права на отправку сообщений в данный канал.',
    checkChannelNameFormat: () => `
Пожалуйста, проверьте корректность названия.
Формат: @name или https://t.me/name`,
    checkChannelName: () => `
Убедитесь в корректности введенного названия.
Ожидаю повторной отправки.`,
    addedUserInsteadOfChannel: () => `
Для того, чтобы подписаться самому, выберите в главном меню кнопку "${ru.button.mySubscriptions()}".
Вернитесь назад в главное меню или отправьте название канала.`,
    botMustBeInTheChannelAndHaveAdminRights: () =>
      `Необходимо добавить бота в канал и предоставить админ-права.`,
    onlyAdminCanSubscribeChannel: () => `
Добавить подписку на канал может только администратор канала.
Если вы хотите только подписаться на мемы, то вернитесь назад и выберите в главном меню кнопку "${ru.button.mySubscriptions()}".`,
    botMustHaveAdminRights: () =>
      `Для публикации в канал боту необходимо предоставить админ-права.`,
    delimetersInsteadOfKeywords: () =>
      'В отправленном сообщении не обнаружено слов, только запятые и/или переносы строк',
    addedKeywords: () => '✅ Ключевые слова добавлены!',
    thereAreNoKeywords: () => `Ключевые фразы не обнаружены`,
    keywordSettings: () => `
Здесь можно настроить интересующие вас ключевые слова.

Отправьте новые фразы для подписки (через запятую или с новой строки), чтобы добавить их.
Фразы могут состоять из одного или нескольких слов.`,
    mainMenu: () => '🏠 Главное меню',
    subscriptionSettings: () =>
      'Настройте подписки на ключевые фразы для себя или для своего канала.',
    keywordGroupsMenu: () => '📂 Меню добавления группы ключевых слов.',
    rateLimit: () => '❗️ Подождите несколько секунд перед повторной попыткой',
    premiumPlanFeatures: () => `
✨ Премиум-подписка позволяет:

- Настраивать уведомления о новых мемах на уровне отдельных ключевых фраз (интересующие вас темы, предметы или явления)
- Привязывать телеграм-каналы, у которых больше ${MAX_FREE_USER_CHANNEL_SUBS} подписчиков, чтобы отправлять туда найденные мемы прямо из бота.`,
    keywordGroupDescription: () =>
      `Топики позволяют подписаться на заранее заготовленные группы ключевых фраз.`,
    youEditingSubscriptionsFor: (text: string) => `Вы редактируете ${text}.`,
    youEditingSubscriptionsForUser: () => ru.message.youEditingSubscriptionsFor('ваши подписки'),
    youEditingSubscriptionsForChannel: (channelName: string) =>
      ru.message.youEditingSubscriptionsFor(`подписки канала @${channelName}`),
    unsubscribeFromKeywords: () => `Отписаться от ключевых фраз`,
    topicContainKewords: (topicName: string, keywords: string) => `
📂 Топик «${topicName}» содержит фразы:
${keywords}`,
    thereTopicsAndKeywords: () =>
      'Топики - это заранее заготовленные группы ключевых фраз для подписки.',
    doYouWantToUnlinkChannel: (channel: string) => `
Вы действительно хотите отвязать свой канал @${channel}?
Все настройки подписок для канала будут сброшены.`,
    youCanDemoteBotFromAdmin: () => `Теперь вы можете удалить бота из списка администраторов`,
    enterChannelNameInFormat: () =>
      'Введитие название канала в формате @name или https://t.me/name',
    somethingWentWrongTryLater: () => 'Что-то пошло не так. Пожалуйста, повторите попытку позже.',
    paymentSuccessful: () => '🎉 Оплата успешно произведена!',
    paymentLink: () => `Ссылка для оплаты`,
    unexpectedMessage: () => `
Не удалось распознать ваше сообщение. Попробуйте воспользоваться кнопками в:

- меню снизу (оно может быть доступно под полем ввода сообщения, а также - за кнопкой кубика с четыремя точками рядом с кнопкой отправки)
- меню сообщения (если оно скрылось за поток мемов, то вызвать меню повторно можно с помощью команду /menu).`,
  },
  button: {
    back: () => '⬅️ Назад',
    ready: () => '✅ Готово',
    forward: () => '➡️ Вперед',
    editTopics: (emoji: '✏️' | '✨' = '✏️', channel?: string) =>
      `${emoji} Редактировать топики${channel ? ` (@${channel})` : ''}`,
    addChannel: () => '➕ Добавить канал',
    mySubscriptions: () => '📩 Мои подписки',
    unlinkChannel: (channel: string) => `🗑 Отвязать @${channel}`,
    unlinkChannelConfirm: () => `⛔ Отвязать`,
    toMainMenu: () => '🏠 В главное меню',
    editKeywords: (channel?: string) =>
      `✏️ Редактировать ключевые фразы${channel ? ` (@${channel})` : ''}`,
    sendKeywords: () => '📋 Вывести через запятую',
    linkYourChannel: () => '🔗 Привязать свой канал',
    subscriptionSettings: () => '⚙️ Настройки подписок',
    postMeme: (channel: string) => `➡️ Отправить в @${channel}`,
    memePosted: (channel: string) => `✅ Отправлено в @${channel}`,
    premoderationKeyword: (emoji: '🔕' | '➕', keyword: string, action: string) =>
      `${emoji} «${keyword}» (${action})`,
    premoderationKeywordGroup: (emoji: '🔕' | '➕', keywordGroup: string, action: string) =>
      `${emoji} 📂 «${keywordGroup}» (${action})`,
    premoderationKeywordFromGroup: (
      emoji: '🔕' | '➕',
      keyword: string,
      keywordGroup: string,
      action: string,
    ) => `${emoji} «${keyword}» из 📂 «${keywordGroup}» (${action})`,
    premoderationKeywordUnsubscribe: (keyword: string) =>
      ru.button.premoderationKeyword('🔕', keyword, 'отписаться'),
    premoderationKeywordGroupUnsubscribe: (keywordGroup: string) =>
      ru.button.premoderationKeywordGroup('🔕', keywordGroup, 'отписаться'),
    premoderationKeywordFromGroupUnsubscribe: (keyword: string, keywordGroup: string) =>
      ru.button.premoderationKeywordFromGroup('🔕', keyword, keywordGroup, 'отписаться'),
    premoderationKeywordSubscribe: (keyword: string) =>
      ru.button.premoderationKeyword('➕', keyword, 'подписаться'),
    premoderationKeywordGroupSubscribe: (keywordGroup: string) =>
      ru.button.premoderationKeywordGroup('➕', keywordGroup, 'подписаться'),
    premoderationKeywordFromGroupSubscribe: (keyword: string, keywordGroup: string) =>
      ru.button.premoderationKeywordFromGroup('➕', keyword, keywordGroup, 'подписаться'),
    // scheduledPost: () => '⏰ Отложенная отправка',
    // postWithText: () => '📝 Добавить текстовое сообщение',
    subscribeKeyword: (keyword: string) => `➕ Подписаться на «${keyword}»`,
    unsubscribeKeyword: (keyword: string) => `➖ Отписаться от «${keyword}»`,
    subscribeToPremium: () => '✨ Подключить премиум',
    extendPremium: () => '✨ Продлить премиум',
    premium: () => '✨ Премиум',
    channelSubscriptions: (name: string) => `📢 Подписки @${name}`,
    buyPremium: (
      emoji: (typeof PREMIUM_PLANS)[number]['emoji'],
      months: (typeof PREMIUM_PLANS)[number]['months'],
      cost: (typeof PREMIUM_PLANS)[number]['cost'],
    ) => `${emoji} Премиум на ${ru.date.month[months]()} — ${cost}$`,
    goToPremiumPayment: () => `✨ Перейти для оплаты премиума`,
  },
  date: {
    month: {
      1: () => `один месяц`,
      3: () => `три месяца`,
      12: () => `один год`,
    },
  },
  command: {
    callCurrentMenu: () => 'Вызвать текущее меню',
    help: () => 'Вывести справку',
  },
} as const
