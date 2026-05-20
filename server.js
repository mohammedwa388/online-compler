const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const uri =
  'mongodb://waly:123789825@ac-qbmocij-shard-00-00.sfevpak.mongodb.net:27017,ac-qbmocij-shard-00-01.sfevpak.mongodb.net:27017,ac-qbmocij-shard-00-02.sfevpak.mongodb.net:27017/?ssl=true&replicaSet=atlas-13nhpc-shard-0&authSource=admin&appName=Cluster0';

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
