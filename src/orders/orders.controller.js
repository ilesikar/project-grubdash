const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function validateOrder(req, res, next) {
    const { data: order = {} } = req.body;
    if (!order.deliverTo || order.deliverTo == "") {
        return next({
            status: 400,
            message: 'Order must include a deliverTo'
        });
    }
    if (!order.mobileNumber || order.mobileNumber == "") {
        return next({
            status: 400,
            message: 'Order must include a mobileNumber'
        });
    }
    if (!order.dishes) {
        return next({
            status: 400,
            message: 'Order must include a dish'
        });
    }
    if (!Array.isArray(order.dishes) || order.dishes.length == 0) {
        return next({
            status: 400,
            message: 'Order must include at least one dish'
        });
    }
    order.dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity != "number"){
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    });
    res.locals.order = order;
    next();
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const orderIndex = orders.findIndex(order => order.id == orderId);
    const foundOrder = orders[orderIndex];
    if (foundOrder) {
      res.locals.orderId = orderId;
      res.locals.orderIndex = orderIndex;
      res.locals.foundOrder = foundOrder;
      return next();
    }
    if (foundOrder == undefined) {
        return next({
            status: 404,
            message: `Order does not exist: ${orderId}`
        });
    }
}

function validateUpdate(req, res, next) {
    const orderId = res.locals.orderId;
    const order = res.locals.order;
    if (order.id && orderId != order.id) {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${order.id}, Route: ${orderId}`
        });
    }
    if (!order.status || order.status == "" || order.status === 'invalid') {
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        });
    }
    if (order.status === "delivered") {
        return next({
            status: 400,
            message: "A delivered order cannot be changed"
        });
    }
    next();
}

function validateDestroy(req, res, next) {
    if (res.locals.foundOrder.status !== 'pending') {
      next({
        status: 400,
        message: "Order must be pending"
      });
    }
    next();
}

function list(req, res) {
    res.status(200).json({ data: orders });
}

function create(req, res) {
    const order = res.locals.order;
    order.id = nextId()
    orders.push(order);
    res.status(201).json({ data: order});
}

function read(req, res) {
    const foundOrder = res.locals.foundOrder;
    res.status(200).json({ data: foundOrder });
}

function update(req, res) {
    orders[res.locals.orderIndex] = res.locals.order;
    if (!res.locals.order.id) {
        orders[res.locals.orderIndex].id = res.locals.orderId;
    }
    res.status(200).json({ data: res.locals.order });
}

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