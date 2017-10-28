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
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  ScrollView
} from "react-native";
import { StackNavigator } from "react-navigation";
import { FontAwesome } from "@expo/vector-icons";

const Store = require("./Store");

class LoggedOutHome extends React.Component {
  render() {
    return (
      <GenericScreen
        header={
          <Header
            title="Aven"
            navigation={this.props.navigation}
            right={
              <HeaderButton
                name="user-circle"
                onPress={() => {
                  this.props.navigation.navigate("Login");
                }}
              />
            }
          />
        }
      >
        <Text>Welcome! Content will come here :-)</Text>
      </GenericScreen>
    );
  }
}

class ALoading extends React.Component {
  render() {
    return <ActivityIndicator />;
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
    if (!state && !this.props.handlesLoading) return <ALoading />;
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
    if (!state && !this.props.handlesLoading) return <ALoading />;
    return this.props.render(state.project);
  }
}

class DocLoader extends React.Component {
  state = this.props.id ? null : { doc: this.props.defaultDoc };
  async componentDidMount() {
    if (this.props.id) {
      this._localId = `Document_${this.props.projectId}_${this.props.id}`;
      const doc = await Store.get(this._localId);
      this.setState({ doc });
      return;
    }
  }
  async componentWillReceiveProps(props) {
    if (props.id !== this.props.id) {
      this._localId = `Document_${props.projectId}_${props.id}`;
      const doc = await Store.get(this._localId);
      this.setState({ doc });
    }
  }
  componentWillUnmount() {
    this._localId && Store.unlisten(this._localId, this._setDoc);
  }
  render() {
    const { state } = this;
    if (!state && !this.props.handlesLoading) return <ALoading />;
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
        <ARowSection title="Recent Projects">
          {Object.keys(projects).map(projectName => {
            return (
              <ARow
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
          })
          // .slice(-5)
          }
        </ARowSection>
        <AButton
          title="See all projects"
          onPress={() => {}}
          style="secondary"
        />
        <AButton
          color={CREATION_COLOR}
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
    const { navigation, session } = this.props;
    return (
      <GenericScreen
        header={<Header title={session.username} navigation={navigation} />}
      >
        <AccountLoader
          render={account => (
            <View>
              {account && (
                <MyProjectList
                  account={account}
                  session={session}
                  navigation={navigation}
                />
              )}
            </View>
          )}
        />
        <AButton
          title="Account"
          onPress={() => navigation.navigate("Account")}
        />
        <AButton title="Logout" onPress={Store.logout} style="secondary" />
        <View style={{ flexDirection: "row" }}>
          <AButton title="Terms and Privacy" onPress={() => {}} style="small" />
          <AButton title="About Aven" onPress={() => {}} style="small" />
        </View>
      </GenericScreen>
    );
  }
}

class AccountScreen extends React.Component {
  render() {
    return (
      <GenericScreen
        header={
          <Header title={"My Account"} navigation={this.props.navigation} />
        }
      >
        <SessionLoader
          render={() => (
            <View>
              <Text>Username: {session.username}!</Text>
              <Text>Server: {session.host}</Text>
            </View>
          )}
        />
        <AccountLoader
          render={account => (
            <View>
              <Text>{account.projects.length} Projects</Text>
              <Text>{JSON.stringify(account)}</Text>
            </View>
          )}
        />
        <AButton title="Logout" onPress={Store.logout} style="secondary" />
      </GenericScreen>
    );
  }
}

class SessionLoader extends React.Component {
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
    return this.props.render(state.session);
  }
}

class HomeScreen extends React.Component {
  state = null;
  componentDidMount() {
    Store.getAndListen("Session", this._setSession);
  }
  _setSession = session => {
    this.setState({ session });
  };
  render() {
    const { navigation } = this.props;
    return (
      <SessionLoader
        render={session => {
          if (session) {
            return <LoggedInHome session={session} navigation={navigation} />;
          } else {
            return <LoggedOutHome navigation={navigation} />;
          }
        }}
      />
    );
  }
}

