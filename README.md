# Installation and local launch

1. Rename `.env.sample` to `.env` and fill it with your data
2. Run `docker-compose up -d --build`
3. You're breathtaking!

# Deploying to Fly.io

## Fly Setup

1. [Install `flyctl`](https://fly.io/docs/getting-started/installing-flyctl/)

2. Sign up and log in to Fly

```sh
flyctl auth signup
```

3. Setup Fly. It might ask if you want to deploy, say no since you haven't built the app yet.
4. Set all the secrets in `.env` as Fly secrets

```sh
flyctl secrets set TG_TOKEN=YOUR_TOKEN
flyctl secrets set DATABASE_URL=YOUR_MONGO_URL
flyctl secrets set OPEN_AI_API_KEY=YOUR_OPEN_AI_API_KEY
```

5. Deploy the app

```sh
flyctl deploy
```

6. Make sure, that you have only one machine running to avoid problems with multiple instances of the bot

```sh
flyctl scale count 1
```

And you should be good to go!

# Setup CI with GitHub Actions

1. Get a Fly API token by running

```sh
flyctl auth token
```

2. Add FLY_API_TOKEN to your repository secrets
3. Test it by pushing a commit to your repository

# Environment variables

- `TG_TOKEN` — Telegram bot token
- `DATABASE_URL` — URL of the mongo database

Also, please, consider looking at `.env.sample`.

## Fine-tuning

## Scrapping

### Goals

- Gather significant number (a few thousands?) of homogeneous questions with answers and comments
- Have a process that can be run on a regular basis to update the dataset
- Have a process to transform the dataset into a format that can be used by the model

### Limitations

- Only questions with answers and comments are considered
- Skip questions with images or other visual materials
- Skip cases with more than one subquestion
- Skip questions with instructions for narrator
- Omit pass criteria to make data more homogeneous
- For simplicity we take only questions from the 2018 onwards

### How to run

```bash
  npm run fetch [NUMBER OF PACKAGES TO FETCH]
```

## Fine-tuning

### Goals

- Fine tune the model to generate questions with answers and comments
- Be able to tweak the fine-tuning process
- Be able to test the result

### How to run

```bash
  npm run prepare-data [NUMBER OF QUESTIONS TO INCLUDE IN THE DATASET]

  npm run fine-tune // this one can take quite some time
```

Test the model:

```bash
  npm run test-model
```
