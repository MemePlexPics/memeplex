const processSearchResponse = response => {
    const results = document.getElementById('results');

    results.textContent = '';

    for (const entry of response) {
        let entryContainer = document.createElement('div');
        let entryLink = document.createElement('a');
        let entryImage = document.createElement('img');

        entryLink.href = 'https://t.me/' + entry.channel + '/' + entry.message;
        entryLink.target = '_blank';

        entryContainer.className = 'result-container';
        entryImage.className = 'result-image';
        entryImage.src = entry.fileName;
        results.appendChild(entryContainer);
        entryContainer.appendChild(entryLink);
        entryLink.appendChild(entryImage);
    }
};

const startSearch = async () => {
    const searchField = document.getElementById('search-field');
    const searchButton = document.getElementById('search-button');

    const protocol = window.location.protocol;
    const host = window.location.host;
    const path = '/search';

    const url = new URL(`${protocol}//${host}${path}`);
    url.searchParams.append('query', searchField.value);

    // Make the GET request using the Fetch API
    const response = await fetch(url);
    const responseContents = await response.json();
    processSearchResponse(responseContents);
};

const init = () => {
    const searchField = document.getElementById('search-field');
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', startSearch);
};

init();
