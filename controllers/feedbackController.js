const Feedback = require("../models/Feedback");
const { cloudinary } = require("../config/cloudinary");

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Public
exports.submitFeedback = async (req, res) => {
  try {
    const { name, feedback, media: mediaString } = req.body;

    let media = null;
    if (req.file) {
      // Determine resource type
      const resourceType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      // Create media object
      media = {
        secure_url: req.file.path,
        public_id: req.file.filename,
        resource_type: resourceType,
      };
    } else if (mediaString) {
      media = mediaString; // Accept media as a string if provided
    }

    // Create new feedback
    const newFeedback = new Feedback({
      media,
      name,
      feedback,
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "تم تقديم الملاحظات بنجاح",
      data: newFeedback,
    });
  } catch (error) {
    // If there's an error, cleanup uploaded file
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    console.error("Feedback submission error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تقديم الملاحظات، يرجى المحاولة مرة أخرى",
    });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private (Admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments();

    res.json({
      success: true,
      data: feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الملاحظات",
    });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private (Admin only)
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "الملاحظات غير موجودة",
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الملاحظات",
    });
  }
};

// @desc    Delete feedback and its media
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "الملاحظات غير موجودة",
      });
    }

    // Delete media from Cloudinary
    if (feedback.media && feedback.media.public_id) {
      await cloudinary.uploader.destroy(feedback.media.public_id, {
        resource_type: feedback.media.resource_type,
      });
    }

    // Delete the feedback from database
    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "تم حذف الملاحظات بنجاح",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الملاحظات",
    });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Admin only)
exports.updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "الملاحظات غير موجودة",
      });
    }

    const { name, feedback: feedbackText, media: mediaString } = req.body;

    // Update text fields if provided
    if (name) feedback.name = name;
    if (feedbackText) feedback.feedback = feedbackText;

    // Check for new media file
    if (req.file) {
      // If there's an old media file, delete it from Cloudinary
      if (feedback.media && feedback.media.public_id) {
        await cloudinary.uploader.destroy(feedback.media.public_id, {
          resource_type: feedback.media.resource_type,
        });
      }

      // Determine resource type
      const resourceType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      // Update with new media
      feedback.media = {
        secure_url: req.file.path,
        public_id: req.file.filename,
        resource_type: resourceType,
      };
    } else if (mediaString) {
      // If a media string is provided, update the media field.
      // This assumes if a string is passed, it's the new media url.
      // If there was an old file in cloudinary it should be deleted.
      if (feedback.media && feedback.media.public_id) {
        await cloudinary.uploader.destroy(feedback.media.public_id, {
          resource_type: feedback.media.resource_type,
        });
      }
      feedback.media = mediaString;
    }

    await feedback.save();

    res.json({
      success: true,
      message: "تم تحديث الملاحظات بنجاح",
      data: feedback,
    });
  } catch (error) {
    // If there's an error and a new file was uploaded, cleanup the new file
    if (req.file && req.file.filename) {
      const resourceType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";
      await cloudinary.uploader.destroy(req.file.filename, {
        resource_type: resourceType,
      });
    }
    console.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الملاحظات",
    });
  }
};
