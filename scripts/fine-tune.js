const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
const configFile = path.join(__dirname, '../data', '.fine-tune-config.json');
const fineTuningDataFile = path.join(
  __dirname,
  '../data',
  'fine_tuning_data.jsonl'
);

// Helper: Read Config
const readConfig = () => {
  if (fs.existsSync(configFile)) {
    return JSON.parse(fs.readFileSync(configFile));
  }
  return {};
};

// Helper: Save Config
const saveConfig = (data) => {
  fs.writeFileSync(configFile, JSON.stringify(data));
};

// Helper: Calculate File Hash
const hashFile = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

async function main() {
  const config = readConfig();
  const fileHash = hashFile(fineTuningDataFile);

  if (config[fileHash] && config[fileHash].status !== 'succeeded') {
    console.log('Existing job found, polling status...');
    // Continue with existing job
    const jobId = config[fileHash].jobId;
    pollStatus(jobId, config, fileHash);
    return;
  }

  if (config[fileHash]) {
    console.log('Dataset already fine-tuned, exiting.');
    return;
  }

  // Upload File
  const fileUpload = await openai.files.create({
    file: fs.createReadStream(fineTuningDataFile),
    purpose: 'fine-tune',
  });
  const trainingFileId = fileUpload.id;

  // Check file status
  let isFileReady = false;
  while (!isFileReady) {
    const fileStatus = await openai.files.retrieve(trainingFileId);
    if (fileStatus.status === 'processed') {
      isFileReady = true;
    } else {
      console.log('File still processing, waiting...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Create fine-tuning job
  const fineTune = await openai.fineTuning.jobs.create({
    training_file: trainingFileId,
    model: 'gpt-3.5-turbo',
    suffix: 'myCustomSuffix', // TODO: Change this to something unique
  });

  const jobId = fineTune.id;
  console.log(`Fine-tuning job created with ID: ${jobId}`);

  // Update config
  config[fileHash] = {
    jobId,
    model: null,
    status: 'pending',
    startedAt: new Date().toISOString(),
  };
  saveConfig(config);

  pollStatus(jobId, config, fileHash);
}

// Polling job status
const pollStatus = (jobId, config, fileHash) => {
  const checkStatus = setInterval(async () => {
    const fineTuneStatus = await openai.fineTuning.jobs.retrieve(jobId);
    const status = fineTuneStatus.status;

    console.log(`Current status: ${status}`);

    if (
      status === 'succeeded' ||
      status === 'failed' ||
      status === 'cancelled'
    ) {
      clearInterval(checkStatus);

      if (status === 'succeeded') {
        config[fileHash].model = fineTuneStatus.fine_tuned_model;
      }
      config[fileHash].status = status;
      saveConfig(config);

      console.log(`Job completed. Status: ${status}`);
    }
  }, 20000);
};

main().catch((err) => console.error(err));
