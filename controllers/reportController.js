const Report = require("../models/Report");
const { cloudinary } = require("../config/cloudinary");

// @desc    Submit new fake account report
// @route   POST /api/reports
// @access  Public
exports.submitReport = async (req, res) => {
  try {
    const { fakeAccount, personalInfo, realAccounts } = req.body;

    // Handle uploaded files
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "يجب إرفاق المستندات المطلوبة",
      });
    }

    // Process ID image
    const idImage = req.files.idImage
      ? {
          secure_url: req.files.idImage[0].path,
          public_id: req.files.idImage[0].filename,
        }
      : null;

    // Process screenshots
    const screenshots = req.files.screenshots
      ? req.files.screenshots.map((file) => ({
          secure_url: file.path,
          public_id: file.filename,
        }))
      : [];

    // Process additional documents
    const additionalDocuments = req.files.additionalDocuments
      ? req.files.additionalDocuments.map((file) => ({
          secure_url: file.path,
          public_id: file.filename,
        }))
      : [];

    // Process identity proof documents
    const identityProof = req.files.identityProof
      ? req.files.identityProof.map((file) => ({
          secure_url: file.path,
          public_id: file.filename,
        }))
      : [];

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
