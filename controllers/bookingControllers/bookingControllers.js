const { BookingModel, TourModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { ErrorHandler } = require('../../utils/errohandler');
const nodemailer = require('nodemailer');

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
  const tourName =  tour.title
  const discountAmount = tour.discountAmount;
  const { priceAdult, priceChild, priceInfant } = tour;
  const totalAdultPrice = priceAdult * participants.adults;
  const totalChildrenPrice = priceChild * participants.children;
  const totalInfantPrice = priceInfant * participants.infant;

  const discountAdultPrice = participants.adults ? totalAdultPrice - (participants.adults * discountAmount) : 0
  const discountChildPrice = participants.children  ? totalChildrenPrice - (participants.children * discountAmount) : 0
  const discountInfantPrice =participants.infant ? totalInfantPrice - (participants.infant * discountAmount) : 0

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
    // status : "Pending",
    participants,
    date,
    tourName,
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


const transporter = nodemailer.createTransport({
    host: 'web153.alfahosting-server.de', // Replace with your SMTP host
    port: 465, // Use 465 for secure connections, 587 for STARTTLS
    secure: true, // Set to true for port 465
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });


const mailOptions = {
    from: email,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Booking Received',
        text: `
Congrats! You have received a new Booking Request.


Booking For: ${tourName}
    name,
    Name: ${name}
    Email: ${email}
    Phone: ${phoneNumber}
    Date: ${date}`,
replyTo: email,
  };
const messageDeliver = await transporter.sendMail(mailOptions);
if (!messageDeliver) {
    return next(ErrorHandler("Unable to send Booking to Admin", 500))
}




const mailOptionsUser = {
  from: process.env.ADMIN_EMAIL, // Or your own dedicated sender address
  to: email,
  subject: `Ihre Buchung für ${tourName} ist bestätigt`,
  html: `
    <h1 style="font-family: Arial, sans-serif;">Buchungsbestätigung für Ihren Ausflug</h1>
    <p style="font-family: Arial, sans-serif;">Sehr geehrte(r) Frau/Herr <strong>${name}</strong>,</p>
    <p style="font-family: Arial, sans-serif;">Vielen Dank für Ihre Buchung! Wir freuen uns, Ihnen Ihre Reservierung für den Ausflug bestätigen zu können.</p>
    <h2 style="font-family: Arial, sans-serif;">Details der Buchung:</h2>
    <ul style="font-family: Arial, sans-serif; list-style-type: disc; margin-left: 20px;">
      <li><strong>Ausflug:</strong> ${tourName}</li>
      <li><strong>Datum:</strong> ${date}</li>
      <li><strong>Treffpunkt:</strong> Wird später entschieden</li>
      <li><strong>Anzahl der Personen:</strong></li>
      <ul style="list-style-type: circle; margin-left: 40px;">
        <li>Erwachsene: ${participants.adults}</li>
        <li>Kinder: ${participants.children}</li>
        <li>Säuglinge: ${participants.infant}</li>
      </ul>
      <li><strong>Preis pro Erwachsener:</strong> ${priceAdult}</li>
      <li><strong>Preis pro Kind:</strong> ${priceChild}</li>
      <li><strong>Preis pro Säugling:</strong> ${priceInfant}</li>
      <li><strong>Gesamtpreis:</strong> ${totalPrice}</li>
    </ul>
    <p style="font-family: Arial, sans-serif;"><strong>Ermäßigung pro Person:</strong> ${discountAmount}</p>
    <p style="font-family: Arial, sans-serif;"><strong>Gesamtpreis nach Rabatt:</strong> ${totalPriceAfterDiscount}</p>
    <h2 style="font-family: Arial, sans-serif;">Weitere Informationen:</h2>
    <ul style="font-family: Arial, sans-serif; list-style-type: disc; margin-left: 20px;">
      <li>Die Abholungszeit wird Ihnen einen Tag vor Reisebeginn via WhatsApp/SMS übermittelt.</li>
      <li>Sollten Sie noch Fragen haben oder Ihre Buchung ändern müssen, kontaktieren Sie uns bitte unter <strong>+49 (0)1523 660 1719</strong> oder <a href="mailto:info@aegyptenmalanders.de">info@aegyptenmalanders.de</a>.</li>
    </ul>
    <p style="font-family: Arial, sans-serif;">Wir wünschen Ihnen einen unvergesslichen Ausflug und freuen uns auf Ihre Teilnahme!</p>
    <p style="font-family: Arial, sans-serif;">Mit freundlichen Grüßen,</p>
    <p style="font-family: Arial, sans-serif;"><strong>Mohamed Ali</strong><br>
    Betriebsleiter<br>
    Visitos for Touristic Marketing<br>
    <a href="https://aegyptenmalanders.de/">https://aegyptenmalanders.de/</a><br>
    Touristic Villages, Hurghada 1,<br>
    Red Sea Governorate 1963002, Ägypten<br>
    +49 (0)1523 660 1719<br>
    +20 1507 650 920</p>
  `,
};

const messageDeliverUser = await transporter.sendMail(mailOptionsUser);
if (!messageDeliverUser) {
  return next(ErrorHandler("Unable to send Booking email to User", 500));
}

  return res.status(200).json({
    status: 'Success',
    message: 'Booking Received! We will get back to you soon.',
    data: booking,
  });
});

const updateBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const {status} = req.body
  
  const booking = await BookingModel.findByIdAndUpdate(bookingId, {status}, { new: true });

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
