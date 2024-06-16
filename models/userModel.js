const { hashPassword } = require('../helpers/securityHelper');

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

  profile(firstname, lastname, password, email, phonenumber) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.password = hashPassword(password);
    this.email = email;
    this.phonenumber = phonenumber;
    this.datecreatedutc = new Date();
    this.dateupdatedutc = new Date();
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
}

module.exports = User;
