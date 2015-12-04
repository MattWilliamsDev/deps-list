/**
 * Create package list with name, license, version, and repo info
 * To use: npm ll -depth 0 -json | node deps-list
 */
var _          = require( 'underscore' );
var JSONStream = require( 'JSONStream' );
var fs         = require( 'fs' );

var FILENAME   = 'dependencies.txt';

var getOpening = function( k ) {
    return k + ': {\n';
};

var getLine = function( label, value ) {
    return '\t' + label + ': ' + value + '\n';
};


var stream = JSONStream.parse( 'dependencies', function streamListener( items ) {
    var keys = _.keys( items );
    var deps = {};
    _.each( items, function( item, key ) {
        deps[ key ] = {};
        var attrs = [ 'name', 'version', 'license', 'homepage', 'repository' ];
                
        try {
            fs.appendFileSync( FILENAME, getOpening( key ) );
        } catch ( e ) {
            console.error( 'Error with JSON Stream', e );
        }
        
        _.map( attrs, function loopAttributes( i ) {
            if ( typeof item[ i ] === 'object' ) {
                deps[ key ][ i ] = item[ i ].url;
                try {
                    fs.appendFileSync( FILENAME, '\t' + getOpening( i ) + '\t' + getLine( 'url', item[ i ].url ) + '\t}\n' );
                } catch ( e ) {
                    console.error( 'Error with JSON Stream', e );
                }
            } else if ( typeof item[ i ] !== 'undefined' ) {
                deps[ key ][ i ] = item[ i ];
                try {
                    fs.appendFileSync( FILENAME, getLine( i, item[ i ] ) );
                } catch ( e ) {
                    console.error( 'Error with JSON Stream', e );
                }
            }
        });
        
        try {
            fs.appendFileSync( FILENAME, '}\n' );
        } catch ( e ) {
            console.error( 'Error with JSON Stream', e );
        }
    });

});

process.stdin
    .pipe( stream )
    .pipe( process.stdout );

process.stdout.on( 'error', process.exit );