const catchAsync = require('../catchAsync');
const AppError = require('../appError');
const APIFeatures = require('../apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Model.findById(req.params.id) is like Model.findOne({id:req.params.id})
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new AppError('No document found with that id', 404)
      );
    }
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select('-createdAt');
    if (!document) {
      return next(
        new AppError('No document found with that id', 404)
      );
    }
    return res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Model.create() and const document = new Model({}) and document.save() it is same
    const document = await Model.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let { id } = req.params;
    if (req.params.filter) id = { ...req.params.filter };

    // Model.findById(req.params.id) is like Model.findOne({id:req.params.id})
    const document = await Model.findById(id).populate(popOptions);

    if (!document) {
      return next(
        new AppError('No document found with that id', 404)
      );
    }
    return res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.filter) filter = { ...req.params.filter };
    const features = new APIFeatures(
      Model.find(filter).populate(popOptions),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paggination();
    const document = await features.query;

    // send response
    return res.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        data: document,
      },
    });
  });
