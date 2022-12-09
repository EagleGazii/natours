const crypto = require('crypto');

const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (payloads) => {
  return jwt.sign(payloads, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSentToken = (user, statusCode, req, res) => {
  const token = signToken({ id: user.id });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
    ),
    // this cookie can not be access and modified by anyway in the browers
    httpOnly: true,
    secure:
      req.secure || req.headers('x-forwarded-proto') === 'https',
  };

  // sexure to true https
  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // remove the password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await Email(newUser, url).sendWelcome();
  // sign(payload: string | object | Buffer, secretOrPrivateKey: jwt.Secret, options?: jwt.SignOptions | undefined): string

  createSentToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password)
    return next(
      new AppError('Please provide email and password!', 400)
    );

  const user = await User.findOne({ email }).select('+password');

  // 2) control if the user exist or password is wrong it is more security like that
  // because if the attacker know which is password or email his work will be easy
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3) after the password matched create jwt and sent it to response
  createSentToken(user, 200, req, res);
});

// when we are doing token based authentication we usually never need an endpoint like this
// but when we need a super secure cookie we use like this
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 2) verification token , jwt.verify

    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    // 3) check if user still exist
    const currentUser = await User.findById(decoded.id);
    // we using query middleware pre(/^find/) - before any find... query happened and select just active !== false
    if (!currentUser) {
      return next();
    }

    // 4) if user change password after the jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) return next();

    // THERE IS A LOGGED IN USER
    req.user = currentUser;
    res.locals.user = currentUser;

    return next();
  }
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) check if token exist

  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError(
        'You are not logged in! Please log in to get access...',
        401
      )
    );

  // 2) verification token , jwt.verify

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // 3) check if user still exist
  const user = await User.findById(decoded.id);
  // we using query middleware pre(/^find/) - before any find... query happened and select just active !== false
  if (!user) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) if user change password after the jwt was issued
  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        'User recently changed password! Please login again.',
        401
      )
    );

  res.locals.user = user;

  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // 1) get user based of email
  const user = await User.findOne({ email });
  if (!user) {
    next(new AppError('There is no user with email address', 404));
  }
  // 2) generate random token
  const resetToken = user.createPasswordResetToken();
  // save the userToken in database and TokenExpires
  // await user.save({ validateBeforeSave: false });
  await user.save();

  // 3) Send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // we use validateBeforeSave because we dont need to use validators which we have in userSchema model
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
      // 500 server error
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 1) if user based on token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) check if token expired and if there is a user, set the new password
  if (!user)
    return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // 3) update passwordChangedAt property for the user

  await user.save();

  // 4) login user id and send jwt
  createSentToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // this action can go just users that are logged in
  // because we are logged in w ehave the users details, req.user = user
  // 1) get from user the currentPassword, newPassword and passwordConfirm
  const { currentPassword, newPassword, passwordNewConfirm } =
    req.body;

  // 2) look if the user has token and it is valid,
  // I use protect middleware to protect my route if user not logged in I can not change password

  const user = await User.findById(req.user.id).select('+password');

  // 3) check if currentPassword is same as the user password

  if (!(await user.correctPassword(currentPassword, user.password)))
    return next(new AppError('Your current password is wrong', 401));
  // 4) compare newPassword and passwordNewConfirm
  user.password = newPassword;
  user.passwordConfirm = passwordNewConfirm;
  // 5) save the document
  await user.save();
  // 6) log user in, jwt

  createSentToken(user, 200, req, res);
});
