import React from "react";
import {
  ActivityIndicator,
  Text,
  View,
  Alert,
  AlertIOS,
  Button,
  Switch,
  AsyncStorage,
  TextInput,
  ScrollView
} from "react-native";
import { StackNavigator } from "react-navigation";

// const HOST = "https://aven.io";
const HOST = "http://localhost:5000";

class LoggedOutHome extends React.Component {
  render() {
    return (
      <View>
        <Button
          title="Login"
          onPress={() => {
            this.props.navigation.navigate("Login");
          }}
        />
        <Text>Welcome!</Text>
      </View>
    );
  }
}

class SimpleLoader extends React.Component {
  render() {
    return <Text>Loading...</Text>;
  }
}

class AccountLoader extends React.Component {
  state = null;
  componentDidMount() {
    Store.getAndListen("Account", this._setAccount);
  }
  _setAccount = account => {
    this.setState({ account });
  };
  componentWillUnmount() {
    Store.unlisten("Account", this._setAccount);
  }
  render() {
    const { state } = this;
    if (!state && !this.props.handlesLoading) return <SimpleLoader />;
    return this.props.render(state.account);
  }
}

class ProjectLoader extends React.Component {
  state = null;
  componentDidMount() {
    this._localId = `Project_${this.props.projectId}`;
    Store.getAndListen(this._localId, this._setProject);
  }
  _setProject = project => {
    this.setState({ project });
  };
  componentWillUnmount() {
    this._localId && Store.unlisten(this._localId, this._setProject);
  }
  render() {
    const { state } = this;
    if (!state && !this.props.handlesLoading) return <SimpleLoader />;
    return this.props.render(state.project);
  }
}

class DocLoader extends React.Component {
  state = this.props.id ? null : { doc: this.props.defaultDoc };
  componentDidMount() {
    if (this.props.id) {
      this._localId = `Document_${this.props.projectId}_${this.props.id}`;
      Store.getAndListen(this._localId, this._setDoc);
      return;
    }
  }
  _setDoc = doc => {
    this.setState({ doc });
  };
  componentWillUnmount() {
    this._localId && Store.unlisten(this._localId, this._setProject);
  }
  render() {
    const { state } = this;
    if (!state && !this.props.handlesLoading) return <SimpleLoader />;
    return this.props.render(state.doc);
  }
}

class MyProjectList extends React.Component {
  render() {
    const { projects } = this.props.account;
    if (!this.props.session) {
      return null;
    }
    return (
      <View>
        {Object.keys(projects).map(projectName => {
          return (
            <Button
              key={projectName}
              title={`${projectName} - ${projects[projectName].isPublic
                ? "Public"
                : "Private"}`}
              onPress={() => {
                this.props.navigation.navigate("Project", {
                  projectId: `${this.props.session.username}/${projectName}`
                });
              }}
            />
          );
        })}
        <Button
          color="#22dd22"
          title="New Project"
          onPress={() => {
            this.props.navigation.navigate("NewProject", {
              username: this.props.session.username
            });
          }}
        />
      </View>
    );
  }
}

class LoggedInHome extends React.Component {
  render() {
    return (
      <ScrollView>
        <Button
          title="Logout"
          onPress={() => {
            Store.logout();
          }}
        />
        <Text>Hello, {this.props.session.username}!</Text>
        <Text>Logged in on {this.props.session.host}</Text>
        <AccountLoader
          render={account => (
            <View>
              {account && (
                <MyProjectList
                  account={account}
                  session={this.props.session}
                  navigation={this.props.navigation}
                />
              )}
            </View>
          )}
        />
      </ScrollView>
    );
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: "Welcome"
  };
  state = null;
  componentDidMount() {
    Store.getAndListen("Session", this._setSession);
  }
  _setSession = session => {
    this.setState({ session });
  };
  render() {
    const state = this.state;
    const { navigation } = this.props;
    if (!state) {
      return null;
    }
    if (state.session) {
      return <LoggedInHome session={state.session} navigation={navigation} />;
    } else {
      return <LoggedOutHome navigation={navigation} />;
    }
  }
}

