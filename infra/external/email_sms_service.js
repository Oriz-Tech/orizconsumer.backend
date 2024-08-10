const { Resend } = require('resend');
const resend = new Resend(process.env.RESENDAPIKEY);
var request = require('request');

async function sendEmail(email, subject, content) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESENDSENDEREMAIL,
    to: [email],
    subject: subject,
    html: `<p>${content}</p>`
  });

  if (error) {
    console.error({ error });
    return 0;
  }
  console.log({ data });
  return 1;
}

async function sendSMS(phonenumber, message) {
  var options = {
    method: 'POST',
    url: `${process.env.SENDCHAMPURL}/sms/send`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SENDCHAMPACCESSKEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: [phonenumber],
      message: message,
      sender_name: 'Sendchamp',
      route: 'non_dnd'
    })
  };
  request(options, function (error, response) {
    if (error) {
      console.error({ error });
      return 0;
    }
    console.log(response.body);
    return 1;
  });
}

module.exports = {
  sendEmail,
  sendSMS
};
