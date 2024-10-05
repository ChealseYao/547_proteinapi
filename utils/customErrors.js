class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
    }
  }
  
  class ConflictError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConflictError';
    }
  }
  
  function errorHandler(err, req, res, next) {
    console.error('Error:', err.stack);
    if (err.name === 'NotFoundError') {
      res.status(404).json({ error: err.message });
    } else if (err.name === 'ConflictError') {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  module.exports = { NotFoundError, ConflictError, errorHandler };
  