let ws = null;
let wsIsReady = false;

const onWsOpen = () => {
  console.log(
    "Connection Open. TODO- send list of currently subscribed projects"
  );
  wsIsReady = true;
  queuedWsMessages.map(sendWs);
  queuedWsMessages = [];
};

const onWsMessage = async e => {
  const msgParts = e.data.split("_");
  const type = msgParts[0];
  const name = msgParts[1];
  const value = msgParts[2];
  switch (type) {
    case "PublishAccount":
      Store.freshenRemote("Account");
      return;
    case "PublishProject":
      const project = await Store.getLocal(`Project_${name}`);
      if (!project) {
        return;
      }
      Store.setLocal(`Project_${name}`, {
        ...project,
        rootDoc: value
      });
      return;
  }
};

const onWsError = e => {};

const onWsClose = e => {
  wsIsReady = false;
  console.log("Connection Closed", e.code, e.reason);
  ws = null;

  setTimeout(() => {
    ws = new WebSocket("ws://localhost:5000");
    ws.onopen = onWsOpen;
    ws.onclose = onWsClose;
    ws.onerror = onWsError;
    ws.onmessage = onWsMessage;
  }, 3000);
};

ws = new WebSocket("ws://localhost:5000");
ws.onopen = onWsOpen;
ws.onclose = onWsClose;
ws.onerror = onWsError;
ws.onmessage = onWsMessage;

let queuedWsMessages = [];
const sendWs = message => {
  if (wsIsReady) {
    ws.send(message);
  } else {
    queuedWsMessages.push(message);
  }
};

//   // connection opened
//   ws.send("subscribe", "foo"); // send a message
//   ws.send("subscribe", "bar"); // send a message
//   ws.send("unsubscribe", "foo"); // send a message
// };

class Store {
  static _localDocuments = {};
  static _listeners = {};

  static emit(name, data) {
    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    listenerSet.forEach(listener => {
      listener(data);
    });
  }

  static async writeProjectFile(data, projectId, path) {
    const project = await Store.getProject(projectId);
    const docId = await Store.writeDocument(data, projectId);
    const newRootDoc = await Store.writeInFolder(
      projectId,
      project.rootDoc,
      path,
      docId
    );
    await Store.writeProject(projectId, newRootDoc);
  }

  static async writeInFolder(projectId, lastId, path, newFileValue) {
    const lastFolder = lastId && (await Store.getDocument(projectId, lastId));
    const folder = lastFolder
      ? { ...lastFolder }
      : { type: "Folder", files: {} };
    const files = folder.files ? { ...folder.files } : {};
    if (path.length === 1) {
      const fileName = path[0];
      files[fileName] = {
        name: fileName,
        value: newFileValue
      };
    } else if (path.length > 1) {
      const subPath = path.slice();
      const fileName = subPath.splice(0, 1)[0];
      const lastFile = files[fileName];
      files[fileName] = {
        name: fileName,
        value: await writeInFolder(
          projectId,
          lastFile && lastFile.value,
          subPath,
          newFileValue
        )
      };
    } else {
      return null;
    }
    const docId = await Store.writeDocument({ ...folder, files }, projectId);
    return docId;
  }

  static async writeDocument(data, projectId) {
    const projectIdPaths = projectId.split("/");
    const result = await Store.dispatchRemote({
      type: "CreateDocAction",
      user: projectIdPaths[0],
      project: projectIdPaths[1],
      data: JSON.stringify(data)
    });
    return result && result.docId;
  }

  static async writeProject(projectId, rootDoc) {
    const projectIdPaths = projectId.split("/");
    const projectName = projectIdPaths[1];
    Store.dispatchRemote({
      type: "SetProjectAction",
      rootDoc,
      projectName
    });
  }

