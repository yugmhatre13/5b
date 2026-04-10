import User from '../models/User.js';

// Create a new user
export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ success: true, count: 1, data: newUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Duplicate field value entered' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Retrieve users (handles filtering & querying)
export const getAllUsers = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from direct matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'hobby', 'search', 'name'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string for advanced filtering (gt, gte, lt, lte) if needed
    // Example: ?age[gte]=18&age[lte]=30
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Parse the filtered query object
    let parsedQuery = JSON.parse(queryStr);

    // 1. Search by name (Regex matching)
    if (req.query.name) {
      parsedQuery.name = { $regex: req.query.name, $options: 'i' };
    }

    // 2. Find by hobbies (If hobby provided, search if it's in the array)
    if (req.query.hobby) {
      parsedQuery.hobbies = { $in: [req.query.hobby] };
    }

    // 3. Text search on bio
    if (req.query.search) {
      parsedQuery.$text = { $search: req.query.search };
    }
    
    // Note: Email and Age are covered by the parsedQuery directly 
    // when passed like ?email=test@test.com&age=25 or ?age[gte]=20

    query = User.find(parsedQuery);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    query = query.skip(startIndex).limit(limit);

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const users = await query;

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the newly updated document
      runValidators: true // Run schema validations again
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
