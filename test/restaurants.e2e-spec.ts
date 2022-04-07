import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as mongoose from 'mongoose';

describe('RestaurantController (e2e)', () => {
  let app: INestApplication;
  jest.setTimeout(100000)
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => mongoose.disconnect());

  const user = {
    "email": "NEW@mail.com",
    "password": "hashedPass",
    "name": "Renato"
  };

  const newRestaurant = {
    category: 'Fast Food',
    address: '200 Olympic Dr, Stafford, VS, 22554',
    phoneNo: 9788246116,
    email: 'ghulam@gamil.com',
    description: 'This is just a description',
    name: 'Retaurant 4',
  };

  let jwtToken;
  let restaurantCreated;

  it('(POST) - register a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/signup').send(user).expect(201).then(res => {
        expect(res.body.token).toBeDefined();
        jwtToken = res.body.token;      })
  })


  it('(POST) - creates a new restaurant', () => {
    return request(app.getHttpServer())
      .post('/restaurants')
      .set('Authorization', 'Bearer ' + jwtToken)
      .send(newRestaurant)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.name).toEqual(newRestaurant.name);
        restaurantCreated = res.body;
      });
  })
  it('(GET) - get all restaurants', () => {
    return request(app.getHttpServer())
      .get('/restaurants')
      .set('Authorization', 'Bearer ' + jwtToken)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
      });
  })
  it('(GET) - get restaurant by id', () => {
    return request(app.getHttpServer())
      .get(`/restaurants/${restaurantCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
        expect(res.body._id).toEqual(restaurantCreated._id)
      });
  })
  it('(PUT) - update restaurant by id', () => {
    return request(app.getHttpServer())
      .put(`/restaurants/${restaurantCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken)
      .send({name: 'Updated name'})
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
        expect(res.body.name).toEqual('Updated name')
      });
  })
  it('(DELETE) - delete restaurant by id', () => {
    return request(app.getHttpServer())
      .delete(`/restaurants/${restaurantCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
        expect(res.body.deleted).toBe(true)
      });
  })
})
