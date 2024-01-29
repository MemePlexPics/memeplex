export async function insertProxyToDb(mysql, address, protocol, availability, speed = null) {
    await mysql.query(`
        INSERT INTO proxies (
            address,
            protocol,
            availability,
            speed
        ) VALUES (?, ?, ?, ?)
    `, [address, protocol, availability, speed]);
}

export async function updateProxyInDb(mysql, address, protocol, availability = false, speed = null) {
    await mysql.query(`
        UPDATE proxies
        SET
            availability = ?,
            speed = ?
        WHERE
            address = ?
            AND protocol = ?
    `, [availability, speed, address, protocol]);
}

export async function findExistedProxy(mysql, proxy, protocol) {
    const [results] = await mysql.query(`
        SELECT * FROM proxies
        WHERE
            address = ?
            AND protocol = ?
        `, [proxy, protocol]);
    if (results.length) return results[0];
    return;
}

export async function getProxyForKey(mysql, key) {
    const [oldProxies] = await mysql.query(`
            SELECT * FROM proxies
            WHERE availability = 1
                AND ocr_key = ?
            ORDER BY speed LIMIT 1
        `, [key]);
    if (oldProxies.length)
        return oldProxies[0];
    const [freeAvailableProxies] = await mysql.execute(`
            SELECT * FROM proxies
            WHERE availability = 1
                AND ocr_key IS NULL
            ORDER BY speed LIMIT 1
        `);
    if (freeAvailableProxies.length) {
        const findedProxy = freeAvailableProxies[0];
        await linkKeyToProxy(mysql, key, findedProxy.address, findedProxy.protocol);
        return findedProxy;
    }
}

export async function setProxyAvailability(mysql, proxy, protocol, availability) {
    await mysql.execute(`
        UPDATE proxies
        SET availability = ?
        WHERE
            address = ?
            AND protocol = ?
    `, [availability, proxy, protocol]);
}

export async function getRandomKey(mysql) {
    const [results] = await mysql.execute(`
        SELECT * FROM ocr_keys
        ORDER BY
            CASE 
                WHEN timeout IS NULL THEN RAND()
                ELSE timeout
            END
        LIMIT 1
    `);
    return results;
}

export async function linkKeyToProxy(mysql, key, proxy, protocol) {
    await mysql.query(`
        UPDATE proxies
        SET ocr_key = ?
        WHERE
            address = ?
            AND protocol = ?
    `, [key, proxy, protocol]);
    console.log(`💬 Proxy ${proxy} (${protocol}) was linked to key ${key}`);
}

export async function saveKeyTimeout(mysql, key, timeout) {
    await mysql.query(`
        UPDATE ocr_keys
        SET timeout = ?
        WHERE ocr_key = ?
    `, [timeout, key]);
    console.log(`💬 For key ${key} was set timeout ${timeout}`);
}

export async function selectPHash(mysql, pHash) {
    const [results] = await mysql.query(`
        SELECT * FROM phashes
        WHERE phash = ?
        LIMIT 1
    `, pHash);
    return results?.[0];
}

export async function insertPHash(mysql, pHash) {
    await mysql.query('INSERT INTO phashes (phash) VALUES (?)', pHash);
}

export async function insertChannel(mysql, name, langs, availability = true) {
    const timestamp = (Date.now()/1000 - 24 * 3600) | 0;
    await mysql.query(`
        INSERT INTO channels (
            name,
            langs,
            availability,
            timestamp
        ) VALUES (?, ?, ?, ?)
    `, [name, langs, availability, timestamp]);
}

export async function selectChannel(mysql, name) {
    const [results] = await mysql.query(`
        SELECT * FROM channels
        WHERE name = ?
    `, [name]);
    return results?.[0];
}

export async function selectAvailableChannels(mysql) {
    const [results] = await mysql.query(`
        SELECT * FROM channels
        WHERE availability IS TRUE
    `);
    return results;
}

export async function updateChannelTimestamp(mysql, name, timestamp) {
    await mysql.query(`
        UPDATE channels
        SET timestamp = ?
        WHERE name = ?
    `, [timestamp, name]);
}

export async function updateChannelAvailability(mysql, name, availability) {
    await mysql.query(`
        UPDATE channels
        SET availability = ?
        WHERE name = ?
    `, [availability, name]);
}
