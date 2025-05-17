
const bcrypt = require('bcryptjs');
const Role = require("../models/role");
const User = require("../models/user");

//email: dhruv@gmail.com
//password: dhruv@111

const adminAddStudent = async (req, res) => {
    try {
        const { name, email, password, gender, phone, address } = req.body;
        const studentRole = await Role.findOne({name: "Student"})

        const existingStudent = await User.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: "Student already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const student = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            gender,
            role: studentRole._id
        });



        return res.status(201).json({ success: true, message: "Student added successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const getStudentRole = await Role.findOne({ name: "Student" });

        const students = await User.aggregate([
            {
                $match: {
                    role: getStudentRole._id
                }
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
                $addFields: {
                    roleName: "$role_details.name"
                }
            },
            {
                $project: {
                    role_details: 0,
                    role: 0,
                    password: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);


        if (!students || students.length === 0) return res.status(404).json({ success: false, message: "Students not found!" })

        return res.status(200).json({ success: true, data: students, message: "Students get successfully!" });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}


const getByIdStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await User.findById(id).select('-password');

        return res.status(200).json({ success: true, data: student, message: "Student get successfully!" });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const adminEditStudent = async (req, res) => {
    try {
        const { name, email, gender, phone, address, studentId } = req.body;
        const studentRole = await Role.findOne({ name: "Student" })

        // Check if student with the same register number or email exists
        const existingStudent = await User.findOne({ _id: studentId });
        if (!existingStudent) {
            return res.status(400).json({ success: false, message: "Student not found!" });
        }

        await User.updateOne({ _id: studentId }, { $set: { name, email, gender, phone, address, role:studentRole._id } });

        return res.status(200).json({ success: true, message: "Student updated successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


const adminDeleteStudent = async(req,res) => {
    try{
        const {id} = req.params;

        const student = await User.findOne({_id: id})

        if(!student) {
             return res.status(400).json({ success: false, message: "student not found!"})
        }

        const deleteStudent = await User.findByIdAndDelete({_id: student._id})
        return res.status(200).json({ success: true, message: 'Student deleted successfully!'})
    }
    catch(err){
        return res.status(400).json({ success: false, message: err.message})
    }


}

module.exports = {
    adminAddStudent,
    adminEditStudent,
    getByIdStudent,
    getAllStudents,
    adminDeleteStudent
  
};
