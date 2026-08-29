import { MAX_FREE_USER_CHANNEL_SUBS } from '../../../../../constants'

export const ru = {
  message: {
    start: () => `
Добро пожаловать в @MemePlexBot, поисковую систему для мемов!

Бот индексирует телеграм-каналы с мемами и распознаёт текст с картинок.

Вы можете:
- искать по собранной базе мемов
- подписаться на новые мемы по ключевым словам
- привязать бота к своему каналу и по нажатию кнопки постить туда картинки, которые находит за вас бот
`,
    help: () => `
*Поиск мемов*

Просто отправьте текст, по которому вы хотите искать.
Лучше всего работают короткие запросы (ключевые слова). Не нужно пытаться описывать изображение: в индекс попадает только текст с мема (буквально), а не его описание.

*Подписка на ключевые слова*

Вы можете подписаться на новые мемы, которые содержат указанные вами ключевые слова.
Бот автоматически обходит телеграм-каналы, распознает текст с картинок, и, в случае совпадения, отправит вам уведомление.

*Подписка на топики*

Топики - это заранее заготовленные нами группы ключевых слов на популярные тематики: “секс”, “IT”, “отношения”, и т.п.

*Привязка бота к вашему каналу*

Чтобы постить в ваш канал прямо из бота по кнопке, когда бот присылает уведомление о новом найденном меме, вы можете привязать бота к каналу.
`,
    memeSearch: {
      menu: () => `Введите текст для поиска мемов:`,
      noNewMemes: () => 'С последнего запроса не появилось новых мемов',
      pagesCount: {
        new: (count: number) => `${count} страниц новых мемов`,
        old: (count: number) => `${count} страниц старых мемов`,
      },
      pageXOfN: (page: number, totalPages: number) => `Page ${page} of ${totalPages}`,
    },
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
Для того, чтобы подписаться самому, выберите в главном меню кнопку «${ru.button.mySubscriptions()}».
Вернитесь назад в главное меню или отправьте название канала.`,
    botMustBeInTheChannelAndHaveAdminRights: () =>
      `Необходимо добавить бота в канал и предоставить админ-права.`,
    onlyAdminCanSubscribeChannel: () => `
Добавить подписку на канал может только администратор канала.
Если вы хотите только подписаться на мемы, то вернитесь назад и выберите в главном меню кнопку «${ru.button.mySubscriptions()}».`,
    botMustHaveAdminRights: () =>
      `Для публикации в канал боту необходимо предоставить админ-права.`,
    delimetersInsteadOfKeywords: () =>
      'В отправленном сообщении не обнаружено слов, только запятые и/или переносы строк.',
    addedKeywords: () => '✅ Ключевые слова добавлены!',
    channelAlredyAdded: () => `Канал уже привязан к вашему аккаунту`,
    addedChannel: (channel: string) => `✅ Канал @${channel} успешно привязан!`,
    thereAreNoKeywords: () => `Вы ещё не добавили ключевые фразы.`,
    keywordSettings: () => `
Здесь можно настроить интересующие вас ключевые слова.

Отправьте новые фразы для подписки (через запятую или с новой строки), чтобы добавить их.
Фразы могут состоять из одного или нескольких слов.`,
    mainMenu: () => '🏠 Главное меню',
    subscriptionSettings: () =>
      'Настройте подписки на ключевые фразы для себя или для своего канала.',
    topicsMenu: () => '📂 Меню добавления группы ключевых слов.',
    rateLimit: () => '❗️ Подождите несколько секунд перед повторной попыткой',
    premiumUntilDate: (date: string) => `Ваш премиум действует до ${date}`,
    premiumPlanFeatures: () => `
✨ Премиум-подписка позволяет:

- Настраивать уведомления о новых мемах на уровне отдельных ключевых фраз
- Привязывать телеграм-каналы, у которых больше ${MAX_FREE_USER_CHANNEL_SUBS} подписчиков, чтобы отправлять туда найденные мемы прямо из бота
- Отключать уведомления для отдельных слов из топиков`,
    topicDescription: () =>
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
    youCanDemoteBotFromAdmin: () => `Теперь вы можете удалить бота из списка администраторов.`,
    enterChannelNameInFormat: () =>
      'Введитие название канала в формате @name или https://t.me/name',
    somethingWentWrongTryLater: () => 'Что-то пошло не так. Пожалуйста, повторите попытку позже.',
    askForPremium: () => `Чтобы получить премиум, напишите нам в комментариях к этому посту:`,
    channelSuggestion: {
      format: () => `
    Необходимо отправить канал в следующем формате:
    /suggest_channel @name или https://t.me/name`,
      thanks: () => 'Благодарим за предложение!',
    },
    questinableQueryAdvice: () => `
Не находится то, что вы ожидали?

- Не нужно описывать картинку - в индекс попадает только сам текст с неё, а не описание.`,
    doNotAddToQuery: () => `- В частности, не нужно добавлять в запрос "мем", "картинка" и т.п.`,
    shortQueriesWorkBetter: () => `- Короткие запросы работают лучше`,
    channelSubscribersLimitForFreePlan: (channel: string) => `
Ваш канал @${channel} достиг ${MAX_FREE_USER_CHANNEL_SUBS} подписчиков.
Получите премиум, чтобы использовать бота в больших каналах.`,
    memeSuggested: () => `🙏 Мем отправлен на модерацию. Спасибо!`,
    memeSuggestionIndexed: () =>
      `😎 Добавленный вами мем прошёл модерацию! Теперь он доступен для поиска.`,
    nothingFound: () => 'Ничего не найдено',
    stats: (
      users: { inline: number; inBot: number; total: number },
      memes: {
        total: number
        lastHour: number
        last24Hours: number
        lastWeek: number
        last30Days: number
      },
      freeSpaceGb: number,
    ) => `📊 Статистика

Мемов всего: ${memes.total.toLocaleString('ru-RU')}
Свободное место на сервере: ≈${freeSpaceGb.toLocaleString('ru-RU')} ГБ

Уникальных пользователей сегодня:
- inline: ${users.inline.toLocaleString('ru-RU')}
- в боте: ${users.inBot.toLocaleString('ru-RU')}
- всего: ${users.total.toLocaleString('ru-RU')}

Добавлено мемов:
- за час: ${memes.lastHour.toLocaleString('ru-RU')}
- за 24 часа: ${memes.last24Hours.toLocaleString('ru-RU')}
- за неделю: ${memes.lastWeek.toLocaleString('ru-RU')}
- за 30 дней: ${memes.last30Days.toLocaleString('ru-RU')}`,
  },
  button: {
    back: () => '⬅️ Назад',
    ready: () => '✅ Готово',
    forward: () => '➡️ Вперед',
    editTopics: (channel?: string) => `✏️ Редактировать топики${channel ? ` (@${channel})` : ''}`,
    addChannel: () => '➕ Добавить канал',
    mySubscriptions: () => '📩 Мои подписки',
    unlinkChannel: (channel: string) => `🗑 Отвязать @${channel}`,
    unlinkChannelConfirm: () => `⛔ Отвязать`,
    toMainMenu: () => '🏠 В главное меню',
    editKeywords: (emoji: '✏️' | '✨' = '✏️', channel?: string) =>
      `${emoji} Редактировать ключевые фразы${channel ? ` (@${channel})` : ''}`,
    sendKeywords: () => '📋 Вывести через запятую',
    linkYourChannel: () => '🔗 Привязать свой канал',
    subscriptionSettings: () => '⚙️ Настройки подписок',
    postMeme: (channel: string) => `➡️ Отправить в @${channel}`,
    memePosted: (channel: string) => `✅ Отправлено в @${channel}`,
    keywordSettings: {
      keyword: {
        unsubscribe: (keyword: string) => `🔕 ${keyword}`,
      },
      topicKeyword: {
        subscribe: (keyword: string, topic: string) => `➕ «${keyword}» из 📂 «${topic}»`,
        unsubscribe: (keyword: string, topic: string) => `🔕 «${keyword}» из 📂 «${topic}»`,
      },
    },
    premoderation: {
      keyword: {
        base: (emoji: '🔕' | '➕', keyword: string, action: string) =>
          `${emoji} «${keyword}» (${action})`,
        unsubscribe: (keyword: string) =>
          ru.button.premoderation.keyword.base('🔕', keyword, 'отписаться'),
        subscribe: (keyword: string) =>
          ru.button.premoderation.keyword.base('➕', keyword, 'подписаться'),
      },
      topic: {
        base: (emoji: '🔕' | '➕', topic: string, action: string) =>
          `${emoji} 📂 «${topic}» (${action})`,
        unsubscribe: (topic: string) =>
          ru.button.premoderation.topic.base('🔕', topic, 'отписаться'),
        subscribe: (topic: string) =>
          ru.button.premoderation.topic.base('➕', topic, 'подписаться'),
      },
      keywordFromTopic: {
        base: (emoji: '🔕' | '➕', keyword: string, topic: string, action: string) =>
          `${emoji} «${keyword}» из 📂 «${topic}» (${action})`,
        unsubscribe: (isPremium: boolean, keyword: string, topic: string) =>
          `${isPremium ? '' : '✨ '}${ru.button.premoderation.keywordFromTopic.base('🔕', keyword, topic, 'отписаться')}`,
        subscribe: (keyword: string, topic: string) =>
          ru.button.premoderation.keywordFromTopic.base('➕', keyword, topic, 'подписаться'),
      },
    },
    // scheduledPost: () => '⏰ Отложенная отправка',
    // postWithText: () => '📝 Добавить текстовое сообщение',
    subscribeKeyword: (keyword: string) => `➕ Подписаться на «${keyword}»`,
    unsubscribeKeyword: (keyword: string) => `➖ Отписаться от «${keyword}»`,
    subscribeToPremium: () => '✨ Запросить премиум',
    extendPremium: () => '✨ Продлить премиум',
    premium: () => '✨ Премиум',
    channelSubscriptions: (name: string) => `📢 Подписки @${name}`,
    askForPremium: () => '✨ Запросить премиум',
    goToPremiumRequest: () => '✨ Запросить премиум',
    search: () => `🔎 Поиск`,
    searchMemes: () => `🔎 Поиск мемов`,
    load: {
      newer: () => 'Загрузить новые',
      older: () => 'Загрузить старые',
      more: () => 'Загрузить больше',
    },
  },
  command: {
    callCurrentMenu: () => 'Вызвать текущее меню',
    getLatest: () => 'Загрузить последние мемы',
    suggestChannel: () => 'Предложить канал',
    stats: () => 'Показать статистику',
    help: () => 'Вывести справку',
  },
} as const
