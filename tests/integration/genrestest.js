const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');
let server;

describe('api/genres', () => {
    beforeEach(() => { server = require('../../index') });
    afterEach(async () => {
        await Genre.remove({});
        server.close();
    });

    describe('get /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        })
    });

    describe('get /:id', () => {
        it('should return the genre with given id', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        })

        it('should return 404 if genre with given id is not found', async () => {
            const testId = mongoose.Types.ObjectId();

            const res = await request(server).get('/api/genres/' + testId);
            expect(res.status).toBe(404);
        })
    });

    describe('post /', () => {
        it('should not allow to post new genre if user is not logged in', async () => {
            const res = await request(server)
                .post('/api/genres')
                .send({ name: 'genre1' });

            expect(res.status).toBe(401);
        });

        it('should not allow invalid genre. Genre length should be more than 3 characters', async () => {
            // generate token first
            const token = new User().generateAuthToken();

            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: '12' });

            expect(res.status).toBe(400);
        });

        it('should not allow invalid genre. Genre length should be less than 100 characters', async () => {
            // generate token first
            const token = new User().generateAuthToken();
            const genreName = new Array(102).join('a');
            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: genreName });

            expect(res.status).toBe(400);
        });

        it('Should save the genre if it is valid', async () => {
            // generate token first
            const token = new User().generateAuthToken();
            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: 'genre1'});

            const genre = await Genre.find({name: 'genre1'});
            expect(genre).not.toBeNull();
        });

        it('Should return the genre if it is valid', async () => {
            // generate token first
            const token = new User().generateAuthToken();
            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: 'genre1'});

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');            
        });
    });
});