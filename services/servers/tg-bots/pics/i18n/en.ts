import { MAX_FREE_USER_CHANNEL_SUBS } from '../../../../../constants'
import type { Translation } from './types'

export const en: Translation = {
  message: {
    start: () => `Welcome to @MemePlexBot, a search engine for memes!

The bot indexes Telegram meme channels and reads text from images.

You can:
- Search the meme catalogue
- Subscribe to new memes containing your keywords
- Link your channel and post the memes the bot finds with a button`,
    help: () => `*Meme search*

Send the text you want to find. Short queries (keywords) work best. Search matches text on memes, not descriptions of images.

*Keyword subscriptions*

Subscribe to keywords to receive new memes containing them. The bot checks Telegram channels, reads text from images, and notifies you of matches.

*Topic subscriptions*

Topics are predefined keyword groups, such as IT and relationships.

*Link your channel*

Link your channel to post memes from notifications directly to it using a button.`,
    memeSearch: {
      menu: () => 'Enter text to search for memes:',
      noNewMemes: () => 'No new memes since your last request',
      pagesCount: {
        new: count => `${count} ${count === 1 ? 'page' : 'pages'} of new memes`,
        old: count => `${count} ${count === 1 ? 'page' : 'pages'} of older memes`,
      },
      pageXOfN: (page, totalPages) => `Page ${page} of ${totalPages}`,
    },
    channelUnlinked: () => 'Channel unlinked.',
    memePostedSuccessfully: () => 'Meme posted successfully.',
    adminRightForPost: () =>
      'Give the bot administrator permission to post messages in this channel.',
    checkChannelNameFormat: () => 'Please check the channel name. Use @name or https://t.me/name.',
    checkChannelName: () => 'Please check the channel name and send it again.',
    addedUserInsteadOfChannel: () =>
      'To subscribe yourself, select “📩 My subscriptions” in the main menu. Return to the main menu or send a channel name.',
    botMustBeInTheChannelAndHaveAdminRights: () =>
      'Add the bot to the channel and give it administrator permissions.',
    onlyAdminCanSubscribeChannel: () =>
      'Only a channel administrator can add subscriptions for it. To subscribe yourself, select “📩 My subscriptions” in the main menu.',
    botMustHaveAdminRights: () => 'The bot needs administrator permission to post in the channel.',
    delimetersInsteadOfKeywords: () => 'No words found: only commas or line breaks.',
    addedKeywords: () => '✅ Keywords added!',
    channelAlredyAdded: () => 'This channel is already linked to your account.',
    addedChannel: channel => `✅ Channel @${channel} linked!`,
    thereAreNoKeywords: () => 'You have not added any keywords yet.',
    keywordSettings: () =>
      'Manage your keywords here. Send new words or phrases separated by commas or line breaks to subscribe to them.',
    mainMenu: () => '🏠 Main menu',
    subscriptionSettings: () => 'Set up keyword subscriptions for yourself or your channel.',
    topicsMenu: () => '📂 Topic subscriptions',
    rateLimit: () => '❗️ Wait a few seconds before trying again.',
    premiumUntilDate: date => `Your premium is valid until ${date}`,
    premiumPlanFeatures: () => `✨ Premium lets you:

- Receive notifications for individual keywords
- Link Telegram channels with more than ${MAX_FREE_USER_CHANNEL_SUBS} subscribers and post memes directly from the bot
- Disable notifications for individual keywords within topics`,
    topicDescription: () => 'Topics let you subscribe to predefined keyword groups.',
    youEditingSubscriptionsFor: text => `You are editing ${text}.`,
    youEditingSubscriptionsForUser: () => 'You are editing your subscriptions.',
    youEditingSubscriptionsForChannel: channel => `You are editing subscriptions for @${channel}.`,
    unsubscribeFromKeywords: () => 'Unsubscribe from keywords',
    topicContainKewords: (topic, keywords) =>
      `📂 Topic “${topic}” contains these keywords:\n${keywords}`,
    thereTopicsAndKeywords: () => 'Topics are predefined keyword groups you can subscribe to.',
    doYouWantToUnlinkChannel: channel =>
      `Unlink @${channel}? All subscription settings for this channel will be reset.`,
    youCanDemoteBotFromAdmin: () => 'You can now remove the bot from the channel administrators.',
    enterChannelNameInFormat: () => 'Enter the channel name as @name or https://t.me/name.',
    somethingWentWrongTryLater: () => 'Something went wrong. Please try again later.',
    askForPremium: () => 'To request premium, leave a comment on this post:',
    channelSuggestion: {
      format: () => 'Use /suggest_channel @name or /suggest_channel https://t.me/name.',
      thanks: () => 'Thank you for the suggestion!',
    },
    questinableQueryAdvice: () =>
      'Not finding what you expected?\n\n- Search for text on the image, rather than describing it.',
    doNotAddToQuery: () => '- Avoid adding words like “meme” or “image” to your query.',
    shortQueriesWorkBetter: () => '- Short queries work better.',
    channelSubscribersLimitForFreePlan: channel =>
      `Your channel @${channel} has reached ${MAX_FREE_USER_CHANNEL_SUBS} subscribers. Get premium to use the bot with larger channels.`,
    memeSuggested: () => '🙏 Meme submitted for moderation. Thank you!',
    memeSuggestionIndexed: () => '😎 Your meme was approved! It is now available in search.',
    nothingFound: () => 'Nothing found',
    stats: (users, memes, freeSpaceGb) => `📊 Statistics

Total memes: ${memes.total.toLocaleString('en-US')}
Free server space: ≈${freeSpaceGb.toLocaleString('en-US')} GB

Unique users today:
- Inline: ${users.inline.toLocaleString('en-US')}
- In the bot: ${users.inBot.toLocaleString('en-US')}
- Total: ${users.total.toLocaleString('en-US')}

Memes added:
- Last hour: ${memes.lastHour.toLocaleString('en-US')}
- Last 24 hours: ${memes.last24Hours.toLocaleString('en-US')}
- Last week: ${memes.lastWeek.toLocaleString('en-US')}
- Last 30 days: ${memes.last30Days.toLocaleString('en-US')}`,
    source: () => 'source',
  },
  button: {
    back: () => '⬅️ Back',
    ready: () => '✅ Ready',
    forward: () => '➡️ Next',
    editTopics: channel => `✏️ Edit topics${channel ? ` (@${channel})` : ''}`,
    addChannel: () => '➕ Add channel',
    mySubscriptions: () => '📩 My subscriptions',
    unlinkChannel: channel => `🗑 Unlink @${channel}`,
    unlinkChannelConfirm: () => '⛔ Unlink',
    toMainMenu: () => '🏠 Main menu',
    editKeywords: (emoji = '✏️', channel) =>
      `${emoji} Edit keywords${channel ? ` (@${channel})` : ''}`,
    sendKeywords: () => '📋 Show comma-separated list',
    linkYourChannel: () => '🔗 Link your channel',
    subscriptionSettings: () => '⚙️ Subscription settings',
    postMeme: channel => `➡️ Post to @${channel}`,
    memePosted: channel => `✅ Posted to @${channel}`,
    keywordSettings: {
      keyword: { unsubscribe: keyword => `🔕 ${keyword}` },
      topicKeyword: {
        subscribe: (keyword, topic) => `➕ “${keyword}” from 📂 “${topic}”`,
        unsubscribe: (keyword, topic) => `🔕 “${keyword}” from 📂 “${topic}”`,
      },
    },
    premoderation: {
      keyword: {
        base: (emoji, keyword, action) => `${emoji} “${keyword}” (${action})`,
        unsubscribe: keyword => `🔕 “${keyword}” (unsubscribe)`,
        subscribe: keyword => `➕ “${keyword}” (subscribe)`,
      },
      topic: {
        base: (emoji, topic, action) => `${emoji} 📂 “${topic}” (${action})`,
        unsubscribe: topic => `🔕 📂 “${topic}” (unsubscribe)`,
        subscribe: topic => `➕ 📂 “${topic}” (subscribe)`,
      },
      keywordFromTopic: {
        base: (emoji, keyword, topic, action) =>
          `${emoji} “${keyword}” from 📂 “${topic}” (${action})`,
        unsubscribe: (premium, keyword, topic) =>
          `${premium ? '' : '✨ '}🔕 “${keyword}” from 📂 “${topic}” (unsubscribe)`,
        subscribe: (keyword, topic) => `➕ “${keyword}” from 📂 “${topic}” (subscribe)`,
      },
    },
    subscribeKeyword: keyword => `➕ Subscribe to “${keyword}”`,
    unsubscribeKeyword: keyword => `➖ Unsubscribe from “${keyword}”`,
    subscribeToPremium: () => '✨ Request premium',
    extendPremium: () => '✨ Extend premium',
    premium: () => '✨ Premium',
    channelSubscriptions: name => `📢 Subscriptions for @${name}`,
    askForPremium: () => '✨ Request premium',
    goToPremiumRequest: () => '✨ Request premium',
    search: () => '🔎 Search',
    searchMemes: () => '🔎 Search memes',
    load: { newer: () => 'Load newer', older: () => 'Load older', more: () => 'Load more' },
    approve: () => '👍 Publish',
    approveWithoutText: () => '🖼 Without text',
    decline: () => '👎 Reject',
  },
  command: {
    callCurrentMenu: () => 'Show current menu',
    getLatest: () => 'Get latest memes',
    suggestChannel: () => 'Suggest a channel',
    stats: () => 'Show statistics',
    help: () => 'Show help',
  },
  profile: {
    description: () =>
      'Find memes by the text on them. Search in chats with @MemePlexBot, subscribe to keywords, and post finds to your channel.',
    shortDescription: () =>
      'Search memes by text. In chats: @MemePlexBot + your query. News: @memeplex_pics',
  },
}
