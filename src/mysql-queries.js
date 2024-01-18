export async function insertProxyToDb(mysql, address, availability, speed = null) {
    await mysql.execute(`
        INSERT INTO proxies (
            address,
            availability,
            speed
        ) VALUES ("${address}", ${availability}, ${speed})
    `);
}

export async function updateProxyInDb(mysql, address, availability = false, speed = null) {
    await mysql.execute(`
        UPDATE proxies
        SET
            availability = ${availability},
            speed = ${speed}
        WHERE address = "${address}"
    `);
}

export async function findExisted(mysql, proxy) {
    const [results] = await mysql.execute(`SELECT * FROM proxies WHERE address = "${proxy}"`);
    if (results.length) return results[0];
    return;
}

export async function getProxyForKey(mysql, key) {
    const [oldProxies] = await mysql.execute(`
            SELECT * FROM proxies
            WHERE availability = 1
                AND ocr_key = "${key}"
            ORDER BY speed LIMIT 1
        `);
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
        await linkProxyToKey(mysql, key, findedProxy.address);
        return findedProxy;
    }
}

export async function setProxyAvailability(mysql, proxy, availability) {
    await mysql.execute(`
        UPDATE proxies
        SET availability = ${availability}
        WHERE address = "${proxy}"
    `);
    if (!availability) {
        await mysql.execute(`
            UPDATE ocr_keys
            SET proxy = ${null}
            WHERE proxy = "${proxy}"
        `);
    }
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

export async function linkProxyToKey(mysql, key, proxy) {
    await mysql.execute(`
        UPDATE proxies
        SET ocr_key = "${key}"
        WHERE address = "${proxy}"
    `);
    console.log(`💬 Proxy ${proxy} was linked to key ${key}`);
}

export async function saveKeyTimeout(mysql, key, timeout) {
    await mysql.execute(`
        UPDATE ocr_keys
        SET timeout = ${timeout}
        WHERE ocr_key = "${key}"
    `);
    console.log(`💬 For key ${key} was set timeout ${timeout}`);
}

export async function selectPHash(mysql, pHash) {
    const [results] = await mysql.execute(`
        SELECT * FROM phashes
        WHERE phash = "${pHash}"
        LIMIT 1
    `);
    return results?.[0];
}

export async function insertPHash(mysql, pHash) {
    await mysql.execute(`INSERT INTO phashes (phash) VALUES ("${pHash}")`);
}
