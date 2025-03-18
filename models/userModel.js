const { hashPassword } = require('../common/helpers/securityHelper');

class User {
  id = 0;
  username = '';
  firstname = '';
  lastname = '';
  password = '';
  email = '';
  datecreatedutc = '';
  dateupdatedutc = '';
  lastaction = null;
  phonenumber = '';
  isverified = false;
  isemailverified = false;
  isPhonenumberVerified = false;

  profile(firstname, lastname, hashedPassword, email, phonenumber) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.password = hashedPassword;
    this.email = email;
    this.phonenumber = phonenumber;
    this.datecreatedutc = new Date().toUTCString();
    this.dateupdatedutc = new Date().toUTCString();
    this.lastaction = 'PROFILED USER ACCOUNT';
  }

  verify() {
    this.isverified = true;
    this.dateupdatedutc = new Date();
    this.lastaction = 'VERIFIED USER ACCOUNT';
  }

  setUsername(username) {
    this.username = true;
    this.dateupdatedutc = new Date();
    this.lastaction = 'SET USERNAME';
  }

  toJSON() {
    return {
      firstname: this.firstname,
      lastname: this.lastname,
      password: this.password,
      email: this.email,
      phonenumber: this.phonenumber,
      lastaction: this.lastaction
    };
  }
}

module.exports = User;
