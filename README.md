# react-relax

A minimal way of providing redux state to react components that doesn't use context

Installation: `npm install react-relax`

**Meta**

-   **license**: MIT

# globalStateProvider

An instance of StateProvider for convenience

**Examples**

```javascript
import { globalStateProvider } from 'react-relax';
```

# setStore

Set the store and mount point for the default global StateProvider

**Parameters**

-   `store` **Redux.Store** 
-   `mountPoint` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 

**Examples**

```javascript
import { setStore } from 'react-relax';
setStore(reduxStore, 'myFancyMountPoint');
```

# selectFromStore

The globalStateProvider selectFromStore method

**Examples**

```javascript
import { selectFromStore } from 'react-relax';
selectFromStore({ language: 'viewer.language', name: 'user.name' });
// > { language: 'en', name: 'Apathy Hives' };
```

# observe

The globalStateProvider observe method

**Examples**

```javascript
import { observe } from 'react-relax';
const unsubscribe = observe(() => ({ stock: ['product', id, 'stockLevel'] }), ({ stock }) => {
  alert(`Stock level changed: ${stock}`);
});

// Later:
unsubscribe();
```

# provideState

The globalStateProvider provideState higher order component

**Examples**

```javascript
import provideState from 'react-relax';
function MyComponent({ userName, onChange }) {
  return (
    <label>
      Update username for {userId}: <input type="text" value={userName} onChange={onChange} />
    </label>
  );
}

const WrappedComponent = provideState(MyComponent, {
  within: (props) => ['users', props.userId],
  bindings: {
    userName: ['info.name'],
  },
  actions: {
    onChange: (event, props) => ({
      type: 'UPDATE_USER_NAME',
      userId: props.userId,
      name: event.target.value,
    }),
  },
});

React.render(<WrappedComponent userId="123" />);
```

# StateProvider

The StateProvider class includes everything that the provideState function uses, scoped to a
single redux store + mount point.

With no `mountPoint` specified, your entire store state should be an Immutable.JS collection.
When `mountPoint` is specified, we assume that your store state is a plain JS object, but that
that key refers to an Immutable.JS collection.

**Parameters**

-   `store` **Redux.Store** the redux store you want to use the state of
-   `mountPoint` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** the key under the redux store you wish to use.

**Examples**

```javascript
import { StateProvider } from 'react-relax';
const stateProvider = new StateProvider(store, 'immutableMountPoint');

function MyComponent({ name }) {
  return <span>User: {name}</span>;
}

export default stateProvider.provideState(MyComponent, {
  within: ({ userId }) => ['users', userId],
  bindings: {
    name: 'name',
  },
});
```

## StateProvider.getState

Get the immutable collection from the store backing this StateProvider, using the `mountPoint`
if specified

Returns **Immutable.Collection** 

## StateProvider.selectFromStore

Select props from store using a selectors object

**Parameters**

-   `selectors` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an object of prop names to selector paths
    -   `selectors.$name` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) | Immutable.Iterable)** 

**Examples**

```javascript
stateProvider.selectFromStore({
  name: 'user.name',
  gender: ['user', 'gender'],
});
// > { name: 'Salsa', gender: 'Spiders' }
```

Returns **{$name: any}** an object mapping the keys from `selectors` to values from the store

## StateProvider.observe

Observe a set of selectors as the store changes

**Parameters**

-   `resolveSubscriptions`  {Function} - a function returning a set of selectors that can be
    passed to StateProvider.selectFromStore
-   `onChange`  {Function} - called with the new values whenever they change. Although this
    uses `Redux.Store.subscribe` to handleChanges under the hood, onChange will only be called if
    the resolved values are different from their state in the previous store.

Returns **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The unsubscribe function

## StateProvider.provideState

A higher-order react component that provides state props into the wrapped component

**Parameters**

-   `Component` **React.Component** the Component to wrap
-   `options` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** options detailing which props to provide and how to resolve
    them (optional, default `{}`)
    -   `options.bindings` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** an object mapping prop names to selectors for the
        store. When a function is provided, it will be called with props and should return a selector. (optional, default `{}`)
    -   `options.within` **\[([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) | Immutable.Iterable | [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))]** Optionally scope
        all `bindings` to be beneath this selector (optional, default `[]`)
    -   `options.actions` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** An object mapping prop names to functions that return
        redux actions to be dispatched when they are called (optional, default `{}`)

Returns **React.Component** The wrapped component

# formatSelector

Normalize a selector into an array or immutable iterable

**Parameters**

-   `selector` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) | Immutable.Iterable)** The selector to normalise. If a string,
    sections should be seperated by dots.

**Examples**

```javascript
import { formatSelector } from 'react-relax';
formatSelector('todos.0.name');
// > List('todos', '0', 'name');
formatSelector(['icecreams', 'chocolate'])
// > List('icecreams', 'chocolate')
```

Returns **Immutable.Iterable** The exploded path for this selector

# joinSelectors

Join several selectors into one selector

**Parameters**

-   `selectors` **...([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) | Immutable.Iterable)** the selectors to join

**Examples**

```javascript
import { joinSelectors } from 'react-relax';
joinSelectors('a.b', ['c', 'd'], List(['e', 'f']));
// > List('a', 'b', 'c', 'd', 'e', 'f')
```

Returns **Any** Immutable.List
