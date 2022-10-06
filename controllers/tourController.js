const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  /* req.query = { limit: 3, sort: 'price,-ratingsAverage' }; */
  req.query.limit = '3';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// 2 Route Handlers
exports.getAllTours = async (req, res) => {
  try {
    // Execute a query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paggination();
    const tours = await features.query;

    // send response
    return res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.createTour = async (req, res) => {
  // Tour.create() and const tour = new Tour({}) and tour.save() it is same

  try {
    const newTour = await Tour.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.log(`Error --  ${err}`);
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

/* exports.checkBody = (req, res, next) => {
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
}; */
exports.getTour = async (req, res) => {
  try {
    // Tour.findById(req.params.id) is like Tour.findOne({id:req.params.id})
    const tour = await Tour.findById(req.params.id);
    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // Tour.findById(req.params.id) is like Tour.findOne({id:req.params.id})
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    // Tour.findById(req.params.id) is like Tour.findOne({id:req.params.id})
    await Tour.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// each of stages is an object in aggragate func.
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
