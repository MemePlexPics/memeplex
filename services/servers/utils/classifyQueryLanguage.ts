export const classifyQueryLanguage = (query: string) => {
  const russianCharacters = /[а-яА-Я]/
  const englishCharacters = /[a-zA-Z]/

  const hasRussian = russianCharacters.test(query)
  const hasEnglish = englishCharacters.test(query)

  if (hasRussian) {
    return 'rus'
  } else if (hasEnglish) {
    return 'eng'
  }
  return 'eng'
}
