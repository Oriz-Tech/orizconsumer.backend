const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../../common/helpers/securityHelper');

const otpTime = process.env.OTP;

class Otp{
    constructor(otp, email, otpType){
        let currentDate = new Date();
        let expirationDate = new Date(currentDate.getTime() + (1000 * otpTime));
        this.otp = hashPassword(otp);
        this.email = email;
        this.isUsed = false;
        this.dateCreatedUtc = currentDate.toUTCString();
        this.otpHeader = uuidv4();
        this.dateToExpireUtc = expirationDate.toUTCString();
        this.otpType = otpType;
    }
}

module.exports = Otp