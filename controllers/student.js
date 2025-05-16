
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


const getByIdStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await User.findById(id).select('-password');

        return res.status(200).json({ success: true, data: student, message: "Student get successfully!" });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


module.exports = {
    adminAddStudent,
    getByIdStudent,
  
};
