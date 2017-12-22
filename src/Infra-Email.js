async function Email() {
  const _testSentEmails = []
  return {
    type: "test",
    _testSentEmails,
    send: async (to, subject, content) => {
      _testSentEmails.push({ to, subject, content })
    },
  }
}

module.exports = Email
