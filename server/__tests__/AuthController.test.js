const request = require('supertest')
const app = request('http://localhost:3000/api')

test('check is working', async () => {
  const response = await app.get('/check')
  expect(response).toBeDefined()
})
