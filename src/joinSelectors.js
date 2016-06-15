import Immutable from 'immutable';
import formatSelector from './formatSelector';

/**
 * Join several selectors into one selector
 * @param {...(string|Array|Immutable.Iterable)} selectors - the selectors to join
 * @returns Immutable.List
 * @example
 * import { joinSelectors } from 'react-relax';
 * joinSelectors('a.b', ['c', 'd'], List(['e', 'f']));
 * // > List('a', 'b', 'c', 'd', 'e', 'f')
 */
export default function joinSelectors(...selectors) {
  return Immutable.List(selectors)
    .map(formatSelector)
    .flatten(true);
}
