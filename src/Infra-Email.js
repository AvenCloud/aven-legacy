module.exports = async () => {
  const _testSentEmails = []
  return {
    type: "test",
    _testSentEmails,
    send: async (to, subject, content) => {
      _testSentEmails.push({ to, subject, content })
    },
  }
}
