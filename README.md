<a name="module_provide-state"></a>

## provide-state
Provide State

**License**: MIT  
<a name="module_provide-state.formatSelector"></a>

### provide-state.formatSelector ⇒ <code>Immutable.Iterable</code>
Normalize a selector into an array or immutable iterable

**Kind**: static constant of <code>[provide-state](#module_provide-state)</code>  
**Returns**: <code>Immutable.Iterable</code> - - The exploded path for this selector  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> &#124; <code>Array</code> &#124; <code>Immutable.Iterable</code> | The selector to normalise. If a string, sections should be seperated by dots. |

**Example**  
```js
formatSelector('todos.0.name');
// > List('todos', '0', 'name');
formatSelector(['icecreams', 'chocolate'])
// > List('icecreams', 'chocolate')
```
