/*
 * Copyright 2015 Telefónica Investigación y Desarrollo, S.A.U
 *
 * This file is part of the Short Time Historic (STH) component
 *
 * STH is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * STH is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with STH.
 * If not, see http://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with: [german.torodelvalle@telefonica.com]
 */

'use strict';

var sthDatabase = require('../../lib/sth_database');
var sthConfig = require('../../lib/sth_configuration');
var sthTestConfig = require('./sth_test_configuration');
var expect = require('expect.js');
var _ = require('lodash');

var DATABASE_NAME = sthDatabase.getDatabaseName(sthConfig.DEFAULT_SERVICE);
var DATABASE_CONNECTION_PARAMS = {
  authentication: sthConfig.DB_AUTHENTICATION,
  dbURI: sthConfig.DB_URI,
  replicaSet: sthConfig.REPLICA_SET,
  database: DATABASE_NAME,
  poolSize: sthConfig.POOL_SIZE
};
var COLLECTION_NAME_PARAMS = {
  databaseName: DATABASE_NAME,
  service: sthConfig.DEFAULT_SERVICE,
  servicePath: sthConfig.DEFAULT_SERVICE_PATH,
  entityId: sthTestConfig.ENTITY_ID,
  entityType: sthTestConfig.ENTITY_TYPE,
  attrName: sthTestConfig.ATTRIBUTE_NAME
};

/**
 * Connects to the database and returns the database connection asynchronously
 * @param  {Function} callback The callblack
 */
function connectToDatabase(callback) {
  if (sthDatabase.connection) {
    return process.nextTick(callback.bind(null, null, sthDatabase.connection));
  }
  sthDatabase.connect(DATABASE_CONNECTION_PARAMS, callback);
}

/**
 * Drops a database collection for the provided data type and model asynchronously
 * @param  {String}   dataType      The data type
 * @param  {String}   dataModel The data model
 * @param  {Function} callback  The Callback
 */
function dropCollection(dataType, dataModel, callback) {
  sthConfig.DATA_MODEL = dataModel;
  var collectionName = (dataType === sthTestConfig.DATA_TYPES.RAW) ?
    sthDatabase.getCollectionName4Events(COLLECTION_NAME_PARAMS) :
    sthDatabase.getCollectionName4Aggregated(COLLECTION_NAME_PARAMS);

  sthDatabase.connection.dropCollection(collectionName, function (err) {
    if (err && err.code === 26 && err.name === 'MongoError' && err.message === 'ns not found') {
      // The collection does not exist
      return process.nextTick(callback);
    }
    return process.nextTick(callback.bind(null, err));
  });
}

/**
 * Drops the collection hash to name collectionName
 * @param  {Function} callback The callback
 */
function dropCollectionNamesCollection(callback) {
  sthDatabase.connection.dropCollection(sthConfig.COLLECTION_PREFIX + 'collection_names', function (err) {
    if (err && err.code === 26 && err.name === 'MongoError' && err.message === 'ns not found') {
      // The collection does not exist
      return process.nextTick(callback);
    }
    return process.nextTick(callback.bind(null, err));
  });
}

/**
 * Set of tests to drop the test collections from the database
 */
function cleanDatabaseTests() {
  var dataModelsKeys = Object.keys(sthConfig.DATA_MODELS),
      dataTypeKeys = Object.keys(sthTestConfig.DATA_TYPES);

  describe('database clean up', function() {
    dataModelsKeys.forEach(function(dataModel) {
      dataTypeKeys.forEach(function(dataType) {
        it('should drop the ' + sthConfig.DATA_MODELS[dataModel] + ' ' + sthTestConfig.DATA_TYPES[dataType] +
          ' data collection if it exists', dropCollection.bind(null, sthTestConfig.DATA_TYPES[dataType],
            sthConfig.DATA_MODELS[dataModel]));
      });
    });

    it('should drop the ' + sthConfig.COLLECTION_PREFIX + 'collection_names if it exists',
      dropCollectionNamesCollection);
  });
}

/**
 * Expectations for the collection name generation
 * @param  {string} collectionName The collection name
 * @param  {string} dataType       The data type
 * @param  {string} dataModel      The data model
 */
