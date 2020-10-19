const request = require('supertest');
const mongoose = require('mongoose');
var moment = require('moment');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');

let server;


describe('returns', () => {
    let customerId;
    let movieId;
    let movie;
    let rental;
    let token;

    beforeEach(async () => {
        server = require('../../index');
        token = new User().generateAuthToken();
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        movie = new Movie({
            _id: movieId,
            title: 'Inception',
            genre: { name: 'Sci-Fi' },
            dailyRentalRate: 2,
            numberInStock: 10
        });

        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'Sam',
                phone: '1234567890'
            },
            movie: {
                _id: movieId,
                title: 'Inception',
                dailyRentalRate: 2
            }
        });

        await movie.save();
        await rental.save();
    });

    afterEach(async () => {
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    // happy path
    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId: customerId, movieId: movieId });
    }

    it('should return 401 if client is not logged in', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if rental is invalid', async () => {
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if rental is already processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if it is a valid return request', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set the return date if it is a valid request', async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const dateDiff = new Date() - rentalInDb.dateReturned;

        expect(dateDiff).toBeLessThan(10 * 1000);
    });

    it('should set the rentalFee if it is a valid request', async () => {
        rental.dateOut = new Date(moment().subtract(7, 'days'));
        await rental.save();

        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('should increase the corresponding movie stock after a valid request', async () => {

        const res = await exec();
        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental for a valid request', async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['customer', 'movie', 'dateOut', 'dateReturned', 'rentalFee'])
        );
    });
})