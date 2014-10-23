# maskIt

A simple input mask.

## Usage

### Creating a mask

The mask accept two types of data: Number(`N`) and Character(`C`) and so you can do awesome masks like `NNNN-NNN` or `CC-NN`.

### Validate field

You can validate the field with method `masked()`.

### Example

```javascript
// Select input
var input = document.getElementById('input');

// Mask it!
input.maskItWith('(NN) NNNN-NNNN');

// Checks if user fill it correct
if( input.masked() )
  alert('Correct!');
else
  alert('Wrong!');
```

### Limit characters

You limit a input in N characters.

### Example

```javascript
// Select input
var input = document.getElementById('input');

// Limit in 50 characters
input.limitCharactersIn(50);
```

## Improvements

* Add mask character limiter
* Improve the validator
* and others that appear

## Browser support

I don't test in the browsers but i think it will works.
