# Javascript Logger

Simple logger class to:

* Keep track of log entries.
* Keep track of timings with `time()` and `timeEnd()` methods.
* Optionally write log entries in real-time to file (TODO) or to screen (DONE).
* Optionally dump the log to file (TODO) or to string (DONE) in one go at any time.

Log entries can be added with any of the following methods:

* `info( message )`
* `debug( message )`
* `warning( message )`
* `error( message )`

For example, the following code

```javascript
log = new logger();
log.info( "an informational message intended for the user, ex: program started" );
log.debug( "a diagnostic message intended for the developer, ex: variable value = false" );
log.warning( "a warning that something might go wrong, ex: variable not set, something bad might happen" );
log.error( "explain why the program is going to crash, ex: file not found, exiting" );
```

will print to console the following lines:

```
$> 2018-05-01T10:06:07.050 [INFO] : an informational message intended for the user, ex: program started
$> 2018-05-01T10:06:07.050 [DEBUG] : a diagnostic message intended for the developer, ex: variable value = false
$> 2018-05-01T10:06:07.050 [WARNING] : a warning that something might go wrong, ex: variable not set, something bad might happen
$> 2018-05-01T10:06:07.051 [ERROR] : explain why the program is going to crash, ex: file not found, exiting
```

To write the same output to file, call the constructor with the third argument as `true` (TODO):

```javascript
log = new logger( null, null, true );
```

## Time tracking

You can log the time that it takes to execute a block of code by using the `time()` and `timeEnd()` methods. For example, the following code:

```javascript
log = new logger();
log.time( "A small loop" );
setTimeout( function() { log.timeEnd( "A small loop" ); }, 500 );
log.time( "A big loop" );
setTimeout( function() { log.timeEnd( "A big loop" ); }, 3000 );
```

will wait three seconds and a half, and print to console the following:

```javascript
2018-05-01T10:34:08.022 [DEBUG] : 'A small loop' took 0.506 seconds
2018-05-01T10:34:10.522 [DEBUG] : 'A big loop' took 3.006 seconds
```

Exact timings will vary depending on where the code is run.
