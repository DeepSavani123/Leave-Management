const bcrypt = require("bcryptjs");
const Leave = require("../models/leave");
const User = require("../models/user");
const Role = require("../models/role");
const messages = require("../constants/messages.js");  

const { hodStaff, error } = messages;

const adminAddHODAndStaff = async (req, res) => {
  try {
    const { name, email, password, gender, phone, address } = req.body;
    const hodAndStaffRole = await Role.findOne({ name: "Hod/Staff" });
    console.log(req.body)

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: hodStaff.userExists });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      gender,
      role: hodAndStaffRole._id,
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    await Leave.create({
      user_id: user._id,
      total_leave: 30,
      available_leave: 30,
      used_leave: 0,
    });

    return res.status(201).json({ success: true, message: hodStaff.createdSuccess });
  } catch (err) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

const getAllHODAndStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "" } = req.query;

    const searchFilter = {
      "role_details.name": { $nin: ["Student", "Admin"] },
    };

    if (search) {
      searchFilter.name = { $regex: search, $options: "i" };
    }

    let sortOptions = {};
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions[key] = order === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await User.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role_details",
          pipeline: [{ $project: { name: 1, _id: 0 } }],
        },
      },
      { $unwind: "$role_details" },
      { $addFields: { roleName: "$role_details.name" } },
      { $match: searchFilter },
      {
        $project: {
          role_details: 0,
          role: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      {
        $facet: {
          data: [
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limitNumber },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const hodstaffs = result[0].data;
    const totalStaff = result[0].totalCount[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: hodstaffs,
      totalStaff,
      page: pageNumber,
      limit: limitNumber,
      message: hodStaff.fetchSuccess,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

const adminEditHODAndStaff = async (req, res) => {
  try {
    const { name, email, gender, phone, address, userId } = req.body;
    const hodAndStaffRole = await Role.findOne({ name: "Hod/Staff" });

    const existingUser = await User.findOne({ _id: userId });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: hodStaff.notFound });
    }

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          name,
          email,
          gender,
          phone,
          address,
          role: hodAndStaffRole._id,
        },
      }
    );

    return res.status(200).json({ success: true, message: hodStaff.updatedSuccess });
  } catch (err) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

const getByIdHODAndStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: hodStaff.notFound });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: hodStaff.fetchSuccess,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

const adminDeleteHODAndStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ success: false, message: hodStaff.notFound });
    }

    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({ success: true, message: hodStaff.deletedSuccess });
  } catch (err) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

module.exports = {
  adminAddHODAndStaff,
  adminEditHODAndStaff,
  getByIdHODAndStaff,
  getAllHODAndStaff,
  adminDeleteHODAndStaff,
};
