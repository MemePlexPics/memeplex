const setLoader = (state = true) => {
    const loader = document.getElementById('loader');
    if (state) {
        loader.classList.remove('hide');
        return;
    }
    loader.classList.add('hide');
};

const resetChannelAndLangs = () => {
    const channelInput = document.getElementById('channel');
    const langsInput = document.getElementById('langs');
    channelInput.value = '';
    langsInput.value = '';
};

const postChannel = async (channel, langs, password) => {
    setLoader(true);
    const protocol = window.location.protocol;
    const host = window.location.host;
    const path = '/addChannel';

    const url = new URL(`${protocol}//${host}${path}`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel,
                langs,
                password,
            })
        });
        if (response.status === 403) {
            const passwordInput = document.getElementById('password');
            passwordInput.value = '';
            return;
        }
        if (response.status === 500) {
            const error = await response.json();
            console.error(error);
            return;
        }
        resetChannelAndLangs();
    } catch(e) {
        console.error(e);
    } finally {
        setLoader(false);
    }
};

const init = () => {
    const channelInput = document.getElementById('channel');
    const langsInput = document.getElementById('langs');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-button');
    submitBtn.addEventListener('click', () => {
        const channel = channelInput.value
            .replace('https://t.me/', '')
            .replace('@', '');
        const password = passwordInput.value;
        const langs = langsInput.value;
        if (!channel || !password)
            return;
        postChannel(channel, langs, password);
    });
};

init();
