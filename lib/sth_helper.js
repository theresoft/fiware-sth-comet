/* globals module */

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
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with: [german.torodelvalle@telefonica.com]
 */

'use strict';

var sthConfig = require('./sth_configuration');

var sthPackage = require('../package.json');

/**
 * Returns the 'origin' based on a date and a resolution. The 'origin' is the
 *  date taken as the reference and starting point for the aggregated data
 *  provided to the clients
 * @param {Date} aDate The data for which the origin has to be calculated
 * @param {string} resolution The resolution (typically, second, minute, hour,
 *  day or month)
 * @returns {Date} The origin calculated for the passed date and resolution
 */
function getOrigin(aDate, resolution) {
  var year = aDate.getUTCFullYear(),
    month = aDate.getUTCMonth(),
    date = aDate.getUTCDate(),
    hours = aDate.getUTCHours(),
    minutes = aDate.getUTCMinutes(),
    seconds = aDate.getUTCSeconds();

  switch (resolution) {
    case sthConfig.RESOLUTION.MONTH:
      month = 0;
    /* falls through */
    case sthConfig.RESOLUTION.DAY:
      date = 1;
    /* falls through */
    case sthConfig.RESOLUTION.HOUR:
      hours = 0;
    /* falls through */
    case sthConfig.RESOLUTION.MINUTE:
      minutes = 0;
    /* falls through */
    case sthConfig.RESOLUTION.SECOND:
      seconds = 0;
      break;
    default:
      return null;
  }
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds));
}

/**
 * Returns the 'origin' start based on a date and a resolution. The 'origin' is the
 *  date taken as the reference and starting point for the aggregated data
 *  provided to the clients
 * @param {Date} aDate The data for which the origin has to be calculated
 * @param {string} resolution The resolution (typically, second, minute, hour,
 *  day or month)
 * @returns {Date} The origin calculated for the passed date and resolution
 */
function getOriginStart(aDate, resolution) {
  var year = aDate.getUTCFullYear(),
    month = aDate.getUTCMonth(),
    date = aDate.getUTCDate(),
    hours = aDate.getUTCHours(),
    minutes = aDate.getUTCMinutes(),
    seconds = aDate.getUTCSeconds(),
    milliseconds = aDate.getUTCMilliseconds();

  switch (resolution) {
    case sthConfig.RESOLUTION.MONTH:
      date = 1;
    /* falls through */
    case sthConfig.RESOLUTION.DAY:
      hours = 0;
    /* falls through */
    case sthConfig.RESOLUTION.HOUR:
      minutes = 0;
    /* falls through */
    case sthConfig.RESOLUTION.MINUTE:
      seconds = 0;
    /* falls through */
    case sthConfig.RESOLUTION.SECOND:
      milliseconds = 0;
      break;
    default:
      return null;
  }
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds, milliseconds));
}

/**
 * Returns the 'origin' end based on a date and a resolution. The 'origin' is the
 *  date taken as the reference and starting point for the aggregated data
 *  provided to the clients
 * @param {Date} aDate The data for which the origin has to be calculated
 * @param {string} resolution The resolution (typically, second, minute, hour,
 *  day or month)
 * @returns {Date} The origin calculated for the passed date and resolution
 */
function getOriginEnd(aDate, resolution) {
  var year = aDate.getUTCFullYear(),
    month = aDate.getUTCMonth(),
    date = aDate.getUTCDate(),
    hours = aDate.getUTCHours(),
    minutes = aDate.getUTCMinutes(),
    seconds = aDate.getUTCSeconds(),
    milliseconds = aDate.getUTCMilliseconds();

  switch (resolution) {
    case sthConfig.RESOLUTION.MONTH:
      date = 31;
    /* falls through */
    case sthConfig.RESOLUTION.DAY:
      hours = 23;
    /* falls through */
    case sthConfig.RESOLUTION.HOUR:
      minutes = 59;
    /* falls through */
    case sthConfig.RESOLUTION.MINUTE:
      seconds = 59;
    /* falls through */
    case sthConfig.RESOLUTION.SECOND:
      milliseconds = 999;
      break;
    default:
      return null;
  }
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds, milliseconds));
}

/**
 * Returns the offset of a date for certain resolution
 * @param resolution The resolution
 * @param date The date
 * @return {Number} Returns the offset
 */
function getOffset(resolution, date) {
  var offset;
  switch (resolution) {
    case sthConfig.RESOLUTION.SECOND:
      offset = date.getUTCSeconds();
      break;
    case sthConfig.RESOLUTION.MINUTE:
      offset = date.getUTCMinutes();
      break;
    case sthConfig.RESOLUTION.HOUR:
      offset = date.getUTCHours();
      break;
    case sthConfig.RESOLUTION.DAY:
      offset = date.getUTCDate();
      break;
    case sthConfig.RESOLUTION.MONTH:
      offset = date.getUTCMonth() + 1;
      break;
  }
  return offset;
}

/**
 * Returns the object to return in case no aggregated data exists for
 *  certain criteria
 * @returns {Array} An empty array
 */
function getEmptyResponse() {
  return [];
}

/**
 * Generates a 32 bit integer hash code
 * @param str The seed
 * @returns {number} The hash code
 */
