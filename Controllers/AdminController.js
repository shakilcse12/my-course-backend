// adminController.js
const User = require('../Data/Models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Pagination
    const users = await User.find()
      .limit(parseInt(limit)) // Limit the number of users returned
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(); // Total count for pagination
    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: 'Server Timeout Error' });
  }
};
