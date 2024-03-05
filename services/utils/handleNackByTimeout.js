export const handleNackByTimeout = (logger, msg, channel) => {
    if (!msg) {
        logger.error('Timeout occurred while waiting for acknowledgment');
        channel.nack(msg);
    }
};
