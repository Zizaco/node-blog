var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    set: function(value) {
      return value.trim().toLowerCase()
    },
    validate: [
      function(email) {
        return email.match(/.+@.+\..+/) != null
      },
      'Invalid email'
    ],
  },
  admin: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', userSchema);
