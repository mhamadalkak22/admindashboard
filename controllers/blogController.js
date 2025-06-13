const Blog = require("../models/Blog");
const { cloudinary } = require("../config/cloudinary");

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Private (Admin only)
exports.createBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, author, date } = req.body;

    // Handle uploaded image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "يجب إرفاق صورة للتدوينة",
      });
    }

    // Create image object
    const image = {
      secure_url: req.file.path,
      public_id: req.file.filename,
    };

    // Create new blog post
    const blog = new Blog({
      title,
      category,
      excerpt,
      content,
      author,
      image,
      date: date || new Date(),
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "تم إنشاء التدوينة بنجاح",
      data: blog,
    });
  } catch (error) {
    // If there's an error, cleanup uploaded image
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    console.error("Blog creation error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء التدوينة، يرجى المحاولة مرة أخرى",
    });
  }
};

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find().sort({ date: -1 }).skip(skip).limit(limit);

    const total = await Blog.countDocuments();

    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب التدوينات",
    });
  }
};

// @desc    Get single blog post
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "التدوينة غير موجودة",
      });
    }

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب التدوينة",
    });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (Admin only)
exports.updateBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, author, date } = req.body;
    const updateData = { title, category, excerpt, content, author, date };

    // If new image is uploaded
    if (req.file) {
      // Get old blog post
      const oldBlog = await Blog.findById(req.params.id);
      if (oldBlog && oldBlog.image.public_id) {
        // Delete old image
        await cloudinary.uploader.destroy(oldBlog.image.public_id);
      }

      // Add new image
      updateData.image = {
        secure_url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "التدوينة غير موجودة",
      });
    }

    res.json({
      success: true,
      message: "تم تحديث التدوينة بنجاح",
      data: blog,
    });
  } catch (error) {
    // If there's an error and new image was uploaded, cleanup
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث التدوينة",
    });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private (Admin only)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "التدوينة غير موجودة",
      });
    }

    // Delete image from Cloudinary
    if (blog.image && blog.image.public_id) {
      await cloudinary.uploader.destroy(blog.image.public_id);
    }

    // Delete the blog post
    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "تم حذف التدوينة بنجاح",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف التدوينة",
    });
  }
};