function getHashCode(str) {
  var hash = 0, i, chr, len;
  if (str && str.length === 0) {
    return hash;
  }
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Generates the UNICA correlator based on a request
 * @param {object} request The HTTP request
 * @return {string} The generated UNICA correlator
 */
function getUnicaCorrelator(request) {
  if (!request) {
    return sthConfig.UNICA_CORRELATOR.NOT_AVAILABLE;
  } else {
    return getHashCode('from: ' + request.info.remoteAddress +
      ':' + request.info.remotePort +
      ', method: ' + request.method.toUpperCase() +
      ', url: ' + request.url.path);
  }
}

/**
 * Generates the transaction identifier to be used when for logging
 * @return {string} The generated transaction id
 */
function getTransactionId() {
  return new Date().getTime();
}

/**
 * Returns the operation type for a concrete request to be used for logging
 * @param {object} request The request
 * @return {string} The operation type
 */
function getOperationType(request) {
  if (!request) {
    return sthConfig.OPERATION_TYPE.SERVER_LOG;
  } else {
    return sthConfig.OPERATION_TYPE_PREFIX + request.method.toUpperCase();
  }
}

/**
 * Returns a date in RFC 3339 format
 * @return {string} The formatted date
 */
function getISODateString(date) {
  function pad(n, isMs) {
    var result = n;
    if (!isMs) {
      result = (n < 10) ? '0' + n : n;
    } else if (n < 10) {
      result = '00' + n;
    } else if (n < 100) {
      result = '0' + n;
    }
    return result;
  }

  return date.getUTCFullYear() + '-' +
    pad(date.getUTCMonth() + 1) + '-' +
    pad(date.getUTCDate()) + 'T' +
    pad(date.getUTCHours()) + ':' +
    pad(date.getUTCMinutes()) + ':' +
    pad(date.getUTCSeconds()) + '.' +
    pad(date.getUTCMilliseconds(), true) + 'Z';
}

/**
 * Transforms a response payload into a NGSI formatted response
 *  payload
 * @param entityId The id of the requested entity's data
 * @param entityType The type of the requested entity's data
 * @param attrName The id of the requestedattribute's data
 * @param payload The payload to transform
 * @return {Object} The payload using NGSI format
 */
function getNGSIPayload(entityId, entityType, attrName, payload) {
  var ngsiResponse = {
    contextResponses: [
      {
        contextElement: {
          attributes: [
            {
              name: attrName,
              values: payload
            }
          ],
          id: entityId,
          isPattern: false,
          type: entityType
        },
        statusCode: {
          code: '200',
          reasonPhrase: 'OK'
        }
      }
    ]
  };
  return ngsiResponse;
}

/**
 * Returns version information about this concrete instance of the STH component
 * @return {object} A JSON-formatted object including the version information
 */
function getVersion() {
  var message = {};
  if (sthPackage) {
    if (sthPackage.version) {
      message.version = sthPackage.version;
    }
  }
  if (Object.getOwnPropertyNames(message).length === 0) {
    message.version = 'No version information available';
  }
  return message;
}

/**
 * Checks if the passed argument is an instantiable date
 * @param date A date instance, string or number from which a new date can be instantiated
 * @return {boolean} True if the passed argument is an instantiable date, false otherwise
 */
function isDate(date) {
  return (date instanceof Date) || !isNaN(Date.parse(date));
}

/**
 * Returns the value of certain metadata included in an attribute
 * @param {Array} metadatas The metadatas array to be searched in
 * @param {string} name The name of the metadata to search
 * @return {*} The metadata value, if any
 */
function getMetadataValue(metadatas, name) {
  if (metadatas) {
    for (var i = 0; i < metadatas.length; i++) {
      if (metadatas[i].name === name) {
        return metadatas[i].value;
      }
    }
  }
}

/**
 * Returns an attribute timestamp. This timestamp is the 'TimeInstant' metadata of the attribute if passed or
 *  the date and time when the notification of the new attribute value was received
 * @param attribute The attribute
 * @param recvTime The date and time the attribute notification was received
 * @return {*} The atribute timestamp
 */
function getAttributeTimestamp(attribute, recvTime) {
  var timeInstant = getMetadataValue(attribute.metadatas, 'TimeInstant');
  if (isDate(timeInstant)) {
    return new Date(timeInstant);
  } else {
    return recvTime;
  }
}

/**
 * Returns the aggretation type for certain attribute value
 * @param attrValue The attribute value
 * @return {string} The aggrgation type for the passed attribute value
 */
function getAggregationType(attrValue) {
  // isNaN(' ') is false so an additional check is needed to deal with attributes values to one or more blank spaces
  if (!isNaN(attrValue) && !(typeof(attrValue) === 'string' && attrValue.trim() === '')) {
    return sthConfig.AGGREGATION.TYPES.NUMERIC;
  } else if (typeof(attrValue) === 'string') {
    return sthConfig.AGGREGATION.TYPES.TEXTUAL;
  } else {
    return sthConfig.AGGREGATION.TYPES.UNKNOWN;
  }
}

module.exports = {
  getOrigin: getOrigin,
  getOriginStart: getOriginStart,
  getOriginEnd: getOriginEnd,
  getOffset: getOffset,
  getEmptyResponse: getEmptyResponse,
  getUnicaCorrelator: getUnicaCorrelator,
  getTransactionId: getTransactionId,
  getOperationType: getOperationType,
  getISODateString: getISODateString,
  getNGSIPayload: getNGSIPayload,
  getVersion: getVersion,
  getAttributeTimestamp: getAttributeTimestamp,
  getAggregationType: getAggregationType
};
