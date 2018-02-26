## Actions

### AuthRegister

* userID
* email
* displayName
* password

### AuthVerify

* code
* authID
* userID

### AuthLogin

* userID
* password

### AuthLogout

* authSession

GetPermissionAction
SetPermissionAction
GetSessionAction

### GetDoc

* authUser
* authSession
* docID
* recordID

### GetRecord

* authUser
* authSession
* recordID

### SetRecord

* authUser
* authSession
* recordID
* docID
* permission


### CreateDoc

* authUser
* authSession
* value
* docID
* recordID


### GetPermission

* authUser
* authSession
* recordID

returns {
    userID
    recordID
    canRead
    canWrite
    canAdmin
    canExecute


### SetPermission

* authUser
* authSession
* recordID
* userID
* permission


### GetSession

* authUser
* authSession

returns {authUser, authSession}