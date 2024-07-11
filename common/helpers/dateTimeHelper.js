function getCurrentDateUtc() {
  let currentDate = new Date();

  let utcYear = currentDate.getUTCFullYear();
  let utcMonth = currentDate.getUTCMonth();
  let utcDay = currentDate.getUTCDate();
  let utcHours = currentDate.getUTCHours();
  let utcMinutes = currentDate.getUTCMinutes();
  let utcSeconds = currentDate.getUTCSeconds();

  let utcDate = new Date(Date.UTC(utcYear, utcMonth, utcDay, utcHours, utcMinutes, utcSeconds));
  return utcDate;
}

module.exports = {
  getCurrentDateUtc
};
