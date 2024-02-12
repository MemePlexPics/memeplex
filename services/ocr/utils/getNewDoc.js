export const getNewDoc = (payload, texts) => {
    const doc = {
        timestamp: Math.floor(Date.now() / 1000),
        fileName: payload.fileName,
        channelName: payload.channelName,
        messageId: payload.messageId,
        date: payload.date
    };

    for (const text of texts) {
        doc[text.language] = text.text;
    }

    return doc;
};
