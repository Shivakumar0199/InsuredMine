const ProjectController = require("./ProjectController")

module.exports = (app) =>{

    app.post("/uploadData",ProjectController.uploadData);

    app.get("/policyInfo",ProjectController.getPolicyInfo);

    app.get("/aggPolicyInfo",ProjectController.getAggPolicyInfo);

    app.post("/postMessage",ProjectController.postMessage);
}