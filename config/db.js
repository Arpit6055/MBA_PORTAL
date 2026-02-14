/**
 * Database Configuration - MongoDB
 * SINGLE SOURCE OF TRUTH for all database operations
 * All queries should be centralized in /models directory
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

let db = null;
let client = null;

/**
 * Connect to MongoDB
 */
const connect = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'mba_portal';

    client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db(dbName);
    console.log(`✓ Connected to MongoDB database: ${dbName}`);
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

/**
 * Get database instance
 */
const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
};

/**
 * Get a collection
 */
const getCollection = (collectionName) => {
  const database = getDB();
  return database.collection(collectionName);
};

/**
 * Find a single document
 * @param {string} collection - Collection name
 * @param {Object} query - Query filter
 * @returns {Promise<Object>} Document or null
 */
const findOne = async (collection, query) => {
  try {
    const col = getCollection(collection);
    return await col.findOne(query);
  } catch (err) {
    console.error(`Error finding document in ${collection}:`, err);
    throw err;
  }
};

/**
 * Find multiple documents
 * @param {string} collection - Collection name
 * @param {Object} query - Query filter
 * @param {Object} options - Query options (sort, limit, etc)
 * @returns {Promise<Array>} Array of documents
 */
const findMany = async (collection, query = {}, options = {}) => {
  try {
    const col = getCollection(collection);
    return await col.find(query).setOptions(options).toArray();
  } catch (err) {
    console.error(`Error finding documents in ${collection}:`, err);
    throw err;
  }
};

/**
 * Insert a single document
 * @param {string} collection - Collection name
 * @param {Object} document - Document to insert
 * @returns {Promise<Object>} Inserted document with _id
 */
const insertOne = async (collection, document) => {
  try {
    const col = getCollection(collection);
    const result = await col.insertOne(document);
    return { ...document, _id: result.insertedId };
  } catch (err) {
    console.error(`Error inserting document in ${collection}:`, err);
    throw err;
  }
};

/**
 * Insert multiple documents
 * @param {string} collection - Collection name
 * @param {Array} documents - Documents to insert
 * @returns {Promise<Array>} Inserted documents with _ids
 */
const insertMany = async (collection, documents) => {
  try {
    const col = getCollection(collection);
    const result = await col.insertMany(documents);
    return documents.map((doc, idx) => ({ ...doc, _id: result.insertedIds[idx] }));
  } catch (err) {
    console.error(`Error inserting documents in ${collection}:`, err);
    throw err;
  }
};

/**
 * Update a single document
 * @param {string} collection - Collection name
 * @param {Object} query - Query filter
 * @param {Object} update - Update operations
 * @returns {Promise<Object>} Updated document
 */
const updateOne = async (collection, query, update) => {
  try {
    const col = getCollection(collection);
    const result = await col.findOneAndUpdate(query, { $set: update }, { returnDocument: 'after' });
    return result.value;
  } catch (err) {
    console.error(`Error updating document in ${collection}:`, err);
    throw err;
  }
};

/**
 * Update multiple documents
 * @param {string} collection - Collection name
 * @param {Object} query - Query filter
 * @param {Object} update - Update operations
 * @returns {Promise<number>} Number of documents modified
 */
const updateMany = async (collection, query, update) => {
  try {
    const col = getCollection(collection);
    const result = await col.updateMany(query, { $set: update });
    return result.modifiedCount;
  } catch (err) {
    console.error(`Error updating documents in ${collection}:`, err);
    throw err;
  }
};

/**
 * Delete a single document
 * @param {string} collection - Collection name
 * @param {Object} query - Query filter
 * @returns {Promise<number>} Number of documents deleted
 */
const deleteOne = async (collection, query) => {
  try {
    const col = getCollection(collection);
    const result = await col.deleteOne(query);
    return result.deletedCount;
  } catch (err) {
    console.error(`Error deleting document in ${collection}:`, err);
    throw err;
  }
};

/**
 * Delete multiple documents
 * @param {string} collection - Collection name
 * @param {Object} query - Query filter
 * @returns {Promise<number>} Number of documents deleted
 */
const deleteMany = async (collection, query = {}) => {
  try {
    const col = getCollection(collection);
    const result = await col.deleteMany(query);
    return result.deletedCount;
  } catch (err) {
    console.error(`Error deleting documents in ${collection}:`, err);
    throw err;
  }
};

/**
 * Count documents in a collection
 * @param {string} collection - Collection name
 * @param {Object} query - Query filter
 * @returns {Promise<number>} Document count
 */
const countDocuments = async (collection, query = {}) => {
  try {
    const col = getCollection(collection);
    return await col.countDocuments(query);
  } catch (err) {
    console.error(`Error counting documents in ${collection}:`, err);
    throw err;
  }
};

/**
 * Check if collection exists
 * @param {string} collectionName - Collection name
 * @returns {Promise<boolean>} True if collection exists
 */
const collectionExists = async (collectionName) => {
  try {
    const database = getDB();
    const collections = await database.listCollections().toArray();
    return collections.some(col => col.name === collectionName);
  } catch (err) {
    console.error('Error checking collection existence:', err);
    throw err;
  }
};

/**
 * Create a new collection with indexes
 * @param {string} collectionName - Collection name
 * @param {Object} indexes - Index definitions
 * @returns {Promise<void>}
 */
const createCollection = async (collectionName, indexes = {}) => {
  try {
    const database = getDB();
    const exists = await collectionExists(collectionName);
    
    if (exists) {
      console.log(`⚠️  Collection '${collectionName}' already exists (skipping)`);
      return;
    }

    await database.createCollection(collectionName);
    console.log(`✓ Created collection: ${collectionName}`);

    // Create indexes if provided
    const col = getCollection(collectionName);
    for (const [fieldName, indexOptions] of Object.entries(indexes)) {
      await col.createIndex({ [fieldName]: 1 }, indexOptions);
      console.log(`  ✓ Created index on ${fieldName}`);
    }
  } catch (err) {
    console.error(`Error creating collection ${collectionName}:`, err);
    throw err;
  }
};

/**
 * Close database connection
 */
const close = async () => {
  if (client) {
    await client.close();
    console.log('✓ MongoDB connection closed');
  }
};

module.exports = {
  connect,
  getDB,
  getCollection,
  findOne,
  findMany,
  insertOne,
  insertMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  countDocuments,
  collectionExists,
  createCollection,
  close,
};
