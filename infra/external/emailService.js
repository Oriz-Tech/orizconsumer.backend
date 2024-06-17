var postmark = require('postmark');
const postmarkKey = process.env.POSTMARKSERVERAPITOKEN;
const senderEmail = process.env.SENDEREMAIL;

// Send an email:
function sendEmail(recipientEmail, subject, body) {
  var client = new postmark.ServerClient(postmarkKey);

  client
    .sendEmail({
      From: senderEmail,
      To: recipientEmail,
      Subject: subject,
      HtmlBody: `<html><body>${body}</body></html>`
    })
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
}

module.exports = sendEmail;
