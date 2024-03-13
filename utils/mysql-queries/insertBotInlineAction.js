export const insertBotInlineAction = async (
    mysql,
    user_id,
    action,
    query,
    selected_id,
    page,
    chat_type,
) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const [response] = await mysql.query(
        `
        INSERT INTO bot_inline_actions (
            user_id,
            action,
            query,
            selected_id,
            page,
            chat_type,
            timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
        [user_id, action, query, selected_id, page, chat_type, timestamp],
    );
    return response.affectedRows;
};
