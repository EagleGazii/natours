const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// validator on String, like minLength, maxLength
// validator on Number, like min, max
// enum for speific value like a group with three different items it is only for Strings
// we can make our custom validator, validator is just a function that reaturns true or false, true means accept data
// false not accept, throw an error
// we use validate and a callback function

// the most popular validator package is a package called validator
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      minLength: [
        10,
        'A Tour name must have more or equal then 10 charachters',
      ],
      maxLength: [
        40,
        'A Tour name must have less or equal then 40 charachters',
      ],
      // we do not call validator.isAlpha() like this just defined and when the document name will validate will be called
      // validate: [validator.isAlpha, "Tour name must containts only charachters"]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'Diffucilty is either: easy, medium or difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this working just for create a new object because this only points to current document creation
          return val < this.price;
        },
        // mongoose feature this with ({VALUE})
        message:
          'Discount price ({VALUE}) shpuld be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // trim only works for String , removes spaces in begin and ends
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual property
// we use function because we want to get access this keyword
// we can not use durationWeeks in query because we do not have this field in database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// middleware in mongoose document middleware, query, aggragate and model middleware

// we can multi pre and post middleware or hooks
// document middleware
// runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// post after
tourSchema.post('save', function (docs, next) {
  console.log(docs);
  next();
});

// query middleware, works before (pre) or after (post) a query excuted
// regular expression for all find query like find, findOne, findById...
tourSchema.pre(/^find/, function (next) {
  //tourSchema.pre('find', function (next) {
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// aggreagetion middleware before(pre) and after(post) aggragete happened

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
