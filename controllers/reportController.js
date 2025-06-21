const Report = require("../models/Report");
const { cloudinary } = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail").default;

// @desc    Submit new fake account report
// @route   POST /api/reports
// @access  Public
exports.submitReport = async (req, res) => {
  try {
    const { fakeAccount, personalInfo, realAccounts, attachments } = req.body;

    // Handle both direct file uploads and Cloudinary URLs
    let idImage = null;
    let screenshots = [];
    let additionalDocuments = [];
    let identityProof = [];

    // Process files from direct uploads
    if (req.files) {
      if (req.files.idImage) {
        idImage = {
          secure_url: req.files.idImage[0].path,
          public_id: req.files.idImage[0].filename,
        };
      }

      if (req.files.screenshots) {
        screenshots = req.files.screenshots.map((file) => ({
          secure_url: file.path,
          public_id: file.filename,
        }));
      }

      if (req.files.additionalDocuments) {
        additionalDocuments = req.files.additionalDocuments.map((file) => ({
          secure_url: file.path,
          public_id: file.filename,
        }));
      }

      if (req.files.identityProof) {
        identityProof = req.files.identityProof.map((file) => ({
          secure_url: file.path,
          public_id: file.filename,
        }));
      }
    }

    // Process files from Cloudinary URLs
    if (attachments) {
      if (attachments.idImages && attachments.idImages.length > 0) {
        idImage = {
          secure_url: attachments.idImages[0].url,
          public_id: attachments.idImages[0].public_id,
        };
      }

      if (attachments.screenshots) {
        screenshots = attachments.screenshots.map((file) => ({
          secure_url: file.url,
          public_id: file.public_id,
        }));
      }

      if (attachments.additionalDocuments) {
        additionalDocuments = attachments.additionalDocuments.map((file) => ({
          secure_url: file.url,
          public_id: file.public_id,
        }));
      }

      if (attachments.identityProof) {
        identityProof = attachments.identityProof.map((file) => ({
          secure_url: file.url,
          public_id: file.public_id,
        }));
      }
    }

    // Validate that we have at least one document
    if (!idImage && screenshots.length === 0 && additionalDocuments.length === 0 && identityProof.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب إرفاق المستندات المطلوبة",
      });
    }

    // Create new report
    const report = new Report({
      fakeAccount,
      documents: {
        idImage,
        screenshots,
        additionalDocuments,
      },
      personalInfo: {
        ...personalInfo,
        identityProof,
      },
      realAccounts,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "تم تقديم البلاغ بنجاح",
      data: report,
    });

    // Send admin alert email only after successful response
    const adminEmail = process.env.EMAIL_ADDRESS;
    const subject = "New Report Submitted";
    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px #0001; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #4f8cff, #38c6d9); color: #fff; padding: 24px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">🚨</div>
          <h2 style="margin: 0; font-size: 1.6em;">Admin Alert</h2>
        </div>
        <div style="padding: 24px 32px;">
          <p style="font-size: 1.1em; margin-bottom: 16px;">
            <b>New Report</b> has just been submitted!
          </p>
          <table style="width: 100%; font-size: 1em; margin-bottom: 16px;">
            <tr><td><b>Fake Account Username:</b></td><td>${fakeAccount?.username || '-'}</td></tr>
            <tr><td><b>Platform:</b></td><td>${fakeAccount?.platform || '-'}</td></tr>
            <tr><td><b>Account Link:</b></td><td>${fakeAccount?.accountLink || '-'}</td></tr>
            <tr><td><b>Reporter Name:</b></td><td>${personalInfo?.firstName || '-'} ${personalInfo?.lastName || '-'}</td></tr>
            <tr><td><b>Email:</b></td><td>${personalInfo?.email || '-'}</td></tr>
            <tr><td><b>ID Number:</b></td><td>${personalInfo?.idNumber || '-'}</td></tr>
            <tr><td><b>Description:</b></td><td>${fakeAccount?.description || '-'}</td></tr>
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
      const allFiles = [
        ...(req.files.idImage || []),
        ...(req.files.screenshots || []),
        ...(req.files.additionalDocuments || []),
        ...(req.files.identityProof || []),
      ];

      for (const file of allFiles) {
        if (file.filename) {
          await cloudinary.uploader.destroy(file.filename);
        }
      }
    }

    console.error("Report submission error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تقديم البلاغ، يرجى المحاولة مرة أخرى",
    });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Admin only)
exports.getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments();

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب البلاغات",
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private (Admin only)
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "البلاغ غير موجود",
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب البلاغ",
    });
  }
};