const {monotonicFactory} = require('ulid');
const nextUlid = monotonicFactory();
module.exports ={nextUlid};