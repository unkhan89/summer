
var loggerConfig,
    TRACE = 0,
    DEBUG = 1,
    INFO = 2, 
    WARN = 3,
    ERROR = 4,
    FATAL = 5,
    logLevelStr = 'INFO',
    logLevel = 2;


function init(loggerConfig) {

  loggerConfig = loggerConfig;

  logLevelStr = loggerConfig.logLevel.toUpperCase();

  logLevel = getLogLevelInt(logLevelStr);
}


function log(levelInt, message) {
  
  if(logLevel <= levelInt) {

    var caller = getCallerClassAndLine();

    var formattedMessage = (new Date()) + ' | '  +  caller.fileName + ':' + caller.lineNumber 
        + ' | ' + getLogLevelStr(levelInt) + ' | ' + message;

    console.log(formattedMessage);
  }
}


function trace(message) {

  log(TRACE, message);
}


function debug(message) {

  log(DEBUG, message);
}


function info(message) {
  
  log(INFO, message);
}


function warn(message, error) {

  logError(WARN, message, error);
}


function error(message, error) {
  
  logError(ERROR, message, error); 
}


function fatal(message, error) {

  logError(FATAL, message, error);
}

function logError(level, message, error) {
  
  if(error) {

    log(level, message + ' | ' + error + ' | ' + error.message + ' | ' 
        + error.stack + ' | ' + JSON.stringify(error));

  } else {
    
   log(level, message);
  }
}


function getLogLevelStr(int) {

  switch(int) {
    case TRACE:
      return 'TRACE';
      break;
    case DEBUG: 
      return 'DEBUG';
      break;
    case INFO:
      return 'INFO';
      break; 
    case WARN:
      return 'WARN';
      break;
    case ERROR:
      return 'ERROR';
      break;
    case FATAL:
      return 'FATAL';
      break;
    default: 
      return 'INFO';
  }
}


function getLogLevelInt(str) {

  switch(str) {
    case 'TRACE':
      return TRACE;
      break;
    case 'DEBUG': 
      return DEBUG;
      break;
    case 'INFO':
      return INFO;
      break; 
    case 'WARN':
      return WARN;
      break;
    case 'ERROR':
      return ERROR;
      break;
    case 'FATAL':
      return FATAL;
      break;
    default: 
      return INFO;
  }
}

function getCallerClassAndLine() {

  // var source = '';
  var fileName = '';
  var lineNumber = '';
  
  try {
  
    var orig = Error.prepareStackTrace;
  
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
  
    var err = new Error;
  
    Error.captureStackTrace(err, arguments.callee);
  
    var stack = err.stack;
  
    Error.prepareStackTrace = orig;
  
    var substack = stack[3];
  
    var fileName = substack.getFileName().split('/').pop();
  
    var lineNumber = substack.getLineNumber();
  
    // source = loggingFile + ':' + lineNumber;
  } catch (err) {
      
      // don't care!
  }
  // return source;
  return {
    'fileName' : fileName,
    'lineNumber' : lineNumber
  };
}

module.exports = {
  init : init,
  trace : trace,
  debug : debug,
  info : info,
  warn : warn,
  error : error, 
  fatal : fatal
}
