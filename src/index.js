import Immutable from 'immutable';
import React from 'react';
import omit from 'lodash.omit';
import mapValues from 'lodash.mapvalues';

export const formatSelector = selector => {
  if (typeof selector === 'string') return selector.split('.');
  if (Immutable.Iterable.isIterable(selector) || Array.isArray(selector)) return selector;
  throw new TypeError(`Bad selector ${selector} - selector must be iterable or string`);
};

const getDisplayName = component => component.displayName || component.name || 'Component';

const isReactComponent = component =>
  !!(component && component.prototype && component.prototype.isReactContainer);

export class StateProvider {
  constructor(store, mountPoint) {
    this.store = store;
    this.mountPoint = mountPoint;
  }

  getState() {
    return this.mountPoint
      ? this.store.getState()[this.mountPoint]
      : this.store.getState();
  }

  selectFromStore(selectors) {
    const state = this.getState();
    return Immutable.Map(selectors).map(selector => state.getIn(formatSelector(selector)));
  }

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

  provideState(Component, { bindings = {}, within = [] } = {}) {
    const stateProvider = this;
    const ref = isReactComponent(Component) ? 'component' : undefined;

    return class extends React.Component {
      static propTypes = {
        children: React.PropTypes.node,
      };

      static displayName = `ProvideState(${getDisplayName(Component)})`;

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

      resolveBinding = binding =>
        formatSelector(typeof binding === 'function'
          ? binding(this.props)
          : binding);

      resolveSubscriptions = () => {
        const scope = this.resolveBinding(within);
        return mapValues(bindings, binding => scope.concat(this.resolveBinding(binding)));
      }

      render() {
        return React.createElement(Component, this.getResolvedProps(), this.props.children);
      }
    };
  }
}

export const globalStateProvider = new StateProvider();

export const setStore = (store, mountPoint) => {
  globalStateProvider.store = store;
  globalStateProvider.mountPoint = mountPoint;
};

export const selectFromStore = globalStateProvider.selectFromStore.bind(globalStateProvider);
export const observe = globalStateProvider.observe.bind(globalStateProvider);
export default globalStateProvider.provideState.bind(globalStateProvider);
