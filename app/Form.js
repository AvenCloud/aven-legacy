({ React, Platform, Alert, View, Button, Text, TextInput, StyleSheet }) => {
  class FormField extends React.Component {
    render() {
      const { field, onValue, value } = this.props;
      return (
        <View style={styles.container}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput value={value} onChangeText={onValue} />
        </View>
      );
    }
  }
  const styles = StyleSheet.create({
    label: { color: "red" },
  });
  class Form extends React.Component {
    state = { fields: {} };
    render() {
      return (
        <View>
          {this.props.fields.map(field => (
            <FormField
              field={field}
              key={field.name}
              value={this.state.fields[field.name]}
              onValue={value => {
                console.log("wat", field.name, value);
                this.setState(state => ({
                  fields: { ...state.fields, [field.name]: value },
                }));
              }}
            />
          ))}
          <Button onPress={this._onSubmit} label="Submit" />
        </View>
      );
    }
    _onSubmit = () => {
      this.props.onSubmit(this.state.fields);
    };
  }
  return Form;
};
