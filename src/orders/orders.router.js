const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed.js");
const controller = require("./orders.controller.js");

// TODO: Implement the /orders routes needed to make the tests pass

router
    .route("/:orderId")
    .get(controller.read)
    .put(controller.update)
    .delete(controller.destroy)
    .all(methodNotAllowed);

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

module.exports = router;
