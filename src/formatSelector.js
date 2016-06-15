import Immutable from 'immutable';

/**
 * Normalize a selector into an array or immutable iterable
 * @param {(string|Array|Immutable.Iterable)} selector - The selector to normalise. If a string,
 * sections should be seperated by dots.
 * @returns {Immutable.Iterable} The exploded path for this selector
 * @example
 * import { formatSelector } from 'react-relax';
 * formatSelector('todos.0.name');
 * // > List('todos', '0', 'name');
 * formatSelector(['icecreams', 'chocolate'])
 * // > List('icecreams', 'chocolate')
 */
export default function formatSelector(selector) {
  if (typeof selector === 'string') return Immutable.List(selector.split('.'));
  if (Array.isArray(selector)) return Immutable.List(selector);
  if (Immutable.Iterable.isIterable(selector)) return selector;
  throw new TypeError(`Bad selector ${selector} - selector must be iterable or string`);
}