function expectCollectionName(collectionName, dataType, dataModel) {
  var concatRawCollectionName, finalCollectionName;
  switch (dataModel) {
    case sthConfig.DATA_MODELS.COLLECTION_PER_ATTRIBUTE:
      concatRawCollectionName = COLLECTION_NAME_PARAMS.servicePath + '_' +
        COLLECTION_NAME_PARAMS.entityId + '_' + COLLECTION_NAME_PARAMS.entityType + '_' +
        COLLECTION_NAME_PARAMS.attrName;
      break;
    case sthConfig.DATA_MODELS.COLLECTION_PER_ENTITY:
      concatRawCollectionName = COLLECTION_NAME_PARAMS.servicePath + '_' +
        COLLECTION_NAME_PARAMS.entityId + '_' + COLLECTION_NAME_PARAMS.entityType;
      break;
    case sthConfig.DATA_MODELS.COLLECTION_PER_SERVICE_PATH:
      concatRawCollectionName = COLLECTION_NAME_PARAMS.servicePath;
      break;
    default:
    throw new Error(dataModel + ' is not a valid data model value');
  }

  if (sthConfig.SHOULD_HASH) {
    finalCollectionName =
      sthConfig.COLLECTION_PREFIX +
      sthDatabase.generateHash(concatRawCollectionName, sthDatabase.getHashSizeInBytes(DATABASE_NAME)) +
      (dataType === sthTestConfig.DATA_TYPES.AGGREGATED ? '.aggr' : '');
    expect(collectionName).to.equal(finalCollectionName);
  } else {
    finalCollectionName = sthConfig.COLLECTION_PREFIX +
      concatRawCollectionName + (dataType === sthTestConfig.DATA_TYPES.AGGREGATED ? '.aggr' : '');
    expect(collectionName).to.equal(finalCollectionName);
  }
}

/**
 * Battery of tests to check that the naming of the collections works as expected
 * @param  {boolean} shouldHash Flag indicating if hashing should be used in the collection names
 */
function collectionNameTests(shouldHash) {
  var ORIGINAL_DATA_MODEL = sthConfig.DATA_MODEL,
      ORIGINAL_SHOULD_HASH = sthConfig.SHOULD_HASH,
      dataTypes = Object.keys(sthTestConfig.DATA_TYPES),
      dataModels = Object.keys(sthConfig.DATA_MODELS);

  before(function() {
    sthConfig.SHOULD_HASH = shouldHash;
  });

  dataModels.forEach(function(dataModel) {
    describe(sthConfig.DATA_MODELS[dataModel] + ' data model', function() {
      before(function() {
        sthConfig.DATA_MODEL = sthConfig.DATA_MODELS[dataModel];
      });

      dataTypes.forEach(function(dataType) {
        it('should compose the collection name for ' + sthTestConfig.DATA_TYPES[dataType] + ' data',
          function(done) {
            var collectionName = sthTestConfig.DATA_TYPES[dataType] === sthTestConfig.DATA_TYPES.RAW ?
              sthDatabase.getCollectionName4Events(COLLECTION_NAME_PARAMS) :
              sthDatabase.getCollectionName4Aggregated(COLLECTION_NAME_PARAMS);
            expectCollectionName(
              collectionName, sthTestConfig.DATA_TYPES[dataType], sthConfig.DATA_MODELS[dataModel]);
            done();
          }
        );
      });

      after(function() {
        sthConfig.DATA_MODEL = ORIGINAL_DATA_MODEL;
      });
    });
  });

  after(function() {
    sthConfig.SHOULD_HASH = ORIGINAL_SHOULD_HASH;
  });
}

/**
 * Battery of tests to check that the access to the collections works as expected
 * @param  {boolean} shouldHash Flag indicating if hashing should be used in the collection names
 */
function collectionAccessTests(shouldHash) {
  var ORIGINAL_DATA_MODEL = sthConfig.DATA_MODEL,
      ORIGINAL_SHOULD_HASH = sthConfig.SHOULD_HASH,
      dataTypes = Object.keys(sthTestConfig.DATA_TYPES),
      dataModels = Object.keys(sthConfig.DATA_MODELS);

  before(function(done) {
    sthConfig.SHOULD_HASH = shouldHash;
    connectToDatabase(done);
  });

  dataModels.forEach(function(dataModel) {
    describe(sthConfig.DATA_MODELS[dataModel] + ' data model', function() {
      before(function() {
        sthConfig.DATA_MODEL = sthConfig.DATA_MODELS[dataModel];
      });

      cleanDatabaseTests();

      dataTypes.forEach(function(dataType) {
        it('should notify as error a non-existent ' + sthTestConfig.DATA_TYPES[dataType] +
          ' data collection if it should not be created', function(done) {
          sthDatabase.getCollection(
            COLLECTION_NAME_PARAMS,
            {
              shouldCreate: false,
              isAggregated: false,
              shouldStoreHash: false,
              shouldTruncate: false
            },
            function(err, collection) {
              expect(err).to.exist;
              expect(err.name).to.equal('MongoError');
              expect(err.message.indexOf('does not exist. Currently in strict mode.')).to.be.above(0);
              expect(collection).to.not.exist;
              done();
            }
          );
        });
      });

      after(function() {
        sthConfig.DATA_MODEL = ORIGINAL_DATA_MODEL;
      });
    });
  });

  after(function() {
    sthConfig.SHOULD_HASH = ORIGINAL_SHOULD_HASH;
  });
}

