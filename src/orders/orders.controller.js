const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Test incoming order data from client for incomplete/incorrect data
// used in update() and create() functions
function validateOrder(req, res, next) {
    const { data: order = {} } = req.body;
    // checks deliverTo field for incorrect inputs
    if (!order.deliverTo || order.deliverTo == "") {
        return next({
            status: 400,
            message: 'Order must include a deliverTo'
        });
    }
    // checks mobileNumber field for incorrect inputs
    if (!order.mobileNumber || order.mobileNumber == "") {
        return next({
            status: 400,
            message: 'Order must include a mobileNumber'
        });
    }
    // checks dishes object field for incorrect inputs
    if (!order.dishes) {
        return next({
            status: 400,
            message: 'Order must include a dish'
        });
    }
    // checks if there are no dishes in the data
    if (!Array.isArray(order.dishes) || order.dishes.length == 0) {
        return next({
            status: 400,
            message: 'Order must include at least one dish'
        });
    }
    // checks each dish for an incorrect quantity
    order.dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity != "number"){
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    });
    res.locals.order = order; // sets res.locals.order to incoming order data
    next();
}

// checks if there is an existing order in the server data 
function orderExists(req, res, next) {
    const { orderId } = req.params; // get orderId from url parameters
    const orderIndex = orders.findIndex(order => order.id == orderId); // get index of order in sever data
    const foundOrder = orders[orderIndex]; // get order from server data at orderIndex
    // if order is found in server data
    if (foundOrder) {
        res.locals.orderId = orderId; // store orderId from parameters in res.locals
        res.locals.orderIndex = orderIndex; // store orderIndex of order in server data that matches orderId in res.locals
        res.locals.foundOrder = foundOrder; // store order in server data that matches orderId in res.locals
        // continue response pipeline
        return next();
    }
    // return err 404, order not found. (had a redundant if (foundOrder == undefined) here)
    return next({
        status: 404,
        message: `Order does not exist: ${orderId}`
    });
}

// checks for faulty incoming data before updating order
function validateUpdate(req, res, next) {
    const orderId = res.locals.orderId; // incoming order id parameter
    const order = res.locals.order; // incoming order data
    // if there is an incoming order.id and that order.id doesn't match the parameter
    if (order.id && orderId != order.id) {
        // return error 400 with message
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${order.id}, Route: ${orderId}`
        });
    }
    // if the incoming order's status field is faulty
    if (!order.status || order.status == "" || order.status === 'invalid') {
        //return error 400 with message
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        });
    }
    // if the incoming order's status is delivered
    if (order.status === "delivered") {
        // return error 400 with message
        return next({
            status: 400,
            message: "A delivered order cannot be changed"
        });
    }
    // if none of the above conditions are met, continue with response pipeline
    next();
}

// makes sure the destroy function can be run
function validateDestroy(req, res, next) {
    // if server's order status is pending
    if (res.locals.foundOrder.status !== 'pending') {
        // returns error 400 with message
        return next({
            status: 400,
            message: "Order must be pending"
        });
    }
    // continue response pipeline
    next();
}

// sets res status 200 and data to all orders data
function list(req, res) {
    res.status(200).json({ data: orders });
}

// adds new order id to incoming order and pushes it to the server's array
// then sets res status 200 and data to the order data
function create(req, res) {
    res.locals.order.id = nextId()
    orders.push(res.locals.order);
    res.status(201).json({ data: res.locals.order});
}

// sets status 200 and data to data of the found order on server
function read(req, res) {
    res.status(200).json({ data: res.locals.foundOrder });
}

// updates data on server with input order
// then sets status 200 and data to the updated order data
function update(req, res) {
    orders[res.locals.orderIndex] = res.locals.order;
    // if there is no id key then declare and set it to the input url parameter
    if (!res.locals.order.id) {
        orders[res.locals.orderIndex].id = res.locals.orderId;
    }
    res.status(200).json({ data: orders[res.locals.orderIndex] });
}

// deletes order at the found order index
// sets status 204 and data to the input order data
function destroy(req, res) {
    orders.splice(res.locals.orderIndex, 1);
    res.status(204).json({ data: res.locals.order});
}

module.exports = {
    list,
    create: [validateOrder, create],
    read: [orderExists, read],
    update: [validateOrder, orderExists, validateUpdate, update],
    destroy: [orderExists, validateDestroy, destroy]
}