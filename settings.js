module.exports = {
  "uiPort": 1880,
  "mqttReconnectTime": 15000,
  "serialReconnectTime": 15000,
  "debugMaxLength": 1000,
  "flowFile": "flows.json",
  "flowFilePretty": true,
  "credentialSecret": false,
  "userDir": "./node-red-data/",
  "httpAdminRoot": "/admin",
  "httpNodeRoot": "/",
  "httpNodeCors": {
    "origin": "*",
    "methods": "GET,PUT,POST,DELETE"
  },
  "apiMaxLength": "5mb",
  "functionGlobalContext": {},
  "logging": {
    "console": {
      "level": "info",
      "metrics": false,
      "audit": false
    }
  },
  "editorTheme": {
    "projects": {
      "enabled": false
    }
  }
};
