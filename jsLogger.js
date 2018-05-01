/**
 * @constructor Simple logger class in javascript.
 *
 * Simple class with methods & properties to:
 *   - Keep track of log entries.
 *   - Keep track of timings with time() and timeEnd() methods
 *   - Optionally write log entries in real-time to file (TODO) or to screen.
 *   - Optionally dump the log to file in one go at any time (TODO).
 * 
 * Log entries can be added with any of the following methods:
 *  - info( message, title )
 *  - debug( message, title )
 *  - warning( message, title )
 *  - error( message, title )
 * 
 * @arg {boolean} writeToFile - Set to true to write the log entries to 
 * file as they are added. Default is false. TODO: Not implemented yet.
 * @arg {boolean} printToConsole - Set to true to print the log entries to 
 * console.log as they are added. If you'd rather use another function to
 * output the log entries, you need to set it explicitly either via the
 * constructor printFunction argument, or by overwriting the this.printFunction
 * property. Default is true.
 * @arg {boolean} printFunction - Function to use to print the log to output;
 * used only if this.printToConsole is true. Default is console.log().
 *
 * @example SIMPLE EXAMPLE
 *  > log = new jsLogger();
 *  > log.info( "an informational message intended for the user, ex: program started" );
 *  > log.debug( "a diagnostic message intended for the developer, ex: variable value = false" );
 *  > log.warning( "a warning that something might go wrong, ex: variable not set, something bad might happen" );
 *  > log.error( "explain why the program is going to crash, ex: file not found, exiting" );
 * will print to console the following lines:
 * 2018-05-01T10:06:07.050 [INFO] : an informational message intended for the user, ex: program started
 * 2018-05-01T10:06:07.050 [DEBUG] : a diagnostic message intended for the developer, ex: variable value = false
 * 2018-05-01T10:06:07.050 [WARNING] : a warning that something might go wrong, ex: variable not set, something bad might happen
 * 2018-05-01T10:06:07.051 [ERROR] : explain why the program is going to crash, ex: file not found, exiting
 *
 * @example TIME TRACKING
 *  > log = new jsLogger();
 *  > log.time( "A big loop" );
 *  > setTimeout( function() { log.timeEnd( "A big loop" ); }, 3000 ); // in Google Scripts use Utilities.sleep( 3000 )
 * will print to console the following lines, after 3 seconds:
 *   2018-05-01T10:11:52.616 [DEBUG] : 'A big loop' took 3 seconds
 *
 * @example USE CUSTOM PRINT FUNCTION
 *  > log = new jsLogger();
 *  > log.printFunction = function( s ) { console.log( "{My custom prefix} " + s + " {My custom suffix}" ); };
 *  > log.info( "Any log message" );
 * will print to console the following:
 *   {My custom prefix} 2018-05-01T10:15:44.591 [INFO] : Any log message {My custom suffix}
 *
 * @example WRITE TO FILE (TODO)
 * To write the log to file, call the log with the writeToFile argument set to true:
 *  > log = new jsLogger( true );
 * or set the writeToFile property explicitly:
 *  > log = new jsLogger();
 *  > log.writeToFile = true;
 */
var jsLogger = function( printToConsole, printFunction, writeToFile, logFilePath ) {
  
 /**
  * Incremental log, where each entry is an array with the following elements:
  *
  *  - timestamp => current time as a Date() object
  *  - level => severity of the bug; one between info, debug, warning, error
  *  - message => actual log message
  */
  this.log = [];

  /**
   * Array to keep track of timings, in milliseconds.
   */
  this.timeTracking = [];
  
  /**
   * Whether to print log entries to screen as they are added.
   */
  this.printToConsole = ( typeof printToConsole === 'boolean' ) ? printToConsole : true;
  
  /**
   * Function to use to print the log to output; used only if 
   * this.printToConsole is true.
   *
   * The print function is passed a string containing the log entry;
   * ti must append a newline character to the end of the string.
   */
  this.printFunction = ( typeof printFunction === 'function' ) ? printFunction : function( s ) { console.log( s ); };

  /**
   * Whether to write the log entries to file as they are added (TODO).
   */
  this.writeToFile = ( typeof writeToFile === 'boolean' ) ? writeToFile : false;
  
  /**
   * Full path of the file where the log will be written in real time (TODO);
   * default is <ISO timestamp>.log.
   */
  this.logFilePath = ( typeof logFilePath !== 'undefined' ) ? logFilePath : jsLogger.dateToString( new Date() ) + '.log';
  
}


// ==================
// = Object methods =
// ==================

/**
 * Add a log entry with an informational message for the user.
 */
jsLogger.prototype.info = function( message ) {
  return this.add( message, 'info' );
}


/**
 * Add a log entry with a diagnostic message for the developer.
 */
jsLogger.prototype.debug = function( message ) {
  return this.add( message, 'debug' );
}


/**
 * Add a log entry with a warning message.
 */
jsLogger.prototype.warning = function( message ) {
  return this.add( message, 'warning' );
}


/**
 * Add a log entry with an error - usually followed by
 * script termination.
 */
jsLogger.prototype.error = function( message ) {
  return this.add( message, 'error' );
}


