(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.genish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'abs',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.abs));

      out = 'gen.abs( ' + inputs[0] + ' )';
    } else {
      out = Math.abs(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var abs = Object.create(proto);

  abs.inputs = [x];

  return abs;
};

},{"./gen.js":7}],2:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = this.callback(genName, inputs[0], inputs[1]);

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = genName + '.value';

    return [genName + '.value', functionBody];
  },


  // ${typeof _reset === 'number' && _reset < 1 ? '' : 'if('+_reset+'>=1 ) '+_name+'.value = ' + _name + '.min\n'}
  callback: function callback(_name, _incr, _reset) {
    var diff = this.max - this.min,
        out = '  ' + _name + '.value += ' + _incr + '\n  ' + (typeof _reset === 'number' && _reset < 1 ? '' : 'if(' + _reset + '>=1 ) ' + _name + '.value = ' + this.min + '\n') + '\n  if( ' + _name + '.value >= ' + this.max + ' ) ' + _name + '.value -= ' + diff + '\n  \n';
    return out;
  }
};

module.exports = function (incr) {
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var min = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var max = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: 0,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    properties: ['_incr', '_reset']
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":7}],3:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var add = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 0,
          numCount = 0,
          adderAtEnd = false;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            adderAtEnd = true;
            out += ' + ';
          }
        } else {
          sum += parseFloat(v);
          numCount++;
        }
      });

      if (numCount > 0) {
        out += adderAtEnd ? sum : ' + ' + sum;
      }

      out += ')';

      return out;
    }
  };

  return add;
};

},{"./gen.js":7}],4:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycle',
  table: null,

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    return peek('sinTable', phasor(inputs[0]), 1, 1).gen();
  },
  initTable: function initTable() {
    this.table = data('sinTable', 1024);

    for (var i = 0, l = this.table.length; i < l; i++) {
      this.table[i] = Math.sin(i / l * (Math.PI * 2));
    }
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);

  if (proto.table === null) proto.initTable();

  Object.assign(ugen, {
    frequency: frequency,
    reset: reset,
    table: proto.table,
    uid: _gen.getUID(),
    inputs: [frequency, reset],
    properties: ['frequency', 'reset']
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./data.js":5,"./gen.js":7,"./mul.js":10,"./peek.js":12,"./phasor.js":13}],5:[function(require,module,exports){
'use strict';

var gen = require('./gen.js');

var proto = {
  basename: 'data',

  gen: function gen() {
    return 'gen.data.' + this.name;
  }
};

module.exports = function (username) {
  var dim = arguments.length <= 1 || arguments[1] === undefined ? 512 : arguments[1];
  var channels = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = new Float32Array(dim);

  Object.assign(ugen, {
    username: username,
    dim: dim,
    channels: channels,
    gen: proto.gen
  });

  ugen.name = username;

  gen.data[ugen.name] = ugen;

  return ugen;
};

},{"./gen.js":7}],6:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js');

var proto = {
  basename: 'delta',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        n1 = history();

    n1.record(inputs[0]).gen();

    return sub(inputs[0], n1).gen();
  }
};

module.exports = function (in1) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":7,"./history.js":8,"./sub.js":15}],7:[function(require,module,exports){
'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

