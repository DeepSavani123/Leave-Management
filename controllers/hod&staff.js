const bcrypt = require('bcryptjs');
const User = require("../models/user");
const Role = require('../models/role');
const Leave = require("../models/leave");

//email : "jeel@gmail.com"
//password: "jeel@111"

const adminAddHODAndStaff = async (req, res) => {
    try {
        const { name, email, password, gender, phone, address } = req.body;
        const hodAndStaffRole = await Role.findOne({ name: 'Hod/Staff' })
   

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            gender,
            role: hodAndStaffRole._id
        });

     await Leave.create({
        user_id: student._id,
        total_leave: 30,
        available_leave: 30,
        used_leave: 0,
        attendance_percentage: 0,
        total_working_days: 200,
        academic_year: academicYear,
     });

        return res.status(201).json({ success: true, message: "User created successfully" });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: error.message });
    }
};

const adminEditHODAndStaff = async (req, res) => {
    try {
        const { name, email, gender, phone, address, userId} = req.body;
        const hodAndStaffRole = await Role.findOne({ name: 'Hod/Staff' })

        const existingStudent = await User.findOne({ _id: userId });

        if (!existingStudent) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        await User.updateOne({ _id: userId }, { $set: { name, email, gender, phone, address, role: hodAndStaffRole._id } });

        return res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getByIdHODAndStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await User.findById(id).select('-password');

        return res.status(200).json({ success: true, data: student, message: "Student get successfully!" });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAllHODAndStaff = async (req, res) => {
    try {

        const hodstaffs = await User.aggregate([
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
                                _id: 0
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$role_details",
                }
            },
            {
                $match: {
                    "role_details.name": { $nin: ["Student", "Admin"] }
                }
            },
            {
                $addFields: {
                    roleName: "$role_details.name"
                }
            },
            {
                $project: {
                    role_details: 0,
                    role: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        if (!hodstaffs || hodstaffs.length === 0) return res.status(200).json({ success: false, data: [], message: "Users not found!" })

        return res.status(200).json({ success: true, data: hodstaffs, message: "Users get successfully!" });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


const adminDeleteHODAndStaff = async (req, res) => {
  try {

    const { id } = req.params;

    const hod_and_staff = await User.findOne({ _id: id });

    console.log(hod_and_staff);

    if (!hod_and_staff) {
      return res
        .status(400)
        .json({ success: false, message: "this HOD/Staff is not found!" });
    }

    await User.findByIdAndDelete({
      _id: hod_and_staff._id,
    });

    return res
      .status(200)
      .json({ success: true, message: "HOD/Staff deleted successfully!" });
  } 
  catch(error) {
     return res.status(500).json({ success: false, message: 'Internal Server Error!'})
  }

};

module.exports = {
    adminAddHODAndStaff,
    adminEditHODAndStaff,
    getByIdHODAndStaff,
    getAllHODAndStaff,
    adminDeleteHODAndStaff
};
