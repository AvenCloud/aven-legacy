({ React, Platform, Alert, View, Button, Text, TextInput, StyleSheet }) => {
  class FormField extends React.Component {
    render() {
      const { field, onValue, value } = this.props;
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            value={value}
            onChangeText={onValue}
            style={styles.formInput}
          />
        </View>
      );
    }
  }
  const styles = StyleSheet.create({
    fieldContainer: { marginBottom: 10 },
    formContainer: { padding: 30 },
    label: { color: "#222233", marginVertical: 3 },
    formInput: {
      height: 40,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#DDDDEE",
      borderRadius: 5,
      padding: 8,
    },
  });
  class Form extends React.Component {
    state = { fields: {} };
    render() {
      return (
        <View style={styles.formContainer}>
          {this.props.fields.map(field => (
            <FormField
              field={field}
              key={field.name}
              value={this.state.fields[field.name]}
              onValue={value => {
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
