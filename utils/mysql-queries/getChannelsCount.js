export const getChannelsCount = async (mysql, { onlyAvailable, name }) => {
    const filters = [];
    if (onlyAvailable === 'true') filters.push('availability IS TRUE');
    if (name) filters.push(`name ILIKE "%${name}%"`);

    const filterString = filters?.length
        ? `WHERE ${filters.join(' AND ')}`
        : '';

    const [[results]] = await mysql.query(
        `
        SELECT COUNT(*) FROM channels
        ${mysql.escapeId(filterString)}
    `,
        [filterString],
    );
    return results['COUNT(*)'];
};
