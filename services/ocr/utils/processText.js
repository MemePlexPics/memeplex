import * as R from 'ramda';

function punctuationToSpaces (inputString) {
    const nonAsciiOrCyrillicRegex = /[\u0021-\u0040\u007B-\u007F]/g;

    // Replace non-ASCII and non-Cyrillic characters with an empty string
    return inputString.replace(nonAsciiOrCyrillicRegex, ' ');
}

function filterNonAsciiOrCyrillic(inputString) {
    // Regular expression that matches non-ASCII and non-Cyrillic characters
    const nonAsciiOrCyrillicRegex = /[^\u0000-\u007F\u0410-\u044F]/g;

    // Replace non-ASCII and non-Cyrillic characters with an empty string
    return inputString.replace(nonAsciiOrCyrillicRegex, '');
}

const toWords = text => text.split(/\s/g);

const fromWords = words => words.join(' ');

const lowerCase = string => string.toLowerCase();

const allowedWords = new Set(['ai', 'agi']);

const isLongWord = word => word.length >= 4 || allowedWords.has(word);

export const processText = R.pipe(
    lowerCase,
    punctuationToSpaces,
    filterNonAsciiOrCyrillic,
    toWords,
    R.filter(isLongWord),
    fromWords
);
