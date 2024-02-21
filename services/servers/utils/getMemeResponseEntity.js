export const getMemeResponseEntity = (id, source) => {
    return {
        id,
        fileName: source.fileName,
        channel: source.channelName,
        message: source.messageId,
        text: {
            eng: source.eng,
        },
    };
};
