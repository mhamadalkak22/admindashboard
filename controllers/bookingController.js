const {
  Booking,
  SERVICE_TYPES,
  AVAILABLE_TIMES,
  PLATFORMS,
} = require("../models/Booking");
const sendEmail = require("../utils/sendEmail").default;

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    // Debug: Log the entire request body

    const {
      fullName,
      phoneNumber,
      email,
      platform,
      serviceType,
      appointmentDate,
      appointmentTime,
      additionalNotes,
    } = req.body;

    // Validate service type
    const arabicServiceName = SERVICE_TYPES[serviceType];
    if (!arabicServiceName) {
      return res.status(400).json({
        success: false,
        message: "نوع الخدمة غير صحيح",
        validServices: SERVICE_TYPES,
      });
    }

    // Validate appointment time
    if (!AVAILABLE_TIMES.includes(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: "وقت الموعد غير صحيح",
        validTimes: AVAILABLE_TIMES,
      });
    }

    // Validate appointment date
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "تاريخ الموعد غير صحيح",
      });
    }

    // Check if date is in the past
    if (date < new Date()) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حجز موعد في تاريخ سابق",
      });
    }

    // Debug: Log the validated date

    // Check if the time slot is available
    const existingBooking = await Booking.findOne({
      appointmentDate: date,
      appointmentTime: appointmentTime,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "هذا الموعد محجوز مسبقاً، يرجى اختيار وقت آخر",
      });
    }

    // Create and save the booking
    const booking = new Booking({
      fullName,
      phoneNumber,
      email,
      platform,
      serviceType: arabicServiceName,
      appointmentDate: date,
      appointmentTime,
      additionalNotes,
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      success: true,
      message: "تم تقديم طلبك بنجاح",
      data: savedBooking,
    });

    // Send admin alert email only after successful response
    const adminEmail = process.env.EMAIL_ADDRESS;
    const subject = "New Booking Submitted";
    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px #0001; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #4f8cff, #38c6d9); color: #fff; padding: 24px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">🚨</div>
          <h2 style="margin: 0; font-size: 1.6em;">Admin Alert</h2>
        </div>
        <div style="padding: 24px 32px;">
          <p style="font-size: 1.1em; margin-bottom: 16px;">
            <b>New Booking</b> has just been submitted!
          </p>
          <table style="width: 100%; font-size: 1em; margin-bottom: 16px;">
            <tr><td><b>Full Name:</b></td><td>${fullName}</td></tr>
            <tr><td><b>Email:</b></td><td>${email}</td></tr>
            <tr><td><b>Phone Number:</b></td><td>${phoneNumber}</td></tr>
            <tr><td><b>Platform:</b></td><td>${platform}</td></tr>
            <tr><td><b>Service Type:</b></td><td>${arabicServiceName}</td></tr>
            <tr><td><b>Appointment Date:</b></td><td>${appointmentDate}</td></tr>
            <tr><td><b>Appointment Time:</b></td><td>${appointmentTime}</td></tr>
            <tr><td><b>Additional Notes:</b></td><td>${additionalNotes || '-'}</td></tr>
          </table>
          <div style="text-align: center; margin-top: 24px;">
            <a href="#" style="background: #4f8cff; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold;">View in Dashboard</a>
          </div>
        </div>
        <div style="background: #f4f6fb; color: #888; text-align: center; padding: 12px 0; font-size: 0.95em;">
          This is an automated alert from your admin dashboard.
        </div>
      </div>
    </div>
    `;
    sendEmail(adminEmail, subject, html);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تقديم الطلب، يرجى المحاولة مرة أخرى",
    });
  }
};

// @desc    Get all bookings with pagination
// @route   GET /api/bookings
// @access  Private (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;

    // Get total count of bookings
    const totalBookings = await Booking.countDocuments();

    // Get bookings for current page
    const bookings = await Booking.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalItems: totalBookings,
        itemsPerPage: limit,
        hasNextPage: skip + bookings.length < totalBookings,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء جلب الطلبات",
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Admin only)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }
    res.status(500).json({
      message: "حدث خطأ أثناء جلب الطلب",
    });
  }
};
