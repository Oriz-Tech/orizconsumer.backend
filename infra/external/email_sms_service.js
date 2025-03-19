const { Resend } = require('resend');
const resend = new Resend(process.env.RESENDAPIKEY);

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

// async function sendSMS(phonenumber, message) {
//   var options = {
//     method: 'POST',
//     url: `${process.env.SENDCHAMPURL}/sms/send`,
//     headers: {
//       Accept: 'application/json',
//       Authorization: `Bearer ${process.env.SENDCHAMPACCESSKEY}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       to: [phonenumber],
//       message: message,
//       sender_name: 'Sendchamp',
//       route: 'non_dnd'
//     })
//   };
//   request(options, function (error, response) {
//     if (error) {
//       console.error({ error });
//       return 0;
//     }
//     console.log(response.body);
//     return 1;
//   });
// }

async function sendSMSVonage(phonenumber, message) {
  var request = require('request');
  var request = require('request');
  var options = {
    method: 'POST',
    url: process.env.VONAGEAPIURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      from: 'Vonage APIs',
      text: message,
      to: phonenumber.replace('+', ''),
      api_key: process.env.VONAGEAPIKEY,
      api_secret: process.env.VONAGEAPISECRET
    }
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
  sendSMSVonage
};
