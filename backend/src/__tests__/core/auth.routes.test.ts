import getApp from '../../app'
import { Application } from 'express'
import request from 'supertest'

let app : Application

beforeAll(async() => {
  app = await getApp()
})

describe('POST /auth/otp', () => {
  test('Should respond with a 200 when there is email in body', async () => {
    const response = await(request(app)
      .post('/v1/auth/otp')
      .send({
        email: 'hello@open.gov.sg'
      }))
      expect(response.status).toBe(200)
  })
})