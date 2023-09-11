## Setup

### Install dependencies

```bash
  npm i
```

### Prepare .env file

```bash
  cp .env.example .env
```

Add you OpenAI API key to the .env file

## Scrapping documentations

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
  node scrape-data.js [NUMBER OF PAGES TO SCRAPE]
```

## Training documentations

### Goals

- Fine tune the model to generate questions with answers and comments
- Be able to tweak the fine-tuning process
- Be able to test the result

### How to run

```bash
  node prepare-data.js [NUMBER OF QUESTIONS TO INCLUDE IN THE DATASET]

  node fine-tune-model.js
```

Test the model:

```bash
  node test-model.js
```
