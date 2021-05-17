const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// validates incoming dish data for errors before continuing res pipeline
function validateDish (req, res, next) {
    const { data: dish = {} } = req.body;
    // validates incoming dish.name
    if (!dish.name || dish.name == "") {
        return next({
            status: 400,
            message: 'Dish must include a name'
        });
    }
    // validates incoming dish.description
    if (!dish.description || dish.description == "") {
        return next({
            status: 400,
            message: 'Dish must include a description'
        });
    }
    // checks that incoming dish.price exists
    if (!dish.price) {
        return next({
            status: 400,
            message: 'Dish must include a price'
        });
    }
    // validates incoming dish.price value
    if (dish.price <= 0 || typeof dish.price != 'number'){
        return next({
            status: 400,
            message: 'Dish must have a price that is an integer greater than 0'
        });
    }
    // validates incoming dish.image_url
    if (!dish.image_url || dish.image_url == "") {
        return next({
            status: 400,
            message: 'Dish must include a image_url'
        });
    }
    res.locals.dish = dish; // sets res.locals.dish to incoming dish data
    next(); // continues response pipeline
}

// checks that dish exists in server data based on incoming data
function dishExists (req, res, next) {
    const { dishId } = req.params; // get dishId from url parameter
    const dishIndex = dishes.findIndex(dish => dish.id == dishId); // get index of server's dish that matches incoming dish
    const foundDish = dishes[dishIndex]; // get server data for dish at dishIndex
    // if dish exists on server
    if (foundDish) {
        res.locals.foundDish = foundDish; // saves server's foundDish in res.locals
        res.locals.dishId = dishId; // saves incoming dishId in res.locals
        res.locals.dishIndex = dishIndex; // saves server's dishIndex in res.locals
        return next(); // continue response pipeline
    }
    // if foundDish is falsy, return 404 with error message
    return next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    });
}

// final check before running update()
function validateUpdate(req, res, next) {
    // if incoming dish has an id and it doesn't match the id in the url
    if (res.locals.dish.id && res.locals.dishId != res.locals.dish.id) {
        // then error 400
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${res.locals.dish.id}, Route: ${res.locals.dishId}`
        });
    }
    next(); // continue response pipeline
}

// sets res status 200 and data to the server's dish data
function list (req, res) {
    res.status(200).json({ data: dishes });
}

// adds id to incoming dish data then pushes it to the server's data
// then sets res status 201 and data to the dish data sent to server
function create (req, res) {
    res.locals.dish.id = nextId()
    dishes.push(res.locals.dish);
    res.status(201).json({ data: res.locals.dish});
}

// sets res status 200 and data to the server's dish that matches input dish data
function read (req, res) {
    res.status(200).json({ data: res.locals.foundDish });
}

// sets server's matching dish to the inputted dish
// gives the dish an id if there is the property doesnt exist
// sets res status 200 and data to the data that was sent to the server's dish data
function update(req, res, next) {
    dishes[res.locals.dishIndex] = res.locals.dish;
    if (!res.locals.dish.id) {
        dishes[res.locals.dishIndex].id = res.locals.dishId;
    }
    res.status(200).json({ data: res.locals.dish });
}

module.exports = {
    list,
    create: [validateDish, create],
    update: [dishExists, validateDish, validateUpdate, update],
    read: [dishExists, read]
}