export const resetSearchSession = (ctx) => {
    ctx.session.search = {
        nextPage: null,
        query: null,
    };
};
