/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const obj = [];
  obj.width = width;
  obj.height = height;
  obj.getArea = () => obj.height * obj.width;
  return obj;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const data = Object.create(proto);
  const obj = JSON.parse(json);
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  keys.forEach((el, i) => {
    data[el] = values[i];
  });
  return data;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class Builder {
  constructor(value, name) {
    this.value = value;
    this.arr = [];
    this.elementCount = false;
    this.idCount = false;
    this.pseudoElementCount = false;
    switch (name) {
      case 'element': this.element(value); break;
      case 'id': this.id(value); break;
      case 'class': this.class(value); break;
      case 'attr': this.attr(value); break;
      case 'pseudoClass': this.pseudoClass(value); break;
      case 'pseudoElement': this.pseudoElement(value); break;
      default: this.stringify();
    }
  }

  element(value) {
    this.checkRepeats(this.elementCount);
    this.elementCount = true;
    this.checkOrder(['#', '.', '[', ':', '::']);
    this.arr.push(value);
    return this;
  }

  id(value) {
    this.checkRepeats(this.idCount);
    this.idCount = true;
    this.checkOrder(['.', '[', ':', '::']);
    const val = `#${value}`;
    this.arr.push(val);
    return this;
  }

  class(value) {
    this.checkOrder(['[', ':', '::']);
    const val = `.${value}`;
    this.arr.push(val);
    return this;
  }

  attr(value) {
    this.checkOrder([':', '::']);
    const val = `[${value}]`;
    this.arr.push(val);
    return this;
  }

  pseudoClass(value) {
    this.checkOrder(['::']);
    const val = `:${value}`;
    this.arr.push(val);
    return this;
  }

  pseudoElement(value) {
    this.checkRepeats(this.pseudoElementCount);
    this.pseudoElementCount = true;
    const val = `::${value}`;
    this.arr.push(val);
    return this;
  }

  checkRepeats(selector) {
    this.value = 5;
    if (selector) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  checkOrder(selectors) {
    for (let i = 0; i < selectors.length; i += 1) {
      if (this.stringify().includes(selectors[i])) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
    }
  }

  stringify() {
    return this.arr.join('');
  }
}

const cssSelectorBuilder = {
  arr: [],
  element(value) {
    return new Builder(value, 'element');
  },

  id(value) {
    return new Builder(value, 'id');
  },

  class(value) {
    return new Builder(value, 'class');
  },

  attr(value) {
    return new Builder(value, 'attr');
  },

  pseudoClass(value) {
    return new Builder(value, 'pseudoClass');
  },

  pseudoElement(value) {
    return new Builder(value, 'pseudoElement');
  },

  combine(selector1, combinator, selector2) {
    this.str = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  },

  stringify() {
    return this.str;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