describe.only('sth_database tests', function() {
  describe('database connection', function() {
    it('should connect to the database', function(done) {
      sthDatabase.connect(DATABASE_CONNECTION_PARAMS, function(err, connection) {
        expect(err).to.be(null);
        expect(connection).to.equal(sthDatabase.connection);
        done();
      });
    });

    it('should disconnect from the database', function(done) {
      sthDatabase.closeConnection(function(err) {
        expect(err).to.be(null);
        expect(sthDatabase.connection).to.be(null);
        done();
      });
    });

    it('should notify as error the aim to connect to the database at an unavailable host', function(done) {
      var INVALID_DATABASE_CONNECTION_PARAMS = _.clone(DATABASE_CONNECTION_PARAMS);
      INVALID_DATABASE_CONNECTION_PARAMS.dbURI = 'unavailable_localhost:27017';
      sthDatabase.connect(INVALID_DATABASE_CONNECTION_PARAMS, function(err, connection) {
        expect(err).to.exist;
        expect(err.name).to.equal('MongoError');
        expect(err.message).to.equal('getaddrinfo ENOTFOUND');
        expect(connection).to.equal(null);
        done();
      });
    });

    it('should notify as error the aim to connect to the database at an unavailable port', function(done) {
      var INVALID_DATABASE_CONNECTION_PARAMS = _.clone(DATABASE_CONNECTION_PARAMS);
      INVALID_DATABASE_CONNECTION_PARAMS.dbURI = 'localhost:12345';
      sthDatabase.connect(INVALID_DATABASE_CONNECTION_PARAMS, function(err, connection) {
        expect(err).to.exist;
        expect(err.name).to.equal('MongoError');
        expect(err.message).to.equal('connect ECONNREFUSED');
        expect(connection).to.equal(null);
        done();
      });
    });
  });

  describe('helper functions', function() {
    it('should return the database name for a service', function() {
      expect(sthDatabase.getDatabaseName(sthConfig.DEFAULT_SERVICE)).to.equal(
        sthConfig.DB_PREFIX + sthConfig.DEFAULT_SERVICE);
    });

    describe('collection names', function() {
      describe('hashing enabled', collectionNameTests.bind(null, true));

      describe('hashing disabled', collectionNameTests.bind(null, false));
    });

    describe('collection access', function() {
      describe('hashing enabled', collectionAccessTests.bind(null, true));

      describe('hashing disabled', collectionAccessTests.bind(null, false));
    });
  });
});

/*
describe('database operation', function () {
  it('should establish a connection to the database', function (done) {
    sthDatabase.connect(
      {
        authentication: sthConfig.DB_AUTHENTICATION,
        dbURI: sthConfig.DB_URI,
        replicaSet: sthConfig.REPLICA_SET,
        database: sthDatabase.getDatabaseName(sthConfig.DEFAULT_SERVICE),
        poolSize: sthConfig.POOL_SIZE
      },
      function (err) {
        done(err);
      }
    );
  });

  it('should drop the event raw data collection if it exists',
    sthTestHelper.dropRawEventCollectionTest);

  it('should drop the aggregated data collection if it exists',
    sthTestHelper.dropAggregatedDataCollectionTest);

  it('should check if the collection for the aggregated data exists', function (done) {
    sthDatabase.getCollection(
      {
        service: sthConfig.DEFAULT_SERVICE,
        servicePath: sthConfig.DEFAULT_SERVICE_PATH,
        entityId: sthTestConfig.ENTITY_ID,
        entityType: sthTestConfig.ENTITY_TYPE,
        attrName: sthTestConfig.ATTRIBUTE_NAME
      },
      {
        isAggregated: true,
        shouldCreate: false,
        shouldStoreHash: false,
        shouldTruncate: false
      },
      function (err, collection) {
        if (err && !collection) {
          // The collection does not exist
          done();
        }
      }
    );
  });

  it('should create the collection for the single events', function (done) {
    sthDatabase.connection.createCollection(collectionName4Events, function (err) {
      done(err);
    });
  });

  it('should create the collection for the aggregated data', function (done) {
    sthDatabase.connection.createCollection(collectionName4Aggregated, function (err) {
      done(err);
    });
  });

  describe('should store individual raw events and aggregated data', function () {
    for (var i = 0; i < sthTestConfig.SAMPLES; i++) {
      describe('for each new event', sthTestHelper.eachEventTestSuite);
    }
  });

  describe('should clean the data if requested', sthTestHelper.cleanDatabaseSuite);
});
*/
