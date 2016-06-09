/**
 * A minimal way of providing redux state to react components that doesn't use context
 *
 * Installation: `npm install provide-state`
 *
 * @module provideState
 * @license MIT
 */

import formatSelector from './formatSelector';
import StateProvider from './StateProvider';

export { formatSelector, StateProvider };

/**
 * An instance of StateProvider for convenience
 * @see StateProvider
 * @example
 * import { globalStateProvider } from 'provide-state';
 */
export const globalStateProvider = new StateProvider();

/**
 * Set the store and mount point for the default global StateProvider
 * @function setStore
 * @param {Redux.Store} store
 * @param {string} [mountPoint]
 * @see StateProvider
 * @example
 * import { setStore } from 'provide-state';
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
 * import { selectFromStore } from 'provide-state';
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
 * import { observe } from 'provide-state';
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
 * import provideState from 'provide-state';
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
 *     onChange: (props, event) => ({
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
