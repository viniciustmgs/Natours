const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkPostBody = (request, response, next) => {
  body = request.body;
  console.log(body);
  if (!body.name || body.name === '' || !body.price || body.price === '')
    return response
      .status(400)
      .json({ status: 'fail', data: 'Missing name or price' });
  next();
};

exports.getAllTours = (request, response) => {
  console.log(request.requestTime);
  response
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

exports.createTour = (request, response) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, request.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      response
        .status(201)
        .json({ status: 'success', data: { tours: newTour } });
    }
  );
};

exports.getTour = (request, response) => {
  const id = request.params.id * 1;
  const tour = tours.find((element) => element.id === id);
  if (!tour)
    return response.status(404).json({ status: 'fail', message: 'Invalid ID' });
  response.status(200).json({ status: 'success', data: { tour } });
};

exports.updateTour = (request, response) => {
  response
    .status(200)
    .json({ status: 'success', data: { tour: '<Updated tour here>' } });
};

exports.deleteTour = (request, response) => {
  response.status(204).json({ status: 'success', data: null });
};
