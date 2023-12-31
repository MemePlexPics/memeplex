import fs from 'fs';

export const getTrackedChannels = () => {
    return fs.readFileSync('./state/channels.txt')
        .toString().split('\n').filter(x => !!x)
        .map(channelStr => {
            const parts = channelStr.split(/\s/g);
            if (parts.length == 1) {
                return {
                    name: parts[0],
                    languages: ['en']
                };
            } else {
                return {
                    name: parts[1],
                    languages: parts[0].split(',')
                };
            }
        });
};

// last post date or now - 24 hours
export const getChannelLastTimestamp = channelName => {
    try {
        return fs.readFileSync('./state/timestamps/' + channelName) * 1;
    } catch (e) {
        return (Date.now()/1000 - 24 * 3600) | 0;
    }
};

export const setChannelLastTimestamp = (channelName, timestamp) => {
    fs.writeFileSync('./state/timestamps/' + channelName, timestamp.toString());
};
