/**
 * A minimal way of providing redux state to react components that doesn't use context
 *
 * Installation: `npm install react-relax`
 *
 * @module react-relax
 * @license MIT
 */

import StateProvider from './StateProvider';
import formatSelector from './formatSelector';
import joinSelectors from './joinSelectors';

export { StateProvider, formatSelector, joinSelectors };

/**
 * An instance of StateProvider for convenience
 * @see StateProvider
 * @example
 * import { globalStateProvider } from 'react-relax';
 */
export const globalStateProvider = new StateProvider();

/**
 * Set the store and mount point for the default global StateProvider
 * @function setStore
 * @param {Redux.Store} store
 * @param {string} [mountPoint]
 * @see StateProvider
 * @example
 * import { setStore } from 'react-relax';
 * setStore(reduxStore, 'myFancyMountPoint');
 */
export const setStore = (store, mountPoint) => {
  globalStateProvider.store = store;
  globalStateProvider.mountPoint = mountPoint;
};

/**
 * The globalStateProvider selectFromStore method
 * @function selectFromStore
 * @see StateProvider.selectFromStore
 * @see globalStateProvider
 * @example
 * import { selectFromStore } from 'react-relax';
 * selectFromStore({ language: 'viewer.language', name: 'user.name' });
 * // > { language: 'en', name: 'Apathy Hives' };
 */
export const selectFromStore = globalStateProvider.selectFromStore.bind(globalStateProvider);

/**
 * The globalStateProvider observe method
 * @function observe
 * @see StateProvider.observe
 * @see globalStateProvider
 * @example
 * import { observe } from 'react-relax';
 * const unsubscribe = observe(() => ({ stock: ['product', id, 'stockLevel'] }), ({ stock }) => {
 *   alert(`Stock level changed: ${stock}`);
 * });
 *
 * // Later:
 * unsubscribe();
 */
export const observe = globalStateProvider.observe.bind(globalStateProvider);

/**
 * The globalStateProvider provideState higher order component
 * @function provideState
 * @see StateProvider.provideState
 * @see globalStateProvider
 * @example
 * import provideState from 'react-relax';
 * function MyComponent({ userName, onChange }) {
 *   return (
 *     <label>
 *       Update username for {userId}: <input type="text" value={userName} onChange={onChange} />
 *     </label>
 *   );
 * }
 *
 * const WrappedComponent = provideState(MyComponent, {
 *   within: (props) => ['users', props.userId],
 *   bindings: {
 *     userName: ['info.name'],
 *   },
 *   actions: {
 *     onChange: (event, props) => ({
 *       type: 'UPDATE_USER_NAME',
 *       userId: props.userId,
 *       name: event.target.value,
 *     }),
 *   },
 * });
 *
 * React.render(<WrappedComponent userId="123" />);
 */
export default globalStateProvider.provideState.bind(globalStateProvider);
