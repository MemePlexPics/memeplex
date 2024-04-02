export const getChannels = async (
    mysql,
    page,
    size,
    { onlyAvailable, name },
) => {
    const filters = [];
    if (onlyAvailable === 'true') filters.push('availability IS TRUE');
    if (name && /[0-9a-zA_Z_]+/.test(name))
        filters.push(`name LIKE "%${name}%"`);

    const offset = (page - 1) * size;

    const filterString = filters?.length
        ? `WHERE ${filters.join(' AND ')}`
        : '';
    /**
     * Unfortunately, string interpolation is required here
     * if we don't want to make several different queries for each filter combination
     * The orm will handle this later, but for now let's just check values from a client by regex
     **/
    const [results] = await mysql.query(
        `
        SELECT name, availability FROM channels
        ${filterString}
        ORDER BY
            availability DESC,
            name ASC
        LIMIT ? OFFSET ?
    `,
        [size, offset],
    );
    return results;
};
