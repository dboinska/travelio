module.exports = hotel => {
  const rates = hotel.reviews.map(data => data.rating);
  if (rates.length > 0) {
    const meanRate = (
      Math.ceil(
        rates.reduce(function (a, b) {
          return a + b;
        }, 0)
      ) / rates.length
    ).toFixed(0);

    return meanRate;
  }
};
