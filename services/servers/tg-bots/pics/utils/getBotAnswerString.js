export const getBotAnswerString = (meme) => {
    // const ourImgLink = new URL(
    //     `https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`,
    // ).href;
    // const downloadLink = `[(download)](${ourImgLink})`;
    const tgLink = `https://t.me/${meme.channel}/${meme.message}`;
    return `[${tgLink}](${tgLink})`;
};
