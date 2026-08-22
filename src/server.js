const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { ensureDirectoriesExist } = require('./utils/fileUtils');
const { apiRateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const conversionRoutes = require('./routes/conversionRoutes');

const app = express();

ensureDirectoriesExist(env.uploadDir, env.convertedDir);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    exposedHeaders: ['Content-Disposition']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRateLimiter);
app.use('/api', conversionRoutes);

app.use(errorHandler);

const startServer = () => {
  app.listen(env.port, () => {
    console.log(`DocConvert Backend running on port ${env.port}`);
  });
};

startServer();

module.exports = app;