  static async listen(name, handler) {
    const localIdParts = name.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await Store.getLocal("Session");
        sendWs(`ListenAccount_${session.username}`);
        break;
      case "Project":
        sendWs(`ListenProject_${arg0}`);
        break;
      default:
        break;
    }
    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    listenerSet.push(handler);
  }

  static async unlisten(name, handler) {
    const localIdParts = name.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await Store.getLocal("Session");
        sendWs(`UnlistenAccount_${session.username}`);
        break;
      case "Project":
        sendWs(`UnlistenProject_${arg0}`);
        break;
      default:
        break;
    }

    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    const listenerIndex = listenerSet.indexOf(handler);
    if (listenerIndex !== -1) {
      listenerSet.splice(listenerIndex, 1);
    }
  }

  static async _handleRemoteGet(localId, action) {
    const remoteDoc = await Store.dispatchRemote(action);
    await Store.setLocal(localId, remoteDoc);
    return remoteDoc;
  }

  static async freshenRemote(localId) {
    const localIdParts = localId.split("_");
    const type = localIdParts[0];
    const projectId = localIdParts[1];
    const user = projectId && projectId.split("/")[0];
    const project = projectId && projectId.split("/")[1];
    const id = localIdParts[2];
    switch (type) {
      case "Account":
        return Store._handleRemoteGet(localId, {
          type: "GetAccountAction"
        });
      case "Project":
        return Store._handleRemoteGet(localId, {
          type: "GetProjectAction",
          user,
          project
        });
      case "Document":
        if (!id || id == null || id === "null") {
          debugger;
        }
        // document IDs are immutable (content-addressable), so we don't need to load them remotely if we have them here
        const localDoc = await Store.getLocal(localId);
        if (localDoc) {
          return localDoc;
        }
        return Store._handleRemoteGet(localId, {
          type: "GetDocAction",
          user,
          project,
          id
        });
      default:
        return undefined;
    }
  }

  static async get(localId) {
    await Store.freshenRemote(localId);
    return await Store.getLocal(localId);
  }

  static async getProject(projectId) {
    return await Store.get(`Project_${projectId}`);
  }

  static async getDocument(projectId, docId) {
    if (docId === "null" || !docId) {
      debugger;
    }
    return await Store.get(`Document_${projectId}_${docId}`);
  }

  static async getAndListen(localId, handler) {
    await Store.listen(localId, handler);
    const data = await Store.getLocal(localId);
    handler(data);
    // todo, propaer caching somehow lol
    await Store.freshenRemote(localId);
  }
  static async setLocal(localId, data) {
    const storedData = JSON.stringify(data);
    await AsyncStorage.setItem("AvenDocument_" + localId, storedData);
    Store._localDocuments[localId] = data;
    Store.emit(localId, data);
  }
  static async getLocal(localId) {
    let data = Store._localDocuments[localId];
    if (data !== undefined) {
      return data;
    }
    const storedData = await AsyncStorage.getItem("AvenDocument_" + localId);
    if (storedData) {
      try {
        data = JSON.parse(storedData);
      } catch (e) {
        data = storedData;
      }
    }
    Store._localDocuments[localId] = data;
    return data;
  }
  static async dispatchRemote(action) {
    const session = await Store.getLocal("Session");
    let host = action.host;
    if (session) {
      host = session.host;
    } else if (!host) {
      throw "No valid session or host!";
    }
    const res = await fetch(`${host}/api/dispatch`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Aven-Auth-Username": session && session.username,
        "X-Aven-Auth-Session": session && session.session
      },
      body: JSON.stringify(action)
    });
    const textBody = await res.text();
    let body = textBody;
    try {
      body = textBody && JSON.parse(textBody);
    } catch (e) {}
    console.log("Dispatch! ", action, body);
    return body;
  }
  static async login(data) {
    const body = await Store.dispatchRemote({
      type: "AuthLoginAction",
      ...data
    });
    if (body && body.session) {
      Store.setLocal("Session", {
        session: body.session,
        username: body.username,
        host: data.host
      });
      return;
    } else {
      throw "Error on server";
    }
  }
  static async logout() {
    try {
      await Store.dispatchRemote({
        type: "AuthLogoutAction"
      });
    } catch (e) {
      Alert.alert(
        "Logout request failed",
        "Would you still like to dismiss your local session?",
        [
          {
            text: "Yes, Log Out",
            onPress: async () => {
              await AsyncStorage.clear();
              await Store.setLocal("Session", null);
            }
          },
          {
            text: "Cancel Logout",
            onPress: () => {},
            style: "cancel"
          }
        ],
        { cancelable: true }
      );
      return;
    }
    await Store.setLocal("Session", null);
  }
}

