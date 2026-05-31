const dotenv = require('dotenv');
const path = require('path');
const app = require('./src/app');
const connectDB = require('./src/config/db');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, 'src', '.env') });

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`ReguMind AI backend running on port ${PORT}`);
});
