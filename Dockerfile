FROM python:3.8-slim
    WORKDIR /app
    COPY ./requirements.txt /app/
    RUN pip install --no-cache-dir -r requirements.txt
    COPY ./services/nlp.py /app/services/nlp.py
    CMD ["python", "./services/nlp.py"]
