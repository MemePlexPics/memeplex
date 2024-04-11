export const removeLastSyllable = (word: string) => {
  const vowels = /[а-я]+/i.test(word)
    ? ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я']
    : ['a', 'e', 'i', 'o', 'u']

  for (let i = word.length - 1; i >= 0; i--) {
    if (vowels.includes(word[i].toLowerCase())) {
      return word.substring(0, i)
    }
  }
  return word
}
