const supertest = require('supertest');
const app = require('../app'); 
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Mongoose connected to in-memory MongoDB');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('MongoDB Memory Server stopped and mongoose disconnected');
});

describe('Protein API Tests', () => {
  it('should create a new protein', async () => {
    const res = await supertest(app).post('/api/proteins').send({
      name: 'Test Protein',
      sequence: 'ACDEFGHIKLMNPQRSTVWY',
      sequenceUrl: 'https://example.com/protein1'  
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Protein'); 
  });

  it('should get all proteins', async () => {
    const res = await supertest(app).get('/api/proteins');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a protein by ID', async () => {
    const createRes = await supertest(app).post('/api/proteins').send({
      name: 'Test Protein',
      sequence: 'ACDEFGHIKLMNPQRSTVWY',
      sequenceUrl: 'https://example.com/protein2'
    });

    const proteinId = createRes.body.data.proteinId;  

    const res = await supertest(app).get(`/api/proteins/${proteinId}`);
    expect(res.status).toBe(200);

    expect(res.body.data.name).toBe('Test Protein');  
    expect(res.body.data.sequenceUrl).toBe('https://example.com/protein2');
  });

  it('should delete a protein by ID', async () => {
    const createRes = await supertest(app).post('/api/proteins').send({
      name: 'Test Protein',
      sequence: 'ACDEFGHIKLMNPQRSTVWY',
      sequenceUrl: 'https://example.com/protein3'
    });

    const proteinId = createRes.body.data.proteinId;  
    const deleteRes = await supertest(app).delete(`/api/proteins/${proteinId}`);
    expect(deleteRes.status).toBe(204);
  });
});
