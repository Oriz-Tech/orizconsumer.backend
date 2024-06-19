
class LoginHistory{
    constructor(email, loginAction){
        let currentDate = new Date();
        this.userEmail = email;
        this.loginAction = loginAction
        this.dateCreatedUtc = currentDate.toUTCString();
    }
}

module.exports = LoginHistory