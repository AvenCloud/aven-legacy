
### Docs

Docs are immutable JavaScript objects which can be uploaded into the data store.

They are content addressable, so the ID can be determined by the client or the server by checksumming the data.

### Records

A record is a mutable reference to a doc, which include privacy and permission information.

In order to track ownership of the docs, each doc must be associated with a record.


### Record Permissions

You can set the permission that a user will have on a certain record.

Records can be namespaced, which means that one permission on a parent record can provide that user access to all the records under that namespace.