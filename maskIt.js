/**
 * maskIt
 * JavaScript mask without jQuery.
 *
 * @author Gabriel Corado
 * @version 0.0.3
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
 * Get the keyboard entry type
 * @function
 * @return {String}             'number', 'character' or undefined
 */
KeyboardEvent.prototype.dataType = function() {
  // Get value
  var value = String.fromCharCode(this.which);

  // Checks
  if( /[0-9]/.test(value) )
    return 'number';
  else if ( /[a-z]/i.test(value) )
    return 'character';
  else
    return undefined;
}

/*
 * Called when a input has change.
 * @function
 * @param {Function} cb           Callback
 */
Element.prototype.liveChange = function(cb) {
  // Key Event
  this.addEventListener('keydown', function(e) {
    // Not combined
    if( !( e.metaKey || e.altKey || e.ctrlKey ) ) {
      // A-Z, 0-9, BACKSPACE, DELETE, SPACE and 0-9 NUMPAD
      if( String.fromCharCode(e.which) != '' )
        cb(e);
    }
  });
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
  this.liveChange(function(e) {

    var el = e.target,
        nextIndex = el.cursorPosition(),
        typedValue = String.fromCharCode(e.which),
        patternValue = el._mask.pattern[nextIndex],
        eventDataType = e.dataType();

    if( eventDataType != undefined && patternValue != undefined ) {

      // While has a delimiter
      while( true ) {
        // Update pattern
        patternValue = el._mask.pattern[nextIndex];

        // Pattern Value
        if( patternValue.toUpperCase() != 'N' && patternValue.toUpperCase() != 'C' ) {
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
    if( eventDataType != undefined )
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
