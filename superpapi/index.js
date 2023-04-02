const dpapi = require('bindings')('superpapi');

module.exports.protectData = dpapi.protectData;
module.exports.unprotectData = dpapi.unprotectData;
