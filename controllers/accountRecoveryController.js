const {
  AccountRecovery,
  SOCIAL_PLATFORMS,
} = require("../models/AccountRecovery");
const { cloudinary, upload } = require("../config/cloudinary");

// @desc    Submit new account recovery request
// @route   POST /api/account-recovery
// @access  Public
exports.submitRequest = async (req, res) => {
  try {
    const {
      platform,
      username,
      phoneNumber,
      email,
      fullName,
      idNumber,
      description,
    } = req.body;

    // Validate required fields
    const requiredFields = ['platform', 'username', 'phoneNumber', 'email', 'fullName', 'idNumber'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate platform
    if (!Object.values(SOCIAL_PLATFORMS).includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "يرجى اختيار منصة صالحة",
      });
    }

    // Handle uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب إرفاق مستند هوية واحد على الأقل",
      });
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
    
    if (invalidFiles.length > 0) {
      // Cleanup invalid files
      for (const file of invalidFiles) {
        if (file.filename) {
          await cloudinary.uploader.destroy(file.filename);
        }
      }
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG, and PDF files are allowed",
      });
    }

    // Process uploaded files
    const identityDocuments = req.files.map((file) => ({
      secure_url: file.path,
      public_id: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size
    }));

    // Create new recovery request
    const recoveryRequest = new AccountRecovery({
      platform,
      username,
      phoneNumber,
      email,
      fullName,
      idNumber,
      identityDocuments,
      description,
    });

    await recoveryRequest.save();

    res.status(201).json({
      success: true,
      message: "تم تقديم طلب استرجاع الحساب بنجاح",
      data: recoveryRequest,
    });
  } catch (error) {
    // If there's an error, cleanup any uploaded files
    if (req.files) {
      for (const file of req.files) {
        if (file.filename) {
          await cloudinary.uploader.destroy(file.filename);
        }
      }
    }

    console.error("Account recovery request error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تقديم الطلب، يرجى المحاولة مرة أخرى",
    });
  }
};

// @desc    Get all recovery requests
// @route   GET /api/account-recovery
// @access  Private (Admin only)
exports.getAllRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const requests = await AccountRecovery.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AccountRecovery.countDocuments();

    res.json({
      success: true,
      data: requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching recovery requests:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الطلبات",
    });
  }
};

// @desc    Get recovery request by ID
// @route   GET /api/account-recovery/:id
// @access  Private (Admin only)
exports.getRequestById = async (req, res) => {
  try {
    const request = await AccountRecovery.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching recovery request:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الطلب",
    });
  }
};

// @desc    Update recovery request status
// @route   PUT /api/account-recovery/:id
// @access  Private (Admin only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "in-progress", "completed", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "حالة الطلب غير صالحة",
      });
    }

    const request = await AccountRecovery.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    res.json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
      data: request,
    });
  } catch (error) {
    console.error("Error updating recovery request:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الطلب",
    });
  }
};

// @desc    Delete recovery request and its documents
// @route   DELETE /api/account-recovery/:id
// @access  Private (Admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await AccountRecovery.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    // Delete documents from Cloudinary
    for (const doc of request.identityDocuments) {
      if (doc.public_id) {
        await cloudinary.uploader.destroy(doc.public_id);
      }
    }

    // Delete the request from database
    await request.remove();

    res.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    });
  } catch (error) {
    console.error("Error deleting recovery request:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الطلب",
    });
  }
};
