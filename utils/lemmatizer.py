import json
import os
from dotenv import load_dotenv
import pika
import pymorphy2
import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer

load_dotenv()
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')

AMQP_ENDPOINT = os.getenv('AMQP_ENDPOINT')
AMQP_MEMES_TO_NLP_CHANNEL = os.getenv('AMQP_MEMES_TO_NLP_CHANNEL')
AMQP_NLP_TO_PUBLISHER_CHANNEL = os.getenv('AMQP_NLP_TO_PUBLISHER_CHANNEL')

morph_analyzer_ru = pymorphy2.MorphAnalyzer()
lemmatizer = WordNetLemmatizer()

def get_wordnet_pos(nltk_tag):
    if nltk_tag.startswith('J'):
        return wordnet.ADJ
    elif nltk_tag.startswith('V'):
        return wordnet.VERB
    elif nltk_tag.startswith('N'):
        return wordnet.NOUN
    elif nltk_tag.startswith('R'):
        return wordnet.ADV
    else:
        return None

def normalize_text(text, is_russian):
    text_tokens = []
    words = nltk.word_tokenize(text)
    
    if is_russian:
        for word in words:
            parsed_word = morph_analyzer_ru.parse(word)[0]
            forms_set = {word}
            forms_set.update(lexeme.word for lexeme in parsed_word.lexeme)
            text_tokens.append(forms_set)
    else:
        tagged_words = nltk.pos_tag(words)
        for word, tag in tagged_words:
            pos = get_wordnet_pos(tag)
            lemma = lemmatizer.lemmatize(word, pos) if pos else word
            forms_set = {word, lemma}
            text_tokens.append(forms_set)
    
    return text_tokens

def match_text(text, keywords):
    matched_keywords = []
    is_russian = any('\u0400' <= char <= '\u04FF' for char in text)
    text_tokens = normalize_text(text, is_russian)

    for keyword in keywords:
        query_words = keyword.split()
        query_tokens = []

        if is_russian:
            for word in query_words:
                forms_set = {word}
                forms_set.update(lexeme.word for parsed_form in morph_analyzer_ru.parse(word) for lexeme in parsed_form.lexeme)
                query_tokens.append(forms_set)
        else:
            tagged_query_words = nltk.pos_tag(query_words)
            for word, tag in tagged_query_words:
                pos = get_wordnet_pos(tag)
                lemma = lemmatizer.lemmatize(word, pos) if pos else word
                forms_set = {word, lemma}
                query_tokens.append(forms_set)

        for start in range(len(text_tokens) - len(query_tokens) + 1):
            if all(text_tokens[start + i].intersection(query_tokens[i]) for i in range(len(query_tokens))):
                matched_keywords.append(keyword)
                break

    return matched_keywords

def process_message(ch, method, _properties, body):
    if not AMQP_ENDPOINT:
        raise ValueError("There is no AMQP_ENDPOINT in .env file")
    if not AMQP_NLP_TO_PUBLISHER_CHANNEL:
        raise ValueError("There is no AMQP_NLP_TO_PUBLISHER_CHANNEL in .env file")
    message = json.loads(body)
    memeData = message['memeData']

    matched_keywords = match_text(memeData['eng'], message['keywords'])

    connection_2 = pika.BlockingConnection(pika.URLParameters(AMQP_ENDPOINT))
    channel_2 = connection_2.channel()

    channel_2.queue_declare(queue=AMQP_NLP_TO_PUBLISHER_CHANNEL, durable=True)

    channel_2.basic_publish(
        exchange='',
        routing_key=AMQP_NLP_TO_PUBLISHER_CHANNEL,
        body=json.dumps({
            "memeId": message['memeId'],
            "memeData": memeData,
            "matchedKeywords": matched_keywords,
        }),
        properties=pika.BasicProperties(delivery_mode=pika.DeliveryMode.Persistent)
    )

    connection_2.close()
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    if not AMQP_MEMES_TO_NLP_CHANNEL:
        raise ValueError("There is no AMQP_MEMES_TO_NLP_CHANNEL in .env file")
    if not AMQP_ENDPOINT:
        raise ValueError("There is no AMQP_ENDPOINT in .env file")
    connection = pika.BlockingConnection(pika.URLParameters(AMQP_ENDPOINT))
    channel = connection.channel()

    channel.queue_declare(queue=AMQP_MEMES_TO_NLP_CHANNEL, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=AMQP_MEMES_TO_NLP_CHANNEL, on_message_callback=process_message, auto_ack=False)

    print('Waiting for messages.')
    channel.start_consuming()

if __name__ == "__main__":
    main()
