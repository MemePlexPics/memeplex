const LATEST_UPDATE_TIME = 30_000;
const SCROLL_UPDATE_DEBOUNCE = 300;

const pageOptions = {
    query: '',
    currentPage: 1,
    totalPages: 0,
    from: undefined,
    to: undefined,
};

let updateLatestInterval = 0;
let updateByScrollTimer = 0;

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

const processSearchResponse = (response, toTop = false) => {
    const results = document.getElementById('results');

    for (const entry of response) {
        const entryContainer = document.createElement('div');
        const entryLink = document.createElement('a');
        const entryImage = document.createElement('img');

        entryLink.href = 'https://t.me/' + entry.channel + '/' + entry.message;
        entryLink.target = '_blank';

        if (pageOptions.query === '' && entry.timestamp) {
            if (!pageOptions.from || entry.timestamp < pageOptions.from) pageOptions.from = entry.timestamp;
            if (!pageOptions.to || entry.timestamp > pageOptions.to) pageOptions.to = entry.timestamp;
        }

        entryContainer.className = 'result-container';
        entryImage.className = 'result-image';
        entryImage.src = entry.fileName;
        if (toTop)
            results.prepend(entryContainer);
        else
            results.appendChild(entryContainer);
        entryContainer.appendChild(entryLink);
        entryLink.appendChild(entryImage);
    }
};

const resetPage = () => {
    clearInterval(updateLatestInterval);
    updateLatestInterval = 0;
    const results = document.getElementById('results');
    results.textContent = '';
    pageOptions.query = '';
    pageOptions.currentPage = 1;
    pageOptions.totalPages = 0;
    pageOptions.from = undefined;
    pageOptions.to = undefined;
};

const handleImageRequest = async (url) => {
    try {
        const response = await fetch(url);
        if (response.status === 503) {
            alert('Wait a few seconds before trying again');
            return;
        }
        return await response.json();
    } catch(e) {
        console.error(e);
        processErrorResponse();
    }
};

const handleUpdateLates = () => {
    if (document.documentElement.scrollTop === 0)
        getLatest(true);
};

const saveSearchQuery = () => {
    const searchField = document.getElementById('search-field');
    pageOptions.query = searchField.value;
};

const startSearchByQuery = async () => {
    setLoader();
    const protocol = window.location.protocol;
    const host = window.location.host;
    const path = '/search';
    const url = new URL(`${protocol}//${host}${path}`);
    url.searchParams.append('query', pageOptions.query);
    url.searchParams.append('page', pageOptions.currentPage);

    const response = await handleImageRequest(url);
    const { result, totalPages } = response;
    if (result.length) processSearchResponse(result);
    else processEmptyResponse();
    pageOptions.totalPages = totalPages;
    pageOptions.currentPage += 1;
    setLoader(false);
};

const getLatest = async (update = true) => {
    setLoader();
    if (!updateLatestInterval)
        updateLatestInterval = setInterval(handleUpdateLates, LATEST_UPDATE_TIME);
    const protocol = window.location.protocol;
    const host = window.location.host;
    const path = '/getLatest';
    console.log(update, pageOptions);

    const url = new URL(`${protocol}//${host}${path}`);
    if (update) {
        if (pageOptions.from) {
            url.searchParams.append('from', pageOptions.to);
        }
    } else {
        if (pageOptions.to) {
            url.searchParams.append('to', pageOptions.from);
        }
    }

    const response = await handleImageRequest(url);
    const { result, totalPages } = response;
    if (result.length)
        processSearchResponse(result, update);
    if (!update)
        pageOptions.totalPages = totalPages;
    setLoader(false);
};

const handleInfinityScroll = () => {
    if (
        document.documentElement.scrollTop
            + document.documentElement.clientHeight
            >= document.documentElement.scrollHeight - 5
        && pageOptions.currentPage <= pageOptions.totalPages
    ) {
        if (updateByScrollTimer) clearTimeout(updateByScrollTimer);
        updateByScrollTimer = setTimeout(() => {
            if (pageOptions.query)
                startSearchByQuery();
            else
                getLatest(false);
        }, SCROLL_UPDATE_DEBOUNCE);
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
    saveSearchQuery();
    if (pageOptions.query)
        startSearchByQuery();
    else
        getLatest(false);
};

const onPressEnter = (event) => {
    if (event.key !== 'Enter') return;
    onClickSearch();
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
    getLatest(false);
};

init();
