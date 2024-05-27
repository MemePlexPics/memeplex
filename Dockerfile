FROM python:3.8-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY ./utils/lemmatizer.py ./lemmatizer.py
    CMD ["python", "./lemmatizer.py"]
