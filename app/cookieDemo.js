({ Cookie, Form, Text, React, Page, Alert }) => {
  class CookieDemo extends React.Component {
    static title = "Dude";
    render() {
      return (
        <Page>
          <Text>Get from Cookie</Text>
          <Form
            fields={[{ name: "key", label: "Key" }]}
            onSubmit={async data => {
              Alert(`Cookie "${data.key}" is: ${await Cookie.get(data.key)}`);
            }}
          />
          <Text>Set to Cookie</Text>
          <Form
            fields={[
              { name: "key", label: "Key" },
              { name: "value", label: "Value" },
            ]}
            onSubmit={async data => {
              await Cookie.set(data.key, data.value);
            }}
          />
        </Page>
      );
    }
  }

  return CookieDemo;
};
