const {
  Booking,
  SERVICE_TYPES,
  AVAILABLE_TIMES,
} = require("../models/Booking");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    // Debug: Log the entire request body
    console.log("Request body:", req.body);

    const {
      fullName,
      phoneNumber,
      email,
      serviceType,
      appointmentDate,
      appointmentTime,
      additionalNotes,
    } = req.body;

    // Debug: Log the extracted values
    console.log("Extracted values:", {
      fullName,
      phoneNumber,
      email,
      serviceType,
      appointmentDate,
      appointmentTime,
      additionalNotes,
    });

    // Validate service type
    const arabicServiceName = SERVICE_TYPES[serviceType];
    if (!arabicServiceName) {
      return res.status(400).json({
        message: "نوع الخدمة غير صحيح",
        validServices: SERVICE_TYPES,
      });
    }

    // Validate appointment time
    if (!AVAILABLE_TIMES.includes(appointmentTime)) {
      return res.status(400).json({
        message: "وقت الموعد غير صحيح",
        validTimes: AVAILABLE_TIMES,
      });
    }

    // Validate appointment date
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "تاريخ الموعد غير صحيح",
      });
    }

    // Check if date is in the past
    if (date < new Date()) {
      return res.status(400).json({
        message: "لا يمكن حجز موعد في تاريخ سابق",
      });
    }

    // Debug: Log the validated date
    console.log("Validated date:", date);

    // Check if the time slot is available
    const existingBooking = await Booking.findOne({
      appointmentDate: date,
      appointmentTime: appointmentTime,
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "هذا الموعد محجوز مسبقاً، يرجى اختيار وقت آخر",
      });
    }

    // Create and save the booking
    const booking = new Booking({
      fullName,
      phoneNumber,
      email,
      serviceType: arabicServiceName,
      appointmentDate: date,
      appointmentTime,
      additionalNotes,
    });

    // Debug: Log the booking before save
    console.log("Booking before save:", booking);

    const savedBooking = await booking.save();

    // Debug: Log the saved booking
    console.log("Saved booking:", JSON.stringify(savedBooking, null, 2));

    res.status(201).json({
      success: true,
      message: "تم تقديم طلبك بنجاح",
      data: savedBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
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
