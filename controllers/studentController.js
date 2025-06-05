const Leave = require("../models/leave");
const bcrypt = require("bcryptjs");
const Role = require("../models/role");
const User = require("../models/user");
const { student, error } = require("../constants/messages");

const adminAddStudent = async (req, res) => {
  try {
    const { name, email, password, gender, phone, address } = req.body;
    const studentRole = await Role.findOne({ name: "Student" });

    const existingStudent = await User.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: student.alreadyExists });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const studentData = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      gender,
      role: studentRole._id,
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    await Leave.create({
      user_id: studentData._id,
      total_leave: 30,
      available_leave: 30,
      used_leave: 0,
    });

    return res.status(201).json({ success: true, message: student.addSuccess });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError});
  }
};

const adminEditStudent = async (req, res) => {
  try {
    const { name, email, gender, phone, address, studentId } = req.body;
    const studentRole = await Role.findOne({ name: "Student" });

    const existingStudent = await User.findOne({ _id: studentId });
    if (!existingStudent) {
      return res.status(400).json({ success: false, message: student.notFound });
    }

    await User.updateOne(
      { _id: studentId },
      { $set: { name, email, gender, phone, address, role: studentRole._id } }
    );

    return res.status(200).json({ success: true, message: student.updateSuccess });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError});
  }
};

const getByIdStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const studentData = await User.findById(id).select("-password");

    return res.status(200).json({
      success: true,
      data: studentData,
      message: student.fetchSuccess,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sort,
    } = req.query;

    const getStudentRole = await Role.findOne({ name: "Student" });

    const searchFilter = {
      role: getStudentRole._id,
    };

    if (search) {
      searchFilter.name = { $regex: search, $options: "i" };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let sortOptions = { createdAt: -1 };

    if (sort) {
      sortOptions = {};
      const [key, order] = sort.split(":");
      sortOptions[key] = order === "asc" ? 1 : -1;
    }

    const students = await User.aggregate([
      {
        $match: searchFilter,
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role_details",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$role_details",
        },
      },
      {
        $addFields: {
          roleName: "$role_details.name",
        },
      },
      {
        $project: {
          role_details: 0,
          role: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: skip,
      },
      {
        $limit: limitNumber,
      },
    ]);

    const totalStudents = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalStudents / limitNumber);

    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: student.fetchAllNotFound });
    }

    return res.status(200).json({
      success: true,
      data: students,
      totalStudents,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
      message: student.fetchAllSuccess,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

const adminDeleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const studentData = await User.findOne({ _id: id });

    if (!studentData) {
      return res.status(400).json({ success: false, message: student.notFound });
    }

    await User.findByIdAndDelete({ _id: studentData._id });

    return res.status(200).json({ success: true, message: student.deleteSuccess });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError});
  }
};

module.exports = {
  adminAddStudent,
  adminEditStudent,
  getByIdStudent,
  getAllStudents,
  adminDeleteStudent,
};
