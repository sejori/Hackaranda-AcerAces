FROM python:3.9

WORKDIR /bot 
COPY . .

RUN pip install openai pydantic dotenv

CMD ["python", "index.py"]