const pageOptions = {
    currentFrom: 0,
    size: 30,
    total: null,
};

const setLoader = (state = true) => {
    const loader = document.getElementById('loader');
    if (state) {
        loader.classList.remove('hide');
        return;
    }
    loader.classList.add('hide');
};

const processErrorResponse = () => {
    const results = document.getElementById('results');

    const errorResponse = document.createElement('p');
    errorResponse.id = 'error-response';
    errorResponse.textContent = 'An error occurred, please try again later';
    results.appendChild(errorResponse);
};

const processEmptyResponse = () => {
    const results = document.getElementById('results');

    const nothingFound = document.createElement('p');
    nothingFound.id = 'nothing-found';
    nothingFound.textContent = 'Nothing found';
    results.appendChild(nothingFound);
};

const processSearchResponse = (response) => {
    const results = document.getElementById('results');

    for (const entry of response) {
        const entryContainer = document.createElement('div');
        const entryLink = document.createElement('a');
        const entryImage = document.createElement('img');

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

const resetPage = () => {
    const results = document.getElementById('results');
    results.textContent = '';
    pageOptions.currentFrom = 0;
    pageOptions.total = null;
};

const startSearch = async () => {
    setLoader();
    const searchField = document.getElementById('search-field');

    const protocol = window.location.protocol;
    const host = window.location.host;
    const path = '/search';

    const url = new URL(`${protocol}//${host}${path}`);
    url.searchParams.append('query', searchField.value);
    url.searchParams.append('from', pageOptions.currentFrom);
    url.searchParams.append('size', pageOptions.size);

    // Make the GET request using the Fetch API
    try {
        const response = await fetch(url);
        const responseContents = await response.json();
        const { result, total } = responseContents;
        if (result.length) processSearchResponse(result);
        else processEmptyResponse();
        pageOptions.total = total;
        pageOptions.currentFrom += pageOptions.size;
    } catch(e) {
        console.error(e);
        processErrorResponse();
    } finally {
        setLoader(false);
    }
};

const handleInfinityScroll = () => {
    if (
        document.documentElement.scrollTop
            + document.documentElement.clientHeight
            >= document.documentElement.scrollHeight - 5
        && pageOptions.currentFrom <= pageOptions.total
    ) {
        startSearch();
    }
};

const handleScrollToTopBtn = () => {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = 'flex';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
};

const onClickSearch = () => {
    resetPage();
    startSearch();
};

const onPressEnter = (event) => {
    if (event.key !== 'Enter') return;
    resetPage();
    startSearch();
};

const onScroll = () => {
    handleInfinityScroll();
    handleScrollToTopBtn();
};

const onClickScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const init = () => {
    const searchField = document.getElementById('search-field');
    const searchButton = document.getElementById('search-button');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    searchButton.addEventListener('click', onClickSearch);
    searchField.addEventListener('keypress', onPressEnter);
    scrollToTopBtn.addEventListener('click', onClickScrollToTop);
    window.addEventListener('scroll', onScroll);
};

init();
