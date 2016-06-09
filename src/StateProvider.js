import Immutable from 'immutable';
import React from 'react';
import omit from 'lodash.omit';
import mapValues from 'lodash.mapvalues';
import formatSelector from './formatSelector';

const getDisplayName = component => component.displayName || component.name || 'Component';

const isReactComponent = component =>
  !!(component && component.prototype && component.prototype.isReactContainer);

/**
 * The StateProvider class includes everything that the provideState function uses, scoped to a
 * single redux store + mount point.
 *
 * With no `mountPoint` specified, your entire store state should be an Immutable.JS collection.
 * When `mountPoint` is specified, we assume that your store state is a plain JS object, but that
 * that key refers to an Immutable.JS collection.
 * @param {Redux.Store} store - the redux store you want to use the state of
 * @param {string} [mountPoint] - the key under the redux store you wish to use.
 * @example
 * import { StateProvider } from 'provide-state';
 * const stateProvider = new StateProvider(store, 'immutableMountPoint');
 *
 * function MyComponent({ name }) {
 *   return <span>User: {name}</span>;
 * }
 *
 * export default stateProvider.provideState(MyComponent, {
 *   within: ({ userId }) => ['users', userId],
 *   bindings: {
 *     name: 'name',
 *   },
 * });
 */
export default class StateProvider {
  constructor(store, mountPoint = null) {
    this.store = store;
    this.mountPoint = mountPoint;
  }

  /**
   * Get the immutable collection from the store backing this StateProvider, using the `mountPoint`
   * if specified
   * @returns {Immutable.Collection}
   * @alias StateProvider.getState
   */
  getState() {
    return this.mountPoint
      ? this.store.getState()[this.mountPoint]
      : this.store.getState();
  }

  /**
   * Select props from store using a selectors object
   * @param {Object} selectors - an object of prop names to selector paths
   * @param {(string|Array|Immutable.Iterable)} selectors.$name
   * @returns {{ $name: any }} an object mapping the keys from `selectors` to values from the store
   * @example
   * stateProvider.selectFromStore({
   *   name: 'user.name',
   *   gender: ['user', 'gender'],
   * });
   * // > { name: 'Salsa', gender: 'Spiders' }
   * @alias StateProvider.selectFromStore
   */
  selectFromStore(selectors) {
    const state = this.getState();
    return Immutable.Map(selectors).map(selector => state.getIn(formatSelector(selector)));
  }

  /**
   * Observe a set of selectors as the store changes
   * @param resolveSubscriptions {Function} - a function returning a set of selectors that can be
   * passed to StateProvider.selectFromStore
   * @param onChange {Function} - called with the new values whenever they change. Although this
   * uses `Redux.Store.subscribe` to handleChanges under the hood, onChange will only be called if
   * the resolved values are different from their state in the previous store.
   * @returns {Function} The unsubscribe function
   * @alias StateProvider.observe
   */
  observe(resolveSubscriptions, onChange) {
    let currentState = Immutable.Map();

    const handleChange = () => {
      const nextState = this.selectFromStore(resolveSubscriptions());

      if (!currentState.equals(nextState)) {
        currentState = nextState;
        onChange(nextState);
      }
    };

    handleChange();
    return this.store.subscribe(handleChange);
  }

  /**
   * A higher-order react component that provides state props into the wrapped component
   * @param {React.Component} Component - the Component to wrap
   * @param {Object} [options = {}] - options detailing which props to provide and how to resolve
   * them
   * @param {Object} [options.bindings = {}] - an object mapping prop names to selectors for the
   * store. When a function is provided, it will be called with props and should return a selector.
   * @param {(string|Array|Immutable.Iterable|Function)} [options.within = []] - Optionally scope
   * all `bindings` to be beneath this selector
   * @param {Object} [options.actions = {}] - An object mapping prop names to functions that return
   * redux actions to be dispatched when they are called
   * @returns {React.Component} The wrapped component
   * @alias StateProvider.provideState
   */
  provideState(Component, options = {}) {
    const { bindings = {}, actions = {}, within = [] } = options;
    const stateProvider = this;
    const ref = isReactComponent(Component) ? 'component' : undefined;

    const Wrapped = class extends React.Component {
      constructor() {
        super();
        this.resolveSubscriptions = this.resolveSubscriptions.bind(this);
      }

      componentDidMount() {
        this.unsubscribe = stateProvider.observe(this.resolveSubscriptions, () =>
          this.forceUpdate());
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      getResolvedProps() {
        return {
          ref,
          ...omit(this.props, ['children']),
          ...stateProvider.selectFromStore(this.resolveSubscriptions()).toJS(),
        };
      }

      resolveBinding(binding) {
        return formatSelector(typeof binding === 'function'
          ? binding(this.props)
          : binding);
      }

      resolveSubscriptions() {
        const scope = this.resolveBinding(within);
        return mapValues(bindings, binding => scope.concat(this.resolveBinding(binding)));
      }

      render() {
        return React.createElement(Component, this.getResolvedProps(), this.props.children);
      }
    };

    Wrapped.propTypes = {
      children: React.PropTypes.node,
    };

    Wrapped.displayName = `ProvideState(${getDisplayName(Component)})`;
  }
}
