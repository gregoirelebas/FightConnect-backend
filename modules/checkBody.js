function checkBody(body, keys) {
  let isValid = true;
  const missingFields = [];

  for (const field of keys) {
    if (body[field] === undefined) {
      isValid = false;
      missingFields.push(field);
    }
  }

  return { isValid, missingFields };
}

module.exports = { checkBody };
