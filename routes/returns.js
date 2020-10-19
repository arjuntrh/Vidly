const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const router = express.Router();
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const auth = require('../middleware/auth');



router.post('/', auth, async (req, res) => {
    if (!req.body.customerId)
        res.status(400).send('customerId not provided.');

    if (!req.body.movieId)
        res.status(400).send('movieId not provided.');

    // moved to rentalSchema class
    // const rental = await Rental.findOne(
    //     {
    //         'customer._id': req.body.customerId,
    //         'movie._id': req.body.movieId
    //     });

    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental)
        return res.status(404).send('Rental not found.');

    if (rental.dateReturned)
        return res.status(400).send('Return already processed.');

    // moved to rental class
    // calculate the rental
    // const rentalDays = moment().diff(rental.dateOut, 'days');
    // rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;
    // await rental.save();

    rental.processReturn();
    await rental.save();

    // increase the stock for the movie
    await Movie.update({_id: rental.movie._id}, {$inc: { numberInStock: 1}});

    return res.status(200).send(rental);
});

module.exports = router;