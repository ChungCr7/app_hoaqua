const User = require("../models/User");

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Đăng nhập
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("Error logging in:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    phone,
    address,
    country,
    role,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = new User({
      firstname,
      lastname,
      email,
      password,
      phone,
      address,
      country,
      role: role || 2,
      cart: { items: [] },
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        country: newUser.country,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.log("Error creating user:", err);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Cập nhật người dùng
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    firstname,
    lastname,
    email,
    password,
    phone,
    address,
    country,
    role,
  } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname,
        lastname,
        email,
        password,
        phone,
        address,
        country,
        role,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        country: updatedUser.country,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.log("Error updating user:", err);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Xoá người dùng
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
};
