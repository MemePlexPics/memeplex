import { TMemeEntity } from "../types";

export const getNewDoc = (payload, texts): TMemeEntity => {
    const doc = {
        timestamp: Math.floor(Date.now() / 1000),
        fileName: payload.fileName,
        channelName: payload.channelName,
        messageId: payload.messageId,
        date: payload.date,
        eng: texts.eng,
    };

    return doc;
};
