const {
  AccountRecovery,
  SOCIAL_PLATFORMS,
} = require("../models/AccountRecovery");
const { cloudinary, upload } = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail").default;

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
    const requiredFields = [
      "platform",
      "username",
      "phoneNumber",
      "email",
      "fullName",
      "idNumber",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate platform
    if (!Object.values(SOCIAL_PLATFORMS).includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "يرجى اختيار منصة صالحة",
      });
    }

    let identityDocuments = [];

    // إذا أرسل ملفات
    if (req.files && req.files.length > 0) {
      identityDocuments = req.files.map((file) => ({
        secure_url: file.path,
        public_id: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
      }));
    }
    // إذا أرسل روابط مباشرة
    else if (req.body.identityDocuments) {
      const docs = Array.isArray(req.body.identityDocuments)
        ? req.body.identityDocuments
        : [req.body.identityDocuments];
    
      identityDocuments = docs.map((url) => {
        // Extract public_id from Cloudinary URL
        const publicId = url.split('/').slice(-1)[0].split('.')[0];
        return {
          secure_url: url,
          public_id: publicId
        };
      });
    }
    
    if (identityDocuments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب إرفاق مستند هوية واحد على الأقل",
      });
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const invalidFiles = req.files?.filter(
      (file) => !allowedTypes.includes(file.mimetype)
    ) || [];

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

    // Send admin alert email only after successful response
    const adminEmail = process.env.EMAIL_ADDRESS;
    const subject = "New Account Recovery Request Submitted";
    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px #0001; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #4f8cff, #38c6d9); color: #fff; padding: 24px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">🚨</div>
          <h2 style="margin: 0; font-size: 1.6em;">Admin Alert</h2>
        </div>
        <div style="padding: 24px 32px;">
          <p style="font-size: 1.1em; margin-bottom: 16px;">
            <b>New Account Recovery Request</b> has just been submitted!
          </p>
          <table style="width: 100%; font-size: 1em; margin-bottom: 16px;">
            <tr><td><b>Full Name:</b></td><td>${fullName}</td></tr>
            <tr><td><b>Email:</b></td><td>${email}</td></tr>
            <tr><td><b>Phone Number:</b></td><td>${phoneNumber}</td></tr>
            <tr><td><b>Platform:</b></td><td>${platform}</td></tr>
            <tr><td><b>Username:</b></td><td>${username}</td></tr>
            <tr><td><b>ID Number:</b></td><td>${idNumber}</td></tr>
            <tr><td><b>Description:</b></td><td>${description || '-'}</td></tr>
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

// @desc    Get single recovery request
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