const express = require('express');
const mongoose = require('mongoose');
const Fawn = require('fawn') // returns a class
const router = express.Router();
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const { Rental, validateRental } = require('../models/rental');
const auth = require('../middleware/auth');

// initialize fawn
Fawn.init(mongoose);

router.get('/', auth, async (req, res) => {
    const rentals = await Rental.find().sort({ dateOut: -1 });
    res.send(rentals);
});

router.post('/', auth, async (req, res) => {
    const { error } = validateRental(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    // validate the customer
    const customer = await Customer.findById(req.body.customerId);
    if (!customer)
        return res.status(400).send("Invalid Customer.");

    // validate the movie
    const movie = await Movie.findById(req.body.movieId);
    if (!movie)
        return res.status(400).send("Invalid Movie.");

    // check the stock for availability
    if (movie.numberInStock === 0)
        return res.status(400).send('Movie not in stock.');

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            name: movie.name,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    // this should be atomic----------
    // rental = await rental.save();
    // console.log(rental);

    // movie.numberInStock--;
    // movie.save();
    // -------------------------------

    // using Fawn---------------------
    try {
        new Fawn.Task()
        .save('rentals', rental)
        .update('movies',
            { 
                _id: movie._id 
            },
            {
                $inc: {
                    numberInStock: -1
                }
            })
        .run();

        res.send(rental);
    }
    catch(exc) {
         res.status(500).send('Transaction failed');
    }
});

router.get('/:id', auth, async (req, res) => {
    const rental = Rental.findById(req.params.id)

    if (!rental)
        return res.status(404).send('The rental with the given ID was not found.');

    res.send(rental);
});

module.exports = router;