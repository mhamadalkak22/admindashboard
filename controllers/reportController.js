const Report = require("../models/Report");
const { cloudinary } = require("../config/cloudinary");

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

// @desc    Delete report and its documents
// @route   DELETE /api/reports/:id
// @access  Private (Admin only)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "البلاغ غير موجود",
      });
    }

    // Delete all documents from Cloudinary
    const allDocuments = [
      report.documents.idImage,
      ...report.documents.screenshots,
      ...report.documents.additionalDocuments,
      ...report.personalInfo.identityProof,
    ];

    for (const doc of allDocuments) {
      if (doc && doc.public_id) {
        await cloudinary.uploader.destroy(doc.public_id);
      }
    }

    // Delete the report from database
    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "تم حذف البلاغ بنجاح",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف البلاغ",
    });
  }
};
