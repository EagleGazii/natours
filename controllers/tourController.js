const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
//const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../utils/Factory/handlerFactory');
//const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  // check if file is image and not file
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Nit an image! Please upload only images.', 400),
      false
    );
  }
};

// const upload = multer({ dest: 'public/img/users' });

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// where it is just images we use upload.array('images',5) / req.files
// upload.single('image') / req.file

// when it is mixed field we use like this
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImage = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover Image
  req.body.imageCover = `tour-${
    req.params.id
  }-${Data.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/image/tours/${imageCoverFilename}`);

  // 2) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Data.now()}-${
        index + 1
      }.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/image/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  /* req.query = { limit: 3, sort: 'price,-ratingsAverage' }; */
  req.query.limit = '3';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/*
exports.checkBody = (req, res, next) => {
  // you must stop updating id too
  if (req.body.id) {
    return res.status(404).json({
      status: 'fail',
      message: 'You can not update an id',
    });
  }
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
}; 
*/

// 2 Route Handlers
exports.getTourStats = catchAsync(async (req, res, next) => {
  const statistic = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //_id: '$ratingsAverage',
        //_id: null, // all tours
        _id: { $toUpper: '$difficulty' }, // sort by difficulty
        numTour: { $sum: 1 },
        numRatingsQuantity: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    /* {
      $match: { _id: { $ne: 'EASY' } }, // match not equal to easy, our id now it is difficult property
    }, */
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      statistic,
    },
  });

  /*   try {
    
  } catch (err) {
    //  return res.status(404).json({
    //  status: 'fail',
    //  message: err,
    //}); 
    next(new AppError(err, 404));
  } */
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      // 0 means not visible in group fields and 1 visible
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfTours: -1 },
    },
    /* {
      $limit: 12,
    }, */
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });

  /* try {
   
  } catch (err) {
    //  return res.status(404).json({
    //  status: 'fail',
    //  message: err,
    //}); 
    next(new AppError(err, 404));
  } */
});
// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/200/center/30,-40/unit/mi
exports.getTourWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // radius in earth in miles 3963.2 and other km
  const radius =
    unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longtitude in the format lat, lng'
      ),
      400
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lat, lng], radius] },
    },
  });

  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// '/distance/:latlng/unit/:unit'

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longtitude in the format lat, lng'
      ),
      400
    );
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    // $geoNear must be everytime ine first line in aggregate function when we use that
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour, [{ path: 'reviews' }]);

exports.getTour = factory.getOne(Tour, [{ path: 'reviews' }]);

// findByIdAndUpdate not work to update password and work jist for administrator
exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// each of stages is an object in aggragate func.
