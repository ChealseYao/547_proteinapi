const request = require('supertest');
const app = require('../app');

jest.setTimeout(30000); 

describe('Fragment API', () => {
  let createdProtein;

  beforeAll(async () => {
    const newProtein = {
      name: 'Test Protein',
      sequence: 'ACDEFGHIKLMNPQRSTVWY',
      sequenceUrl: 'https://example.com/protein',
      molecularWeight: 2738.02,
      sequenceLength: 20
    };

    const proteinResponse = await request(app)
      .post('/api/proteins')
      .send(newProtein)
      .expect(201);

    createdProtein = proteinResponse.body;
  });

  describe('GET /api/fragments', () => {
    it('should return all fragments', async () => {
      const response = await request(app).get('/api/fragments');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/fragments', () => {
    it('should create a new fragment', async () => {
      const newFragment = {
        proteinId: createdProtein._id,
        sequence: 'ACDEFGHI',
        startPosition: 1,
        endPosition: 8,
        url: 'https://example.com/protein2'
      };

      const response = await request(app)
        .post('/api/fragments')
        .send(newFragment)
        .expect(201);
  
      expect(response.body).toHaveProperty('proteinId', newFragment.proteinId);
      expect(response.body).toHaveProperty('sequence', newFragment.sequence);
    });
  });
});