class FolderView extends React.Component {
  render() {
    let files = this.props.doc && this.props.doc.files;
    if (!files) {
      files = {};
    }
    return (
      <View>
        <ARowSection title="Files">
          {Object.keys(files).map(fileName => {
            const path = [...this.props.path, fileName];
            return (
              <ARow
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
        </ARowSection>
        <AButton
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
      </View>
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

const computeDoc = doc => {
  return eval(doc.code)({
    React,
    View,
    Button,
    Text
  });
};

class JSModuleView extends React.Component {
  state = { isRunning: false, runComponent: null };
  componentWillReceiveProps(props) {
    if (props.doc && props.doc !== this.props.doc) {
      this.setState({
        runComponent: computeDoc(props.doc)
      });
    }
  }
  render() {
    let content = <Text>{this.props.doc.code}</Text>;
    if (this.state.isRunning) {
      const Component = this.state.runComponent;
      content = <Component />;
    }
    return (
      <View>
        <AButton
          onPress={() => {
            if (this.state.isRunning) {
              this.setState({
                isRunning: false,
                runComponent: null
              });
            } else {
              this.setState({
                isRunning: true,
                runComponent: computeDoc(this.props.doc)
              });
            }
          }}
          title={this.state.isRunning ? "Stop!" : "Run!"}
        />
        {content}
      </View>
    );
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
            return <ALoading />;
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
          if (type === "JSModule") {
            return (
              <JSModuleView
                doc={displayDoc}
                navigation={this.props.navigation}
                path={path}
                projectId={projectId}
              />
            );
          }

          // fallback type:
          return (
            <ScrollView>
              <Text>{JSON.stringify(displayDoc)}</Text>
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
  render() {
    const { projectId, path } = this.props.navigation.state.params;
    let title = projectId;
    if (path && path.length) {
      title = path[0];
    }
    return (
      <GenericScreen
        header={<Header title={title} navigation={this.props.navigation} />}
      >
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
                projectId={projectId}
                path={path || []}
              />
            );
          }}
        />
      </GenericScreen>
    );
  }
}
const ERROR_COLOR = 0xdd4444ff;

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
  _formInputs = [];
  _focusInput = index => {
    this._formInputs[index] && this._formInputs[index].focus();
  };
  _renderInput = (i, index, list) => {
    const isLast = index === list.length - 1;
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
      <View key={i.key} style={{ margin: 20 }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: INTERACTABLE_WASH,
            color: 0x222222ff,
            padding: 10,
            height: 50
          }}
          placeholderTextColor={0x333333ff}
          value={this.state.data[i.key]}
          secureTextEntry={i.type === "password"}
          placeholder={i.placeholder}
          enablesReturnKeyAutomatically={true}
          returnKeyType={isLast ? "go" : "next"}
          autoCorrect={false}
          editable={!this.state.isLoading}
          onSubmitEditing={() => {
            if (isLast) {
              this._submit();
            } else {
              this._focusInput(index + 1);
            }
          }}
          autoFocus={index === 0}
          ref={input => {
            this._formInputs[index] = input;
          }}
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
      <GenericScreen header={this.props.header}>
        {error && (
          <View
            style={{ backgroundColor: ERROR_COLOR, margin: 20, padding: 15 }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>{error}</Text>
          </View>
        )}
        {inputs}
        {this.state.isLoading && <ActivityIndicator />}
        <AButton
          onPress={this._submit}
          title="Submit"
          disabled={this.state.isLoading}
        />
      </GenericScreen>
    );
  }
}

const AVEN_COLOR = 0x2d495bff;
const HAIR_BORDER_COLOR = 0x2d495bff;
const INTERACTABLE_WASH = 0xffffffff;
// const INTERACTABLE_WASH = 0xd0d0d0ff;
const CREATION_COLOR = 0x22bb22ff;

class ARow extends React.Component {
  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: HAIR_BORDER_COLOR
          }}
        >
          <Text>{this.props.title}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

class ARowSection extends React.Component {
  render() {
    const { title, children } = this.props;
    return (
      <View style={{}}>
        {title && (
          <Text
            style={{
              fontSize: 20,
              color: AVEN_COLOR,
              margin: 20,
              marginBottom: 10
            }}
          >
            {title}
          </Text>
        )}
        <View
          style={{
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: HAIR_BORDER_COLOR,
            marginVertical: 10
          }}
        >
          {children}
        </View>
      </View>
    );
  }
}

class AButton extends React.Component {
  render() {
    const btnStyle = this.props.style || "primary";
    const isPrimary = btnStyle === "primary";
    const isSmall = btnStyle === "small";
    return (
      <TouchableOpacity
        style={{
          backgroundColor: isPrimary ? this.props.color || AVEN_COLOR : null,
          padding: 15,
          margin: 20
        }}
        onPress={this.props.disabled === true ? null : this.props.onPress}
      >
        <Text
          style={{
            color: isPrimary ? "white" : this.props.color,
            textAlign: "center",
            fontSize: isSmall ? 16 : 22
          }}
        >
          {this.props.title}
        </Text>
      </TouchableOpacity>
    );
  }
}

class NewProjectScreen extends React.Component {
  render() {
    const state = this.state;
    const { navigation } = this.props;
    return (
      <FormScreen
        header={<Header title="New Project" navigation={navigation} />}
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
        header={<Header title="Login" navigation={this.props.navigation} />}
        inputs={[
          {
            key: "host",
            placeholder: "Aven Host",
            default: "aven.io",
            autoCapitalize: "none"
          },
          {
            key: "isSecure",
            type: "boolean",
            default: true
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

const HEADER_HEIGHT = 80;

const GenericScreen = ({ header, children }) => (
  <View style={{ flex: 1, backgroundColor: 0xdfdfffff }}>
    <ScrollView
      contentInset={{ top: HEADER_HEIGHT }}
      ref={sv => {
        setTimeout(() => {
          sv &&
            sv.scrollTo({
              y: -HEADER_HEIGHT,
              animated: false
            });
        });
      }}
    >
      {children}
    </ScrollView>
    <View
      style={{
        height: HEADER_HEIGHT,
        position: "absolute",
        left: 0,
        top: 0,
        right: 0
      }}
    >
      {header}
    </View>
  </View>
);

const HeaderButton = ({ onPress, name }) => (
  <TouchableOpacity
    style={{ paddingHorizontal: 18, paddingVertical: 6 }}
    onPress={onPress}
    hitSlop={{ left: 20, top: 20, right: 20, bottom: 5 }}
  >
    <FontAwesome name={name} size={20} color={0x333333ff} />
  </TouchableOpacity>
);

class Header extends React.Component {
  render() {
    const { navigation, title, right } = this.props;
    const canGoBack = navigation.state.routeName !== "Home";
    return (
      <View
        style={{
          backgroundColor: 0xffffffcc,
          width: "100%",
          height: HEADER_HEIGHT,
          paddingTop: 40,
          flexDirection: "row",
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: 0xccccccdd
        }}
      >
        <Text
          style={{
            position: "absolute",
            left: 0,
            height: 36,
            right: 0,
            bottom: 0,
            flex: 1,
            fontSize: 20,
            color: 0x333333ff,
            textAlign: "center",
            fontWeight: "bold"
          }}
        >
          {title}
        </Text>
        {canGoBack && (
          <HeaderButton
            onPress={() => navigation.goBack()}
            name={"chevron-left"}
          />
        )}
        <View style={{ flex: 1 }} />
        {right}
      </View>
    );
  }
}

export const SimpleApp = StackNavigator(
  {
    Home: { screen: HomeScreen },
    Login: { screen: LoginScreen },
    Project: { screen: ProjectScreen },
    Account: { screen: AccountScreen },
    NewProject: { screen: NewProjectScreen }
  },
  {
    navigationOptions: {
      header: null
    }
  }
);

module.exports = SimpleApp;
