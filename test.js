'use strict'

/* global require, describe, it */
var translate = require('./index')
var expect = require('expect.js')

describe('translate.js', function () {
  var translationsObject = {
    plain: 'I like this.',
    like: 'I like {thing}!',
    simpleCounter: 'The count is {n}.',
    hits: {
      0: 'No Hits',
      1: '{n} Hit',
      2: '{n} Hitse', // some slavic langs have multiple plural forms
      3: '{n} Hitses', // some slavic langs have multiple plural forms
      n: '{n} Hits' // default
    },
    icelandicSheep: {
      0: 'Engar kindur',
      s: '{n} kind', // some languages use singular for any number that ends with 1 (i.e. 101, 21, 31, 51)
      p: '{n} kindur',
      13: 'Baaahd luck!' // Aribtrary translation outside of pluralization rules
    },
    horses: {
      n: 'Pluralization keys are missing' // default fallback
    },
    date: {
      1: '{day}. January {year}',
      2: '{day}. February {year}',
      3: '{day}. March {year}',
      4: '{day}. April {year}',
      5: '{day}. May {year}',
      6: '{day}. June {year}',
      7: '{day}. July {year}',
      8: '{day}. August {year}',
      9: '{day}. September {year}',
      10: '{day}. October {year}',
      11: '{day}. November {year}',
      12: '{day}. December {year}'
    },

    'Prosa Key': 'This is prosa!',

    'comboCounter': '{name} is {n} years old.'
  }

  var t = translate(translationsObject)

  it('should return translationKey if no translation is found', function () {
    expect(t('nonexistentkey')).to.equal('nonexistentkey')
  })

  it('should return a translated string', function () {
    expect(t('plain')).to.equal('I like this.')
  })

  it('should return a translated string for prosa keys', function () {
    expect(t('Prosa Key')).to.equal('This is prosa!')
  })

  it('should return a translated string and replace a placeholder ', function () {
    expect(t('like', {thing: 'Sun'})).to.equal('I like Sun!')
  })

  it('should return a translated string and show missing placeholders', function () {
    expect(t('like')).to.equal('I like {thing}!')
  })

  it('should return a translated string and replace a count', function () {
    expect(t('simpleCounter', 25)).to.equal('The count is 25.')
  })

  it('should return a translated string with the correct plural form (0)', function () {
    expect(t('hits', 0)).to.equal('No Hits')
  })

  it('should return a translated string with the correct plural form (1)', function () {
    expect(t('hits', 1)).to.equal('1 Hit')
  })

  it('should return a translated string with the correct plural form (2)', function () {
    expect(t('hits', 2)).to.equal('2 Hitse')
  })

  it('should return a translated string with the correct plural form (3)', function () {
    expect(t('hits', 3)).to.equal('3 Hitses')
  })

  it('should return a translated string with the correct plural form (4)', function () {
    expect(t('hits', 4)).to.equal('4 Hits')
  })

  it('should return a translated string with the correct plural form and replaced placeholders: t(key, replacements, count)', function () {
    expect(t('date', {day: '13', year: 2014}, 2)).to.equal('13. February 2014')
  })

  it('should return a translated string with the correct plural form and replaced placeholders: t(key, count, replacements)', function () {
    expect(t('date', 2, {day: '13', year: 2014})).to.equal('13. February 2014')
  })

  var placeholders = { name: 'Alice' }
  it('should handle combination of count and named placeholders', function () {
    expect(t('comboCounter', 10, placeholders)).to.equal('Alice is 10 years old.')
    expect(t('comboCounter', placeholders, 10)).to.equal('Alice is 10 years old.')
  })
  it("shouldn't modify the placeholder object", function () {
    expect('n' in placeholders).to.equal(false)
  })

  var notringtranslatio = {
    foo: 10,
    bar: [],
    baz: {},
    heh: null,
    ooh: true,
    happeToBeString: 'OK'
  }
  var t0 = translate(notringtranslatio)
  it('should treat any non-string translatio as missing', function () {
    expect(t0('foo')).to.equal('foo')
    expect(t0('bar')).to.equal('bar')
    expect(t0('baz')).to.equal('baz')
    expect(t0('heh')).to.equal('heh')
    expect(t0('ooh')).to.equal('ooh')
    expect(t0('happeToBeString')).to.equal('OK')
  })

  // custom isPlural function
  var pluralize_IS = function (n /*, tarlationKey*/) {
    // Icelandic rules: Numbers ending in 1 are singular - unless ending in 11.
    return (n % 10 !== 1 || n % 100 === 11) ? 'p' : 's'
  }
  var t3b = translate(translationsObject, { pluralize: pluralize_IS })
  it('should pluralize (0) correctly in Icelandic', function () {
    expect(t3b('icelandicSheep', 0)).to.equal('Engar kindur')
  })
  it('should pluralize (1) correctly in Icelandic', function () {
    expect(t3b('icelandicSheep', 1)).to.equal('1 kind')
  })
  it('should pluralize (2) correctly in Icelandic', function () {
    expect(t3b('icelandicSheep', 2)).to.equal('2 kindur')
  })
  it('should pluralize (11) correctly in Icelandic', function () {
    expect(t3b('icelandicSheep', 11)).to.equal('11 kindur')
  })
  it('should pluralize (21) correctly in Icelandic', function () {
    expect(t3b('icelandicSheep', 21)).to.equal('21 kind')
  })
  it('should pluralize (29) correctly in Icelandic', function () {
    expect(t3b('icelandicSheep', 29)).to.equal('29 kindur')
  })
  it('should return explicit pluralization property regardless of pluralization function', function () {
    expect(t5('icelandicSheep', 13)).to.equal('Baaahd luck!')
  })
  it('should automatically return correct pluralization for negative counts', function () {
    expect(t5('icelandicSheep', -13)).to.equal('Baaahd luck!')
  })
  it('should default to the `n` key if some/all pluralization keys are missing', function () {
    expect(t5('horses', 7)).to.equal('Pluralization keys are missing')
  })

  // wrong arguments
  var t4 = translate(translationsObject, 'asd')
  it('should return a translated string with the correct plural form and replaced placeholders: t(key, count, replacements) [wrong optio arg]', function () {
    expect(t4('date', 2, {day: '13', year: 2014})).to.equal('13. February 2014')
  })

  // debug enabled
  var t5 = translate(translationsObject, {debug: true})
  it('should return @@translationKey@@ if no translation is found and debug is true', function () {
    expect(t5('nonexistentkey')).to.equal('@@nonexistentkey@@')
  })

  var t6Keys = {
    fruit: '{0} apples, {1} oranges, {2} kiwis',
    bread: '{0} buns, {n} scones',
    items: {
      1: '{0} item ({n})',
      n: '{0} items ({n})'
    }
  }
  var t6 = translate(t6Keys)
  it('should accept placeholder values in arrays', function () {
    expect(t6('fruit', ['shiny', 'round'])).to.equal('shiny apples, round oranges, {2} kiwis')
  })
  it('should mix count and array placeholders', function () {
    expect(t6('bread', 7, [10])).to.equal('10 buns, 7 scones')
    expect(t6('bread', [7], 10)).to.equal('7 buns, 10 scones')
  })
  it('should mix array placeholders and pluralization', function () {
    expect(t6('items', 1, ['Happy'])).to.equal('Happy item (1)')
    expect(t6('items', 7, ['Funny'])).to.equal('Funny items (7)')
  })

  var tXKeys = {
    name: 'English',
    x: {
      13: 'Thirteen',
      99: 'Ninety-nine',
      n: 'Default'
    }
  }
  var tX

  it('should gracefully handle no parameters', function () {
    tX = translate()
    expect(tX('name')).to.equal('name')
    expect(tX('x', 1)).to.equal('x')
  })

  it('should gracefully handle nully (not falsey) parameters', function () {
    tX = translate(undefined, null)
    expect(tX('name')).to.equal('name')
    expect(tX('x', 1)).to.equal('x')
  })

  it('should expose .keys and .opts properties', function () {
    expect(tX.keys).to.be.an('object')
    expect(tX.opts).to.be.an('object')
    expect(tX.keys).to.eql({})
  })

  it('should allow late binding of translation keys', function () {
    tX.keys.foo = 'bar'
    expect(tX('foo')).to.equal('bar')
  })

  it('should allow late binding of translation keys', function () {
    tX.keys = tXKeys
    expect(tX('foo')).to.equal('foo')
    expect(tX('name')).to.equal('English')
    expect(tX('x', 1)).to.equal('Default')
  })

  it('should allow late binding of pluralization', function () {
    tX.opts.pluralize = function (n) { return 99 }
    expect(tX('x', 1)).to.equal('Ninety-nine')
  })

  it('should gracefully handle completely overloading the opts', function () {
    tX.opts = {pluralize: function (n) { return 13 }}
    expect(tX('x', 1)).to.equal('Thirteen')
  })

  it('should gracefully handle accidental removal of opts', function () {
    delete tX.opts // Oops!
    expect(tX('x', 1)).to.equal('Default') // no pluralization found
  })

  it('should handle adjacent placeholders', function () {
    var t = translate({ test: '{foo}{bar}' })
    expect(t('test', {foo: 'Hello', bar: 'World'})).to.equal('HelloWorld')
  })

  it('should handle the placeholder tokens used internally by `replacePlaceholders()`', function () {
    var t = translate({ test: '{x}' })
    expect(t('test', { x: 'HelloWorld' })).to.equal('HelloWorld')
  })
})

describe('Return array option', function () {
  it('should return replacement-token translations as Arrays, when t.arr() is called', function () {
    var t = translate({
      test: 'abc {xyz} def'
    })
    expect(t.arr('test', { xyz: { foo: 'bar' } })).to.eql(['abc ', { foo: 'bar' }, ' def'])
  })
  it('should return replacement-token translations as Arrays, when `array` option is supplied', function () {
    var t = translate({
      test: 'abc {xyz} def'
    }, { array:true })
    expect(t('test', { xyz: { foo: 'bar' } })).to.eql(['abc ', { foo: 'bar' }, ' def'])
  })
})