module.exports = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },

  debug: false,

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),

  parameters: [],
  endBlock: [],

  memo: {},

  data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},
  addToEndBlock: function addToEndBlock(v) {
    this.endBlock.push('  ' + v);
  },


  /* createCallback
   *
   * param ugen - Head of graph to be codegen'd
   *
   * Generate callback function for a particular ugen graph.
   * The gen.closures property stores functions that need to be
   * passed as arguments to the final function; these are prefixed
   * before any defined params the graph exposes. For example, given:
   *
   * gen.createCallback( abs( param() ) )
   *
   * ... the generated function will have a signature of ( abs, p0 ).
   */

  createCallback: function createCallback(ugen) {
    var callback = void 0,
        graphOutput = void 0;

    this.memo = {};
    this.endBlock.length = 0;
    this.closures.clear();
    this.parameters.length = 0;

    this.functionBody = "  'use strict';\n\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    graphOutput = ugen.gen();

    // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
    // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
    // just return that number (graphOutput[0]).
    this.functionBody += Array.isArray(graphOutput) ? graphOutput[1] + '\n' + graphOutput[0] : graphOutput;

    // split body to inject return keyword on last line
    this.functionBody = this.functionBody.split('\n');

    // get index of last line
    var lastidx = this.functionBody.length - 1;

    // insert return keyword
    this.functionBody[lastidx] = '  let out = ' + this.functionBody[lastidx] + '\n';

    if (this.endBlock.length) {
      this.functionBody = this.functionBody.concat(this.endBlock);
      this.functionBody.push('\n  return out');
    } else {
      this.functionBody.push('  return out');
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n');

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    var buildString = 'return function gen( ' + this.parameters.join(',') + ' ){ \n' + this.functionBody + '\n}';

    if (this.debug) console.log(buildString);

    callback = new Function(buildString)();

    // assign properties to named function
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.closures.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dict = _step.value;

        var name = Object.keys(dict)[0],
            value = dict[name];

        callback[name] = value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    callback.data = this.data;

    return callback;
  },


  /* getInputs
   *
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs: function getInputs(ugen) {
    var _this = this;

    var inputs = ugen.inputs.map(function (input) {
      var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
          processedInput = void 0;

      if (isObject) {
        // if input is a ugen...
        if (_this.memo[input.name]) {
          // if it has been memoized...
          processedInput = _this.memo[input.name];
        } else {
          // if not memoized generate code
          var code = input.gen();
          if (Array.isArray(code)) {
            _this.functionBody += code[1];
            processedInput = code[0];
          } else {
            processedInput = code;
          }
        }
      } else {
        // it input is a number
        processedInput = input;
      }

      return processedInput;
    });

    return inputs;
  }
};

},{}],8:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var ugen = {
    inputs: [0],

    record: function record(v) {
      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          _gen.addToEndBlock('gen.data.' + ugen.name + ' = ' + inputs[0]);

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          return inputs[0];
        }
      };

      this.inputs[0] = v;

      return obj;
    },
    gen: function gen() {
      return 'gen.data.' + ugen.name;
    },


    uid: _gen.getUID()
  };

  ugen.name = 'history' + ugen.uid;

  _gen.data[ugen.name] = 0;

  return ugen;
};

},{"./gen.js":7}],9:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    Object.assign(destination, library);
    destination.ssd = library.history; // history is window object property, so use ssd as alias
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  sub: require('./sub.js'),
  mul: require('./mul.js'),
  accum: require('./accum.js'),
  sin: require('./sin.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js'),
  history: require('./history.js'),
  delta: require('./delta.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./add.js":3,"./cycle.js":4,"./data.js":5,"./delta.js":6,"./gen.js":7,"./history.js":8,"./mul.js":10,"./param.js":11,"./peek.js":12,"./phasor.js":13,"./sin.js":14,"./sub.js":15}],10:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function (x, y) {
  var mul = {
    id: _gen.getUID(),
    inputs: [x, y],

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = void 0;

      if (isNaN(inputs[0]) || isNaN(inputs[1])) {
        out = '(' + inputs[0] + ' * ' + inputs[1] + ')';
      } else {
        out = parseFloat(inputs[0]) * parseFloat(inputs[1]);
      }

      return out;
    }
  };

  return mul;
};

},{"./gen.js":7}],11:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'p',

  gen: function gen() {
    _gen.parameters.push(this.name);

    _gen.memo[this.name] = this.name;

    return this.name;
  }
};

module.exports = function () {
  var param = Object.create(proto);

  param.id = _gen.getUID();
  param.name = '' + param.basename + param.id;

  return param;
};

},{"./gen.js":7}],12:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0;

    functionBody = '  let ' + this.name + '_data  = gen.data.' + this.dataName + ',\n      ' + this.name + '_phase = ' + (this.mode === 0 ? inputs[0] : inputs[0] + ' * gen.data.' + this.dataName + '.length') + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = ' + this.name + '_data[ ' + this.name + '_index ],\n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( ' + this.name + '_data[ (' + this.name + '_index+1) & (' + this.name + '_data.length - 1) ] - ' + this.name + '_base ) \n\n';
    return [this.name + '_out', functionBody];
  }
};

module.exports = function (dataName, index) {
  var channels = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
  var mode = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    dataName: dataName,
    channels: channels,
    mode: mode,
    uid: _gen.getUID(),
    inputs: [index],
    properties: null
  });

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":7,"./mul.js":10}],13:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'phasor',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    return accum(mul(inputs[0], 1 / 44100), inputs[1]).gen();
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    frequency: frequency,
    uid: _gen.getUID(),
    inputs: [frequency, reset],
    properties: ['frequency', 'reset']
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./accum.js":2,"./gen.js":7,"./mul.js":10}],14:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'sin': Math.sin });

      out = 'gen.sin( ' + inputs[0] + ' )';
    } else {
      out = Math.sin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sin = Object.create(proto);

  sin.inputs = [x];
  sin.id = _gen.getUID();
  sin.name = sin.basename + '{sin.id}';

  return sin;
};

},{"./gen.js":7}],15:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          subAtEnd = false;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            subAtEnd = true;
            out += ' - ';
          }
        } else {
          diff += parseFloat(v);
          numCount++;
        }
      });

      if (numCount > 0) {
        out += subAtEnd ? diff : ' - ' + diff;
      }

      out += ')';

      return out;
    }
  };

  return sub;
};

},{"./gen.js":7}]},{},[9])(9)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2FkZC5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RlbHRhLmpzIiwianMvZ2VuLmpzIiwianMvaGlzdG9yeS5qcyIsImpzL2luZGV4LmpzIiwianMvbXVsLmpzIiwianMvcGFyYW0uanMiLCJqcy9wZWVrLmpzIiwianMvcGhhc29yLmpzIiwianMvc2luLmpzIiwianMvc3ViLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQUssR0FBTCxDQUFsQyxFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjs7QUFLcEIsU0FBTyxHQUFQLENBTG9CO0NBQUw7Ozs7Ozs7QUN0QmpCLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixZQUFTLE9BQVQ7O0FBRUEs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SSxNQUFPLENBQVAsQ0FBSixFQUFpQjtBQUNmLGlCQUFPLENBQVAsQ0FEZTtBQUVmLGNBQUksSUFBSSxPQUFPLE1BQVAsR0FBZSxDQUFmLEVBQW1CO0FBQ3pCLHVCQUFXLElBQVgsQ0FEeUI7QUFFekIsbUJBQU8sS0FBUCxDQUZ5QjtXQUEzQjtTQUZGLE1BTUs7QUFDSCxrQkFBUSxXQUFZLENBQVosQ0FBUixDQURHO0FBRUgscUJBRkc7U0FOTDtPQURjLENBQWhCLENBTEk7O0FBa0JKLFVBQUksV0FBVyxDQUFYLEVBQWU7QUFDakIsZUFBTyxXQUFXLElBQVgsR0FBa0IsUUFBUSxJQUFSLENBRFI7T0FBbkI7O0FBSUEsYUFBTyxHQUFQLENBdEJJOztBQXdCSixhQUFPLEdBQVAsQ0F4Qkk7S0FKRTtHQUFOLENBRHdCOztBQWlDNUIsU0FBTyxHQUFQLENBakM0QjtDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0gKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBnZW5OYW1lICsgJy52YWx1ZSdcbiAgICBcbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy52YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgLy8gJHt0eXBlb2YgX3Jlc2V0ID09PSAnbnVtYmVyJyAmJiBfcmVzZXQgPCAxID8gJycgOiAnaWYoJytfcmVzZXQrJz49MSApICcrX25hbWUrJy52YWx1ZSA9ICcgKyBfbmFtZSArICcubWluXFxuJ31cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX3Jlc2V0ICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gYCAgJHtfbmFtZX0udmFsdWUgKz0gJHtfaW5jcn1cbiAgJHt0eXBlb2YgX3Jlc2V0ID09PSAnbnVtYmVyJyAmJiBfcmVzZXQgPCAxID8gJycgOiAnaWYoJytfcmVzZXQrJz49MSApICcrX25hbWUrJy52YWx1ZSA9ICcgKyB0aGlzLm1pbiArICdcXG4nfVxuICBpZiggJHtfbmFtZX0udmFsdWUgPj0gJHt0aGlzLm1heH0gKSAke19uYW1lfS52YWx1ZSAtPSAke2RpZmZ9XG4gIFxuYFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHZhbHVlOiAgIDAsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gICAgcHJvcGVydGllczogWyAnX2luY3InLCdfcmVzZXQnIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGxldCBhZGQgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIHN1bSA9IDAsIG51bUNvdW50ID0gMCwgYWRkZXJBdEVuZCA9IGZhbHNlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICAgIG91dCArPSB2XG4gICAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICAgIG91dCArPSAnICsgJ1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICAgIG51bUNvdW50KytcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgICAgfVxuICAgICAgXG4gICAgICBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBhZGRcbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuICB0YWJsZTpudWxsLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICByZXR1cm4gcGVlaygnc2luVGFibGUnLCBwaGFzb3IoIGlucHV0c1swXSApLCAxLCAxICkuZ2VuKClcbiAgfSxcblxuICBpbml0VGFibGUoKSB7XG4gICAgdGhpcy50YWJsZSA9IGRhdGEoICdzaW5UYWJsZScsIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSB0aGlzLnRhYmxlLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIHRoaXMudGFibGVbIGkgXSA9IE1hdGguc2luKCAoIGkgLyBsICkgKiAoIE1hdGguUEkgKiAyICkgKVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaWYoIHByb3RvLnRhYmxlID09PSBudWxsICkgcHJvdG8uaW5pdFRhYmxlKCkgXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBmcmVxdWVuY3ksXG4gICAgcmVzZXQsXG4gICAgdGFibGU6ICAgICAgcHJvdG8udGFibGUsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RhdGEnLFxuXG4gIGdlbigpIHtcbiAgICByZXR1cm4gJ2dlbi5kYXRhLicgKyB0aGlzLm5hbWVcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHVzZXJuYW1lLCBkaW09NTEyLCBjaGFubmVscz0xICkgPT4ge1xuICBsZXQgdWdlbiA9IG5ldyBGbG9hdDMyQXJyYXkoIGRpbSApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1c2VybmFtZSxcbiAgICBkaW0sXG4gICAgY2hhbm5lbHMsXG4gICAgZ2VuOiAgICAgICAgcHJvdG8uZ2VuXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSB1c2VybmFtZVxuXG4gIGdlbi5kYXRhWyB1Z2VuLm5hbWUgXSA9IHVnZW5cbiAgXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RlbHRhJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgbjEgICAgID0gaGlzdG9yeSgpXG4gICAgXG4gICAgbjEucmVjb3JkKCBpbnB1dHNbMF0gKS5nZW4oKVxuXG4gICAgcmV0dXJuIHN1YiggaW5wdXRzWzBdLCBuMSApLmdlbigpXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczpuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczpbXSxcbiAgZW5kQmxvY2s6IFtdLFxuXG4gIG1lbW86IHt9LFxuXG4gIGRhdGE6IHt9LFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5wdXNoKCAnICAnICsgdiApXG4gIH0sXG4gIFxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cbiAgXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuICkge1xuICAgIGxldCBjYWxsYmFjaywgZ3JhcGhPdXRwdXRcblxuICAgIHRoaXMubWVtbyA9IHt9XG4gICAgdGhpcy5lbmRCbG9jay5sZW5ndGggPSAwXG4gICAgdGhpcy5jbG9zdXJlcy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDBcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0JztcXG5cXG5cIlxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGdyYXBoT3V0cHV0ID0gdWdlbi5nZW4oKVxuXG4gICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgIC8vIGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW4uIElmIC5nZW4oKSBvbmx5IGdlbmVyYXRlcyBhIG51bWJlciAoZm9yIHJlYWxseSBzaW1wbGUgZ3JhcGhzKVxuICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gQXJyYXkuaXNBcnJheSggZ3JhcGhPdXRwdXQgKSA/IGdyYXBoT3V0cHV0WzFdICsgJ1xcbicgKyBncmFwaE91dHB1dFswXSA6IGdyYXBoT3V0cHV0XG5cbiAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKVxuICAgIFxuICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICBsZXQgbGFzdGlkeCA9IHRoaXMuZnVuY3Rpb25Cb2R5Lmxlbmd0aCAtIDFcblxuICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5WyBsYXN0aWR4IF0gPSAnICBsZXQgb3V0ID0gJyArIHRoaXMuZnVuY3Rpb25Cb2R5WyBsYXN0aWR4IF0gKyAnXFxuJ1xuICAgIFxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLmxlbmd0aCApIHsgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmNvbmNhdCggdGhpcy5lbmRCbG9jayApIFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggJ1xcbiAgcmV0dXJuIG91dCcgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggJyAgcmV0dXJuIG91dCcgKVxuICAgIH1cbiAgICAvLyByZWFzc2VtYmxlIGZ1bmN0aW9uIGJvZHlcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oICR7dGhpcy5wYXJhbWV0ZXJzLmpvaW4oJywnKX0gKXsgXFxuJHt0aGlzLmZ1bmN0aW9uQm9keX1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG4gICAgXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMuY2xvc3VyZXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIEdpdmVuIGFuIGFyZ3VtZW50IHVnZW4sIGV4dHJhY3QgaXRzIGlucHV0cy4gSWYgdGhleSBhcmUgbnVtYmVycywgcmV0dXJuIHRoZSBudW1lYnJzLiBJZlxuICAgKiB0aGV5IGFyZSB1Z2VucywgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICBsZXQgaW5wdXRzID0gdWdlbi5pbnB1dHMubWFwKCBpbnB1dCA9PiB7XG4gICAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgICBpZiggdGhpcy5tZW1vWyBpbnB1dC5uYW1lIF0gKSB7IC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgICB9ZWxzZXsgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGVcbiAgICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVswXVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ZWxzZXsgLy8gaXQgaW5wdXQgaXMgYSBudW1iZXJcbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBpbnB1dFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvY2Vzc2VkSW5wdXRcbiAgICB9KVxuXG4gICAgcmV0dXJuIGlucHV0c1xuICB9XG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyAwIF0sXG5cbiAgICByZWNvcmQoIHYgKSB7XG4gICAgICBsZXQgb2JqID0ge1xuICAgICAgICBnZW4oKSB7XG4gICAgICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHVnZW4gKVxuXG4gICAgICAgICAgZ2VuLmFkZFRvRW5kQmxvY2soICdnZW4uZGF0YS4nICsgdWdlbi5uYW1lICsgJyA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWyAwIF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlucHV0c1sgMCBdID0gdlxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcblxuICAgIGdlbigpIHsgcmV0dXJuICdnZW4uZGF0YS4nICsgdWdlbi5uYW1lIH0sXG5cbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgfVxuICBcbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknICsgdWdlbi51aWRcblxuICBnZW4uZGF0YVsgdWdlbi5uYW1lIF0gPSAwXG4gIFxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgT2JqZWN0LmFzc2lnbiggZGVzdGluYXRpb24sIGxpYnJhcnkgKVxuICAgIGRlc3RpbmF0aW9uLnNzZCA9IGxpYnJhcnkuaGlzdG9yeSAvLyBoaXN0b3J5IGlzIHdpbmRvdyBvYmplY3QgcHJvcGVydHksIHNvIHVzZSBzc2QgYXMgYWxpYXNcbiAgfSxcblxuICBnZW46ICAgIHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgXG4gIGFiczogICAgcmVxdWlyZSgnLi9hYnMuanMnKSxcbiAgcGFyYW06ICByZXF1aXJlKCcuL3BhcmFtLmpzJyksXG4gIGFkZDogICAgcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgc3ViOiAgICByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICBtdWw6ICAgIHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gIGFjY3VtOiAgcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICBzaW46ICAgIHJlcXVpcmUoJy4vc2luLmpzJyksXG4gIHBoYXNvcjogcmVxdWlyZSgnLi9waGFzb3IuanMnKSxcbiAgZGF0YTogICByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgcGVlazogICByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgY3ljbGU6ICByZXF1aXJlKCcuL2N5Y2xlLmpzJyksXG4gIGhpc3Rvcnk6cmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gIGRlbHRhOiAgcmVxdWlyZSgnLi9kZWx0YS5qcycpLFxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIHgseSApID0+IHtcbiAgbGV0IG11bCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgeCx5IF0sXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dFxuXG4gICAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgICAgb3V0ID0gIGAoJHtpbnB1dHNbMF19ICogJHtpbnB1dHNbMV19KWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgPSBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSAqIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG11bFxufVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncCcsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBsZXQgcGFyYW0gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcGFyYW0uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBwYXJhbS5uYW1lID0gYCR7cGFyYW0uYmFzZW5hbWV9JHtwYXJhbS5pZH1gXG5cbiAgcmV0dXJuIHBhcmFtXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5XG5cbmZ1bmN0aW9uQm9keSA9IGAgIGxldCAke3RoaXMubmFtZX1fZGF0YSAgPSBnZW4uZGF0YS4ke3RoaXMuZGF0YU5hbWV9LFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09IDAgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogZ2VuLmRhdGEuJyArIHRoaXMuZGF0YU5hbWUgKyAnLmxlbmd0aCd9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXG4gICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSAke3RoaXMubmFtZX1fZGF0YVsgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCAke3RoaXMubmFtZX1fZGF0YVsgKCR7dGhpcy5uYW1lfV9pbmRleCsxKSAmICgke3RoaXMubmFtZX1fZGF0YS5sZW5ndGggLSAxKSBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKSBcblxuYFxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhTmFtZSwgaW5kZXgsIGNoYW5uZWxzPTEsIG1vZGU9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApIFxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZGF0YU5hbWUsXG4gICAgY2hhbm5lbHMsXG4gICAgbW9kZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbmRleCBdLFxuICAgIHByb3BlcnRpZXM6IG51bGwsXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGhhc29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgcmV0dXJuIGFjY3VtKCBtdWwoIGlucHV0c1swXSwgMS80NDEwMCApLCBpbnB1dHNbMV0gKS5nZW4oKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGZyZXF1ZW5jeSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Npbic6IE1hdGguc2luIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2luLmlucHV0cyA9IFsgeCBdXG4gIHNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBzaW4ubmFtZSA9IGAke3Npbi5iYXNlbmFtZX17c2luLmlkfWBcblxuICByZXR1cm4gc2luXG59XG4iLCJsZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGxldCBzdWIgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIGRpZmYgPSAwLCBudW1Db3VudCA9IDAsIHN1YkF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGlzTmFOKCB2ICkgKSB7XG4gICAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgICBzdWJBdEVuZCA9IHRydWVcbiAgICAgICAgICAgIG91dCArPSAnIC0gJ1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlmZiArPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgICBudW1Db3VudCsrXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICAgIG91dCArPSBzdWJBdEVuZCA/IGRpZmYgOiAnIC0gJyArIGRpZmZcbiAgICAgIH1cbiAgICAgIFxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gc3ViXG59XG4iXX0=
