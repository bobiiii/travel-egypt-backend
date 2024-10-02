const { BookingModel, TourModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { ErrorHandler } = require('../../utils/errohandler');

const getBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await BookingModel.findById(bookingId);

  if (!booking) {
    return next(new ErrorHandler('Booking not Found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',

      data: booking,
    },
  );
});

const getAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await BookingModel.find({}).exec();

  if (!bookings.length ) {
    return next(new ErrorHandler('no bookings found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',

      data: bookings,
    },
  );
});

const addBooking = asyncHandler(async (req, res, next) => {
  const {
    tourId, participants, date, language, name, phoneNumber, email,
  } = req.body;

  if (!tourId || !participants || !date || !language || !name || !phoneNumber || !email) {
    return next(new ErrorHandler('please fill all fileds', 400));
  }

  const tour = await TourModel.findById(tourId);
  if (!tour) {
    return next(new ErrorHandler('Tour doesn\'t exist', 404));
  }
  const { priceAdult, priceChild, priceInfant } = tour;
  const totalAdultPrice = priceAdult * participants.adults;
  const totalChildrenPrice = priceChild * participants.children;
  const totalInfantPrice = priceInfant * participants.infant;
  const discountAdultPrice = participants.adults ? totalAdultPrice - (participants.adults * discountAmount) : 0
  const discountChildPrice = participants.children  ? totalChildrenPrice - (participants.children * discountAmount) : 0
  const discountInfantPrice =participants.infant ? totalInfantPrice - (participants.infant * discountAmount) : 0

  const discountAmount = tour.discountAmount;
  const totalPrice = totalAdultPrice + totalChildrenPrice + totalInfantPrice
  const totalPriceAfterDiscount = discountAdultPrice + discountChildPrice + discountInfantPrice


  const bookingData = {
    ...req.body,
    totalPrice,
  };
  const booking = await BookingModel.create({
    tourId,
    email,
    name,
    phoneNumber,
    language,
    status : "Pending",
    participants,
    date,

    totalAdultPrice,
    totalChildrenPrice,
    totalInfantPrice,
    discountAdultPrice,
    discountChildPrice,
    discountInfantPrice,
    totalPrice,
    discountAmount,
    totalPriceAfterDiscount
  });

  if (!booking) {
    return next(new ErrorHandler('Unable To add Booking', 500));
  }
  return res.status(200).json({
    status: 'Success',
    message: 'Booking add successfully',
    data: booking,
  });
});

const updateBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const booking = await BookingModel.findByIdAndUpdate(bookingId, req.body, { new: true });

  if (!booking) {
    return next(new ErrorHandler('Booking doesn\'t exist', 404));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Booking updated Successfully',
    data: booking,
  });
});

const deleteBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const booking = await BookingModel.findByIdAndDelete(bookingId);

  if (!booking) {
    return next(new ErrorHandler('Booking doesn\'t exist', 404));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Delete Booking Successfully',
    data: booking,
  });
});

module.exports = {
  getAllBookings, getBooking, addBooking, updateBooking, deleteBooking,
};
