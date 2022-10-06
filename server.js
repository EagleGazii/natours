const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// if we do not define PORT in config.env file the port will be 5000
const port = process.env.PORT || 5000;
app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}...`);
});
