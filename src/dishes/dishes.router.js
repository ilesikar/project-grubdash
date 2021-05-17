const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass

router
    .route("/:dishId") // route for "/dishes/:dishId" where dishId is passed as a parameter
    .get(controller.read) // get method that returns a dish
    .put(controller.update) // put method that updates a dish
    .all(methodNotAllowed); // catchall method that returns methodNotAllowed function

router
    .route("/") // router for "/dishes"
    .get(controller.list) // get method that returns all dish data on server
    .post(controller.create) // post method that adds a new dish to the server's dish data
    .all(methodNotAllowed) // catchall method that returns methodNotAllowed function

module.exports = router;
