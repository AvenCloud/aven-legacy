import React from "react";
import {
  ActivityIndicator,
  Text,
  View,
  AlertIOS,
  Button,
  Switch,
  AsyncStorage,
  TextInput,
  ScrollView
} from "react-native";
import { StackNavigator } from "react-navigation";

// const HOST = 'https://aven.io';
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
    Store.getAndListen(`Project_${this.props.projectId}`, this._setProject);
  }
  _setProject = project => {
    this.setState({ project });
  };
  componentWillUnmount() {
    Store.unlisten(`Project_${this.props.projectId}`, this._setProject);
  }
  render() {
    const { state } = this;
    if (!state && !this.props.handlesLoading) return <SimpleLoader />;
    return this.props.render(state.project);
  }
}

class DocLoader extends React.Component {
  state = null;
  componentDidMount() {
    Store.getAndListen(
      `Document_${this.props.projectId}_${this.props.id}`,
      this._setDoc
    );
  }
  _setDoc = doc => {
    this.setState({ doc });
  };
  componentWillUnmount() {
    Store.unlisten(
      `Document_${this.props.projectId}_${this.props.id}`,
      this._setProject
    );
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

class Store {
  static _localDocuments = {};
  static _listeners = {};
  static emit(name, data) {
    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    listenerSet.forEach(listener => {
      listener(data);
    });
  }
  static listen(name, handler) {
    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    listenerSet.push(handler);
  }
  static unlisten(name, handler) {
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
  static async set(projectId, document) {}
  static async getProject(projectId) {
    const localId = `Project_${projectId}`;
    const user = projectId.split("/")[0];
    const project = projectId.split("/")[1];
    const remoteProject = await Store.dispatchRemote({
      type: "GetProjectAction",
      user,
      project
    });
    await Store.setLocal(localId, remoteProject);
    return remoteProject;
  }
  static async setProject(projectId, topDocument) {}

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

  static async getAndListen(localId, handler) {
    Store.listen(localId, handler);
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
    const res = await fetch(`${HOST}/api/dispatch`, {
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
    let body = null;
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
        username: body.username
      });
      return;
    } else {
      throw "Error on server";
    }
  }
  static async logout() {
    await Store.dispatchRemote({
      type: "AuthLogoutAction"
    });
    await Store.setLocal("Session", null);
  }
}

class FolderView extends React.Component {
  render() {
    return (
      <ScrollView>
        {Object.keys(this.props.doc.files).map(fileName => {
          return (
            <Button
              key={fileName}
              title={fileName}
              onPress={() => {
                this.props.navigation.navigate("Project", {
                  path: [...this.props.path, fileName],
                  projectId: this.props.projectId
                });
              }}
            />
          );
        })}
        <Button
          title="New File"
          key="__NewFile"
          onPress={() => {
            AlertIOS.prompt("File name:", null, fileName => {
              fileName &&
                this.props.navigation.navigate("Project", {
                  path: [...this.props.path, fileName],
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

class DocumentView extends React.Component {
  render() {
    return (
      <DocLoader
        render={doc => {
          if (doc === undefined || doc === null) {
            return <NullView />;
          }
          const type = doc.type;
          const { path, projectId, id } = this.props;

          if (path && path.length && type === "Folder") {
            const newPath = path.slice();
            const thisSeg = newPath.splice(0, 1);
            const file = doc.files[thisSeg];
            return (
              <DocumentView
                id={file.value}
                projectId={projectId}
                path={newPath}
              />
            );
          }

          if (type === "Folder") {
            return (
              <FolderView
                doc={doc}
                navigation={this.props.navigation}
                path={path}
                projectId={projectId}
              />
            );
          }

          return (
            <ScrollView>
              <Text>{JSON.stringify(doc)}</Text>
            </ScrollView>
          );
        }}
        projectId={this.props.projectId}
        id={this.props.id}
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
          return (
            project.rootDoc && (
              <DocumentView
                navigation={this.props.navigation}
                id={project.rootDoc}
                projectId={projectId}
                path={path || []}
              />
            )
          );
        }}
      />
    );
  }
}

class FormScreen extends React.Component {
  state = {
    data: {},
    isLoading: false
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
    const inputs = this.props.inputs.map(this._renderInput);
    return (
      <ScrollView contentContainerStyle={{ paddingTop: null }}>
        {inputs}
        {this.state.isLoading && <ActivityIndicator />}
        <Button
          onPress={async () => {
            this.setState({ isLoading: true });
            await this.props.onSubmit(this.state.data);
            this.setState({ isLoading: false });
          }}
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
          console.log("did it!", remoteProject);
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
