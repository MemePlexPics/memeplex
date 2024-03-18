export const getChannels = async (
    mysql,
    page,
    size,
    { onlyAvailable, name },
) => {
    const filters = [];
    if (onlyAvailable === 'true') filters.push('availability IS TRUE');
    if (name) filters.push(`name ILIKE "%${name}%"`);

    const offset = (page - 1) * size;

    const filterString = filters?.length
        ? `WHERE ${filters.join(' AND ')}`
        : '';

    const [results] = await mysql.query(
        `
        SELECT name, availability FROM channels
        ${mysql.escapeId(filterString)}
        ORDER BY
            availability DESC,
            name ASC
        LIMIT ? OFFSET ?
    `,
        [size, offset],
    );
    return results;
};
