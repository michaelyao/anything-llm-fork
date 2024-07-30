const moment = require('moment-timezone');
const { createLogger, format, transports } = require('winston');
const { splat, printf, combine, timestamp, label, prettyPrint } = format;
var path = require('path')
const config = require('../../config');
console.log("starting logger ....")



// meta param is ensured by splat()
const myFormat = printf(({ timestamp, level, message, meta }) => {
  return `${ moment().tz(config.C_PST_TZ).format("YYYY-MM-DDTHH:mm:ss.SSS")};${level};${message};${meta? JSON.stringify(meta) : ''}`;
});


var PROJECT_ROOT = path.join(__dirname, '../..')
//var appRoot = require('app-root-path');

timestamp_str = moment().tz(config.C_PST_TZ).format("_YYYY_MM_DD_HH_mm_ss_SSS_");
/**
 * error
warn
info
verbose
debug
 */
const options = {
  file: {
    level: 'debug',
    filename: `./logs/${timestamp_str}app.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    timestamp: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true
  }
};


const  logger = createLogger({
  level: 'debug',
  transports: [
    new transports.File(options.file),
    new transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions,
  format: combine(
    timestamp(),
    splat(),
    myFormat
  ),
});

// logger.stream = {
//   write: function (message) {
//     logger.info(message)
//   }
// }

// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

module.exports.debug = module.exports.log = function () {
  logger.debug.apply(logger, formatLogArguments(arguments))
}

module.exports.verbose = function () {
  logger.verbose.apply(logger, formatLogArguments(arguments))
}

module.exports.info = function () {
  logger.info.apply(logger, formatLogArguments(arguments))
}

module.exports.warn = function () {
  logger.warn.apply(logger, formatLogArguments(arguments))
}

module.exports.error = function () {
  logger.error.apply(logger, formatLogArguments(arguments))
}

module.exports.stream = logger.stream

console.log = function (...args) {
  logger.info.apply(logger, formatLogArguments(args))
};
console.error = function (...args) {
  logger.error.apply(logger, formatLogArguments(args))
};
console.info = function (...args) {
  logger.warn.apply(logger, formatLogArguments(args))
};


/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments (args) {
  args = Array.prototype.slice.call(args)

  var stackInfo = getStackInfo(1)

  if (stackInfo) {
    // get file path relative to project root
    var calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

    if (typeof (args[0]) === 'string') {
      args[0] = calleeStr + ' ' + args[0]
    } else {
      args.unshift(calleeStr)
    }
  }

  return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo (stackIndex) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  var stacklist = (new Error()).stack.split('\n').slice(3)

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

  var s = stacklist[stackIndex] || stacklist[0]
  var sp = stackReg.exec(s) || stackReg2.exec(s)

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n')
    }
  }
}

