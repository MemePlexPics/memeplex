export const createOrReplaceTable = async (mysql, mode, name, fields) => {
    const createOrReplaceTable =
        mode === 'create'
            ? 'CREATE TABLE IF NOT EXISTS'
            : 'CREATE OR REPLACE TABLE';

    if (mode === 'replace') await mysql.query('SET FOREIGN_KEY_CHECKS=0');
    const [response] = await mysql.query(
        `${createOrReplaceTable} ${name} (${fields})`,
    );
    if (mode === 'replace') await mysql.query('SET FOREIGN_KEY_CHECKS=1');
    return response.affectedRows;
};
