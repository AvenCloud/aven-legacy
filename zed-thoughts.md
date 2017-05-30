## Behavior of zed

### Generators
create zed primitives

### validate(inputZData, docs, ?expectedType)

- typecheck the input tree
    - input data must be primitive or an object with 'type'
    - type must be hardcoded, or softcoded into docs
    - if type is missing, return validation error
    - run validation, pass down expectedType

- takes checksum of the tree and tag it if not already valid
- internally cache checksum and reference equality of inputZData so validation will be fast next time

### compute(inputZData, docs)

- validates the input
- has sync access to docs in the docs context object
- outputs: zData, computed down based on available knowledge. json based on available knowledge. list of docs to fetch

## Behavior of the store

### watch(docName, cb)
- provide a handler that will be called when the doc is initially known and when it changes.
- watch returns an object with `.unwatch()` that will stop the subscription

### setDoc(docName, newDoc, cb)

- validate the new doc, including the previous doc id. 
- publish the new doc at the name and at the 


## Behavior of the component connector

Provides 'props.docs' to the wrapped component, an active snapshot of the docs that the component is watching.

Gives the component `props.setDoc` to mutate a doc by its name