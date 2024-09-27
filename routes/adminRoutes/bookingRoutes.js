const express = require('express');
const { bookingControllers } = require('../../controllers');

const bookingRoute = express.Router();

bookingRoute.get('/get-bookings', bookingControllers.getAllBookings);
bookingRoute.post('/add-booking', bookingControllers.addBooking);
bookingRoute.put('/update-booking/:bookingId', bookingControllers.updateBooking);
bookingRoute.delete('/delete-booking/:bookingId', bookingControllers.deleteBooking);
bookingRoute.get('/get-booking/:bookingId', bookingControllers.getBooking);

module.exports = bookingRoute;
