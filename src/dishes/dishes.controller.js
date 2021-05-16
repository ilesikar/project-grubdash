const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function validateDish (req, res, next) {
    const { data: dish = {} } = req.body;
    if (!dish.name || dish.name == "") {
        return next({
            status: 400,
            message: 'Dish must include a name'
        });
    }
    if (!dish.description || dish.description == "") {
        return next({
            status: 400,
            message: 'Dish must include a description'
        });
    }
    if (!dish.price) {
        return next({
            status: 400,
            message: 'Dish must include a price'
        });
    }
    if (dish.price <= 0 || typeof dish.price != 'number'){
        return next({
            status: 400,
            message: 'Dish must have a price that is an integer greater than 0'
        });
    }
    if (!dish.image_url || dish.image_url == "") {
        return next({
            status: 400,
            message: 'Dish must include a image_url'
        });
    }
    res.locals.dish = dish;
    next();
}

function dishExists (req, res, next) {
    const { dishId } = req.params;
    const { data: dish = {} } = req.body;
    const dishIndex = dishes.findIndex(dish => dish.id == dishId);
    const foundDish = dishes[dishIndex];
    if (foundDish) {
        res.locals.dishId = dishId;
        res.locals.dishIndex = dishIndex
        return next();
    }
    if (foundDish == undefined) {
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}`
        });
    }
    next();
}

function validateUpdate(req, res, next) {
    if (res.locals.dish.id && res.locals.dishId != res.locals.dish.id) {
          next({
              status: 400,
              message: `Dish id does not match route id. Dish: ${res.locals.dish.id}, Route: ${res.locals.dishId}`
          });
    }
    next();
}

function list (req, res) {
    res.status(200).json({ data: dishes });
}

function create (req, res) {
    const dish = res.locals.dish;
    dish.id = nextId()
    dishes.push(dish);
    res.status(201).json({ data: dish});
}

function read (req, res) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => {
        return dish.id == dishId;
    });
    if (!foundDish) {
      return next({
        status: 404,
        message: "not found"
      });
    }
    res.status(200).json({ data: foundDish });
}

function update(req, res, next) {
    dishes[res.locals.dishIndex] = res.locals.dish;
    dishes[res.locals.dishIndex].id = res.locals.dishId;
    res.status(200).json({ data: res.locals.dish });
}

module.exports = {
    list,
    create: [validateDish, create],
    update: [dishExists, validateDish, validateUpdate, update],
    read: [dishExists, read]
}