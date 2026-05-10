const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => console.log('✅ DB connection successful'))
  .catch((err) => {
    console.error('❌ DB failed:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🚀 Running on port ${port} — ${process.env.NODE_ENV} mode`),
);
