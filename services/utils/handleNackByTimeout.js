export const handleNackByTimeout = (logger, msg, channel) => {
    if (channel && msg) {
        logger.error('Timeout occurred while waiting for acknowledgment');
        try {
            channel.nack(msg);
        } catch (e) {
            if (!e.message.startsWith('Channel closed')) throw e;
        }
    }
};
