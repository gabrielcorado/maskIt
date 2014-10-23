/**
 * maskIt
 * JavaScript mask without jQuery.
 *
 * @author Gabriel Corado
 * @version 0.1.1
 */

/**
 * Arguement Error
 * @class
 */
var ArgumentError = function(argument) {
  this.name = 'Argument Error';
  this.message = argument + ' is not defined.';
}
ArgumentError.prototype = new Error();
ArgumentError.prototype.constructor = ArgumentError;

/*
 * Insert a value into a string by index
 * @function
 * @param {Integer} index         Location
 * @param {String} value          Append value
 * @return {String}               New string
 */
String.prototype.insertAt = function( index, value ) {
    return (this.slice(0,index) + value + this.slice(index));
};

/*
 * Replace a value into a string by index
 * @function
 * @param {Integer} index         Location
 * @param {String} value          Append value
 * @return {String}               New string
 */
String.prototype.replaceAt = function( index, value ) {
  return this.substr(0, index) + value + this.substr(index + value.length);
}

/*
 * Checks if the keyboard input changes the input value
 * @function
 * @return {Boolean}
 */
KeyboardEvent.prototype.isMetaChangerValue = function() {
  // Checks
  if( this.metaKey || this.ctrlKey ) {
    if( ['X', 'V', 'Z', 'Y'].indexOf(String.fromCharCode(this.which)) > -1 )
      return true;
  }

  // Defaul return
  return false;
}

/*
 * Get the keyboard entry type
 * @function
 * @return {String}             'value', 'meta', 'number', 'character', 'space', 'backspace' or undefined
 */
KeyboardEvent.prototype.dataType = function() {
  // Get value
  var value = String.fromCharCode(this.which);

  // Checks
  if( this.isMetaChangerValue() )
    return 'value';
  else if( this.metaKey || this.altKey || this.ctrlKey )
    return 'meta';
  else if( /[0-9]/.test(value) )
    return 'number';
  else if( /[a-z]/i.test(value) )
    return 'character';
  else if( /\s/.test(value) )
    return 'space';
  else if( /[\b]/.test(value) )
    return 'backspace';
  else
    return undefined;
}

/*
 * Returns the cursor position in an input
 * @function
 * @return {Integer}              Index of cursor
 */
Element.prototype.cursorPosition = function() {
  if (this.createTextRange) {
    var r = document.selection.createRange().duplicate()
    r.moveEnd('character', this.value.length)
    if (r.text == '') return this.value.length
    return this.value.lastIndexOf(r.text)
  } else return this.selectionStart
}

/*
 * Set index for the input cursor
 * @function
 * @param {Integer} positions     New index of cursor
 */
Element.prototype.setCursorPosition = function(position) {
  if(this.createTextRange) {
    var range = this.createTextRange();
    range.move('character', position);
    range.select();
  } else {
    if(this.selectionStart) {
      this.focus();
      this.setSelectionRange(position, position);
    }
    else
      this.focus();
  }
}

/*
 * Update the input value by index
 * @function
 * @param {String} value         Append value
 * @param {Integer} index        Locations of append
 */
Element.prototype._updateValue = function( value, index ) {
  // Add current and check next
  if( index < this.value.length )
    this.value = this.value.replaceAt(index, value);
  else
    this.value = this.value.insertAt(index, value);
}

/*
 * Delegate the mask event
 * @function
 */
Element.prototype._maskEvent = function() {
  // Non mask element
  if( this._mask == undefined )
    throw new Error('mask not defined');

  // First time
  if( this._maskEventDelegated == undefined )
    this._maskEventDelegated = false;

  // Checks if the event has been delegated
  if( this._maskEventDelegated )
    return;

  // Live Change
  this.addEventListener('keydown', function(e) {

    var el = e.target,
        nextIndex = el.cursorPosition(),
        typedValue = String.fromCharCode(e.which),
        patternValue = el._mask.pattern[nextIndex],
        eventDataType = e.dataType();

    if( ['number', 'character'].indexOf(eventDataType) > -1 && patternValue != undefined ) {

      // While has a delimiter
      while( true ) {
        // Update pattern
        patternValue = el._mask.pattern[nextIndex];

        // Pattern Value
        if( ['N', 'C'].indexOf(patternValue.toUpperCase()) == -1 ) {
          el._updateValue(patternValue, nextIndex);
          nextIndex++;
        } else if( patternValue.toUpperCase() == eventDataType[0].toUpperCase() ) {
          el._updateValue(typedValue, nextIndex);
          break;
        } else {
          break;
        }
      }

      // Set Positions
      el.setCursorPosition(nextIndex + 1);
    }

    // Prevent Default
    if( eventDataType != 'backspace' && eventDataType != 'meta' )
      e.preventDefault();
  });

  // Set delegated
  this._maskEventDelegated = true;
}

/*
 * Checks if the input has been masked
 * @function
 * @return {Boolean}             Masked or not
 */
Element.prototype.masked = function () {
  // Non mask element
  if( this._mask == undefined )
    throw new Error('mask not defined');

  // Checks
  return this.value.length == this._mask.pattern.length;
};

/*
 * Add a mask to an input
 * @function
 * @param {String} pattern       Pattern of mask it accept N for numbers and C for characters
 * @param {Object} options       Options
 */
Element.prototype.maskItWith = function(pattern, options) {
  // Checks pattern
  if( pattern == undefined || pattern == '' )
    throw new ArgumentError('pattern');

  // Default options
  if( options == undefined || typeof options != 'object' )
    options = {}

  // Set pattern
  options.pattern = pattern;

  // Set Mask
  this._mask = options;

  // Delegate Event
  this._maskEvent();
}

/*
 * Add limit of characters
 * @function
 * @param {Integer} limit       Limit of string
 */
Element.prototype.limitCharactersIn = function(limit) {
  // Checks limit
  if( isNaN(limit) || limit < 0 )
    throw new Error('limit must be a number greater than zero');

  // Set limit
  this._limit = limit;

  // Live Change
  this.addEventListener('keydown', function(e) {
    var eventDataType = e.dataType();

    console.log(e.target.value);

    // Checks size
    if( eventDataType == 'value' || ( e.target.value.length >= e.target._limit && ['number', 'character', 'space'].indexOf(eventDataType) > -1 ) )
      e.preventDefault();

  });
}
