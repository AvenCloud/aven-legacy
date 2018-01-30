({}) => (app, req, res) => {
  app.dispatch.CreateDocAction;
  res.json({
    path: req.path,
    params: req.params,
    query: req.query,
  });
};
