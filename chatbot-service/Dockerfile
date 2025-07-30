FROM python:3.10-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk add --no-cache gcc musl-dev libffi-dev \
    && pip install --upgrade pip \
    && pip install -r requirements.txt \
    && apk del gcc musl-dev libffi-dev

RUN pip install -e .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2015"]