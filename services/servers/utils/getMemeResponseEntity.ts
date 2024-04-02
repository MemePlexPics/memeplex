export const getMemeResponseEntity = (id: string, source: {
    fileName: string
    channelName: string
    messageId: string
    eng: string
}) => {
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
