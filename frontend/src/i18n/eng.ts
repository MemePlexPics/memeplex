import { TI18nLocalization } from '../types'

export const eng: TI18nLocalization = {
  meta: {
    homeDescription: 'Search engine for memes with a focus on Russian underground Telegram',
    channelsDescription: 'List of telegram channels (sources)',
  },
  placeholder: {
    memeSearch: 'Search meme images by caption',
    channel: '@name or https://t.me/name',
    password: 'Password',
    additionalInformation: 'Additional information',
    readableTitle: 'Readable title',
    channelFilter: 'Enter a name and press Enter',
  },
  label: {
    featuredChannels: 'Featured channels',
    addFeaturedChannel: 'Add featured channel',
    text: 'Text',
    source: 'Source',
    nothingFound: 'Nothing found',
    errorOccured: 'An error occurred, please try again later',
    suggestChannel: 'Suggest channel',
    unexistedMeme: 'This meme is not in the database',
    addChannel: 'Add channel',
    channel: 'Channel',
    channels: 'Channels',
    title: 'Title',
    username: 'Username',
    from: 'From',
    comment: 'Comment',
    filter: 'Filter',
  },
  tab: {
    channels: 'Channels',
    suggested: 'Suggested',
    featured: 'Featured',
    blacklist: 'Black list',
  },
  notification: {
    removeChannel: 'Remove the channel',
    removeMeme: 'Remove the meme',
    enterPassword: 'Enter password',
    channelRemoved: '@{{channel}} has been successfully removed',
    channelMemesRemoved: '@{{channel}} memes successfully deleted',
    memeRemoved: 'Meme «{{id}}» has been successfully removed',
    incorrectPassword: 'Incorrect password',
    thankForSuggestion: 'Thank you for the suggestion!\nIt will be added after review',
    channelAdded: 'The @{{channel}} has been successfully added',
    incorrectFields: 'Incorrect fields',
    suggestDeclined: 'The @{{channel}} suggestion has been successfully declined',
    acceptSuggest: 'Accept the suggested',
    rejectSuggest: 'Reject the suggested',
    channelUnfeatured: 'The «{{channel}}» has been successfully unfeatured',
    channelFeatured: 'The «{{channel}}» has been successfully featured',
    removeFeatured: 'Remove the featured',
    pagesLeft: 'There are {{number}} more pages',
    removeChannelMemes: 'Delete all memes from @{{channel}}?',
    blacklistUpdated: 'Blacklist successfully updated',
  },
  button: {
    search: 'Search',
    addYourChannelToFavorite: 'your channel',
    ok: 'OK',
    cancel: 'Cancel',
    suggest: 'Suggest',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
  },
  page: {
    home: 'Home',
    admin: 'Admin',
    channelList: 'Channel list',
    telegramChannel: 'Telegram channel',
    telegramBot: 'Telegram bot',
    addMemes: 'Add memes',
    leaveFeedback: 'Leave feedback',
    about: 'About',
  },
}