/**
 * Start counting time, using 'name' as identifier.
 *
 * Returns the start time or false if a time tracker with the same name
 * exists
 */
jsLogger.prototype.time = function( name ) {

    if ( ! this.timeTracking.hasOwnProperty( name ) ) {
        this.timeTracking[ name ] = Date.now();
        return this.timeTracking[ name ];
    }
    else {
        return false;
    }
}


/**
 * Stop counting time, and create a log entry reporting the elapsed amount of
 * time.
 *
 * Returns the total time elapsed for the given time-tracker, or false if the
 * time tracker is not found.
 */
jsLogger.prototype.timeEnd = function( name ) {

    if ( this.timeTracking.hasOwnProperty( name ) ) {
        var start = this.timeTracking[ name ];
        var end = Date.now();
        var elapsedTime = parseFloat(end - start)/1000.0;
        delete this.timeTracking[ name ];
        this.add( "'" + name + "' took " + elapsedTime + " seconds" );
        return elapsedTime;
    }
    else {
        return false;
    }
}


/**
 * Add an entry to the log.
 *
 * @arg {string} message - The log message.
 * @arg {string} level - The log entry level; choose between info, debug,
 * warning and error.
 * @return {object} - The log entry in object form.
 */
jsLogger.prototype.add = function( message, level ) {

    level = ( typeof level !== 'undefined' ) ? level : "debug";

    /* Create the log entry */
    var logEntry = {
        'timestamp' : new Date(),
        'message' : message,
        'level' : level,
    };

    /* Add the log entry to the incremental log */
    this.log.push( logEntry );

    if ( this.writeToFile || this.printToConsole ) {

      var outputLine = this.formatLogEntry( logEntry );

      /* Write the log to output, if requested */
      if ( this.printToConsole ) {
        this.printFunction( outputLine );
      }

      /* Write the log to output, if requested */
      if ( this.writeToFile ) {
        /* TODO: WRITE TO FILE */
      }

    }

    return logEntry;
}


/**
 * Take one log entry and return a one-line human-readable string.
 */
jsLogger.prototype.formatLogEntry = function( logEntry ) {

    var logLine = "";

    if ( 'timestamp' in logEntry && 'message' in logEntry && 'level' in logEntry ) {

        /* Make sure the log entry is stringified */
        var logEntryCopy = Object.assign( {}, logEntry );
        for ( key in logEntry ) {
            if ( typeof logEntry[ key ] !== 'string' && key !== 'timestamp' ) {
                logEntryCopy[ key ] = JSON.stringify( logEntry[ key ], null, 2 )
            }
        }

        /* Build a line of the pretty log */
        logLine += jsLogger.dateToString( logEntryCopy['timestamp'], true );
        logLine += " " + "[" + logEntryCopy['level'].toUpperCase() + "] : ";
        logLine += logEntryCopy['message'];
    
    }
    
    return logLine;
}


/**
 * Dump the whole log to string, and return it.
 *
 * The method formatLogEntry() is used to format the log.
 */
jsLogger.prototype.dumpToString = function() {
  
    var output = '';

    for ( i in this.log ) {
        logEntry = this.log[ i ];
        logLine = this.formatLogEntry( logEntry );
        output += logLine + "\n";
    }
    
    return output;
}


/**
 * Dump the whole log to the given file (TODO).
 *
 * Useful if you don't know before-hand the name of the log file. Otherwise,
 * you should use the real-time logging option, that is, the writeToFile or
 * printToConsole options.
 *
 * @param {string} filePath - Absolute path of the output file. If empty,
 * will use the class property logFilePath.
 */
jsLogger.prototype.dumpToFile = function( filePath ) {

    filePath = ( typeof filePath !== 'undefined' ) ? filePath : this.logFilePath;
    
    // TODO, see https://stackoverflow.com/a/2497040/2972183

}




// ==================
// = Static methods =
// ==================

/**
 * Convert the given date object to a ISO 8601 date string.
 *
 * Source: https://stackoverflow.com/a/11172083/2972183
 *
 * @arg {Date} date - The date to be converted to a string. Default is now.
 * @arg {boolean} useCurrentTimezone - Whether to use the current timezone (true) or
 * UTC (false). Default is true.
 * @return {string} - An ISO 8601 date string, that is, YYYY-MM-DDTHH:mm:ss.sss.
 */
jsLogger.dateToString = function ( date, useCurrentTimezone ) {
    
    /* Parse arguments */
    date = ( typeof date !== 'undefined' ) ? date : new Date();
    useCurrentTimezone = ( typeof useCurrentTimezone !== 'undefined' ) ? useCurrentTimezone : true;
    
    /* Return an empty string if the given date is not a Date object */
    if ( typeof date.setMinutes !== 'function' ) {
        return '';
    }

    /* Create a copy of the input date */
    var dateCopy = new Date( date.valueOf() );

    /* Adjust the date to the local timezone, if requested */
    if ( useCurrentTimezone ) {
      dateCopy.setMinutes( dateCopy.getMinutes() - dateCopy.getTimezoneOffset() );
    }
    
    /* Get the ISO version of the date and remove the final character (z) */
    var output = dateCopy.toISOString().slice( 0, -1 );
    
    return output;
}


