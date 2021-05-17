const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed.js");
const controller = require("./orders.controller.js");

// TODO: Implement the /orders routes needed to make the tests pass

router
    .route("/:orderId") // route for "/orders/:orderId" where orderId is passed as a parameter
    .get(controller.read) // get method that returns order data
    .put(controller.update) // put method that updates order data
    .delete(controller.destroy) // delete method that removes data from server
    .all(methodNotAllowed); // catchall method that returns methodNotAllowed function

router
    .route("/") // route for "/orders"
    .get(controller.list) // get method returns full list of orders
    .post(controller.create) // post method adds new order to server data
    .all(methodNotAllowed); // catchall method that returns methodNotAllowed function

module.exports = router;