class FolderView extends React.Component {
  render() {
    let files = this.props.doc && this.props.doc.files;
    if (!files) {
      files = {};
    }
    return (
      <ScrollView>
        {Object.keys(files).map(fileName => {
          const path = [...this.props.path, fileName];
          return (
            <Button
              key={`file_${fileName}`}
              title={fileName}
              onPress={() => {
                this.props.navigation.navigate("Project", {
                  path,
                  projectId: this.props.projectId
                });
              }}
            />
          );
        })}
        <Button
          title="New File"
          color="#22dd22"
          key="NewFile"
          onPress={() => {
            AlertIOS.prompt("New file name:", null, fileName => {
              fileName &&
                this.props.navigation.navigate("Project", {
                  path: [...this.props.path, fileName],
                  edit: true,
                  projectId: this.props.projectId
                });
            });
          }}
        />
      </ScrollView>
    );
  }
}

class NullView extends React.Component {
  render() {
    return <Text>Empty</Text>;
  }
}

class PlaintextView extends React.Component {
  onChangeText = text => {
    const { projectId, path } = this.props;
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      Store.writeProjectFile(text, projectId, path);
    }, 2000);
  };
  render() {
    const { doc } = this.props;
    // debugger;
    // return <Text>ok..</Text>;
    return (
      <ScrollView>
        <TextInput multiline onChangeText={this.onChangeText}>
          {doc}
        </TextInput>
      </ScrollView>
    );
  }
}

class LoadingView extends React.Component {
  render() {
    return <Text>LOADING VIEW</Text>;
  }
}

class DocumentView extends React.Component {
  render() {
    const { defaultDoc } = this.props;
    return (
      <DocLoader
        defaultDoc={defaultDoc}
        render={displayDoc => {
          const { path, projectId, id, parentPath } = this.props;
          if (displayDoc === null) {
            return <NullView />;
          }
          if (displayDoc === undefined) {
            return <LoadingView />;
          }
          if (typeof displayDoc === "string") {
            return (
              <PlaintextView
                doc={displayDoc}
                navigation={this.props.navigation}
                path={path}
                projectId={projectId}
              />
            );
          }
          const type = displayDoc.type;
          if (path && path.length && type === "Folder") {
            const newParentPath = parentPath ? parentPath.slice() : [];
            const thisSegIndex = newParentPath.length;
            const thisSeg = path[thisSegIndex];
            newParentPath.push(thisSeg);
            if (thisSeg) {
              if (!displayDoc) {
                debugger;
              }
              const file = displayDoc.files[thisSeg];
              return (
                <DocumentView
                  defaultDoc={""}
                  id={file && file.value}
                  projectId={projectId}
                  path={path}
                  parentPath={newParentPath}
                  navigation={this.props.navigation}
                />
              );
            }
          }

          if (type === "Folder") {
            return (
              <FolderView
                doc={displayDoc}
                navigation={this.props.navigation}
                path={path}
                projectId={projectId}
              />
            );
          }

          // handle more types!!

          // fallback type:
          return (
            <ScrollView>
              <Text>{JSON.stringify(displayDoc)}</Text>
            </ScrollView>
          );
        }}
        projectId={this.props.projectId}
        id={this.props.id}
        key={this.props.id}
      />
    );
  }
}

class ProjectScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { projectId, path } = navigation.state.params;
    let title = projectId;
    if (path && path.length) {
      title = path[0];
    }
    return { title };
  };
  render() {
    const { projectId, path } = this.props.navigation.state.params;
    return (
      <ProjectLoader
        projectId={projectId}
        render={project => {
          if (!project) {
            return <Text>Loading..</Text>;
          }
          const rootDoc = project && project.rootDoc;
          return (
            <DocumentView
              navigation={this.props.navigation}
              defaultDoc={{ type: "Folder", files: {} }}
              id={rootDoc}
              key={rootDoc}
              projectId={projectId}
              path={path || []}
            />
          );
        }}
      />
    );
  }
}

class FormScreen extends React.Component {
  constructor(props) {
    super(props);
    const data = {};
    props.inputs.forEach(input => {
      if (input.default) {
        data[input.key] = input.default;
      }
    });
    this.state = {
      error: null,
      data,
      isLoading: false
    };
  }
  _submit = async () => {
    this.setState({ isLoading: true, error: null });
    try {
      await this.props.onSubmit(this.state.data);
    } catch (err) {
      const errMessage = err.message ? err.message : err;
      this.setState({ isLoading: false, error: errMessage });
      return;
    }
    this.setState({ isLoading: false, error: null });
  };
  _renderInput = (i, index) => {
    if (i.type === "boolean") {
      return (
        <View key={i.key} style={{ height: 50 }}>
          <Text>{i.label}</Text>
          <Switch
            disabled={this.state.isLoading}
            value={this.state.data[i.key]}
            onValueChange={t =>
              this.setState({ data: { ...this.state.data, [i.key]: t } })}
          />
        </View>
      );
    }
    return (
      <View key={i.key} style={{ height: 50 }}>
        <TextInput
          style={{ flex: 1, backgroundColor: "white", padding: 10 }}
          value={this.state.data[i.key]}
          secureTextEntry={i.type === "password"}
          placeholder={i.placeholder}
          enablesReturnKeyAutomatically
          autoCorrect={false}
          editable={!this.state.isLoading}
          autoFocus={index === 0}
          autoCapitalize={i.autoCapitalize}
          onChangeText={t =>
            this.setState({ data: { ...this.state.data, [i.key]: t } })}
        />
      </View>
    );
  };
  render() {
    const { error } = this.state;
    const inputs = this.props.inputs.map(this._renderInput);
    return (
      <ScrollView contentContainerStyle={{ paddingTop: null }}>
        {error && <Text>{error}</Text>}
        {inputs}
        {this.state.isLoading && <ActivityIndicator />}
        <Button
          onPress={this._submit}
          title="Submit"
          disabled={this.state.isLoading}
        />
      </ScrollView>
    );
  }
}

class NewProjectScreen extends React.Component {
  static navigationOptions = {
    title: "New Project"
  };
  render() {
    const state = this.state;
    const { navigation } = this.props;
    return (
      <FormScreen
        inputs={[
          { key: "projectName", placeholder: "Project Name" },
          {
            key: "isPublic",
            type: "boolean",
            label: "Is project public?",
            default: false
          }
        ]}
        onSubmit={async values => {
          const remoteProject = await Store.dispatchRemote({
            type: "CreateProjectAction",
            ...values
          });
          this.props.navigation.goBack();
        }}
      />
    );
  }
}

class LoginScreen extends React.Component {
  state = {
    data: {},
    isLoading: false
  };
  static navigationOptions = {
    title: "Login"
  };
  render() {
    const { data } = this.state;
    return (
      <FormScreen
        inputs={[
          {
            key: "host",
            placeholder: "Aven Host",
            default: "https://aven.io",
            autoCapitalize: "none"
          },
          {
            key: "username",
            placeholder: "Username",
            autoCapitalize: "none"
          },
          {
            key: "password",
            type: "password",
            placeholder: "Password",
            autoCapitalize: "none"
          }
        ]}
        onSubmit={async data => {
          await Store.login(data);
          this.props.navigation.goBack();
        }}
      />
    );
  }
}

export const SimpleApp = StackNavigator({
  Home: { screen: HomeScreen },
  Login: { screen: LoginScreen },
  Project: { screen: ProjectScreen },
  NewProject: { screen: NewProjectScreen }
});

module.exports = SimpleApp;
