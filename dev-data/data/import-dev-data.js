// add data from file to db script

const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

// eslint-disable-next-line import/no-dynamic-require
const Tour = require(`${__dirname}/../../models/tourModel`);

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

// Read data from json files
const readData = (path) => {
  return JSON.parse(
    // old version
    // fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
    fs.readFileSync(path, 'utf-8')
  );
};

// import data into db

const importData = async () => {
  try {
    await Tour.create(readData(`${__dirname}/tours.json`));
    await User.create(readData(`${__dirname}/users.json`), {
      validateBeforeSave: false,
    });
    await Review.create(readData(`${__dirname}/reviews.json`));

    console.log('Data successfully loaded');
    process.exit(); // do not use this, but we have now a small app
  } catch (err) {
    console.log(err);
  }
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
