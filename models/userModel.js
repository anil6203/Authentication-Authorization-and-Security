/////////////////////////////////////////////
//////////////// EXPORTING REQUIRED MODULES
const crypto = require('crypto'); // it is build in node module so no need to install it.
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

/////////////////////////////////////////////////////////
/////////////// CREATING A SCHEMA

// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please tell us your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true, // it will automatically transform the email into lowercase
      validate: [validator.isEmail, 'please provide a valid email'],
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'please confirm your password'],
      validate: {
        // this only works on save & create!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'passowrds are not same!',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false, // not allowed user to see it
    },
  },
  {}
);

/////////////////////////////////////////////////////////////////
////////// USING MONGOOSE PRE MIDDLEWARE TO ENCRYPT THE PASSWORD.

// its best time to manipulate the data before saving (i.e encrypting the password)
userSchema.pre('save', async function (next) {
  // isModified is the function provided by mongoose which we can use on documents if password is not modified return immediatly by calling next;
  if (!this.isModified('password')) return next();
  // hash function will take two arguments first one is user password and second one is cost to the cpu, default value for cost is 10, but we used 12
  this.password = await bcrypt.hash(this.password, 12); // it will encrypt the user password
  this.passwordConfirm = undefined;
  // passwordConfirm is required for the input not to be persisted in the database
  next();
});

userSchema.pre('save', function (next) {
  // we want to save the password only when it will get modified othewise no need to save the password & other case when documents is new in that case as well we don't want to call this middleware.
  if (!this.isModified('password') || this.isNew) return next();
  // it will ensure that token has been created after the password changed.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// we don't want to see the deleted user in our getAllUser method for that we will use queryMiddleware this middleware apply to all the query that start with find
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

/////////////////////////////
//////////// INSTANCE METHODS

// Instance method is a method which will be available on all the documents of certain collection. In instance method this always points to current documents
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // getTime will give us time in millisecond so we need to convert it in seconds parseInt takes two arguments one is no itself and second is base to which we want to convert.
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // FALSE means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // creating a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // encrypting the randomly created token, never store plan reset token in data base if hacker get access to it then they may change your password
  this.passwordResetToken = crypto
    .createHash('sha256') // sha256 alogrithm
    .update(resetToken)
    .digest('hex');

  // setting expiry date to this token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // returning plan text token to the user
  return resetToken;
};
///////////////////////////////////////////////
//////////// CREATE A MODEL FROM THE SCHEMA

const User = mongoose.model('User', userSchema);

module.exports = User;
