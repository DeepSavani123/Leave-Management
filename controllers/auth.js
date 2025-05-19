const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');

//student
   // email: "dhruv@gmail.com"
   // password: "dhruv@111"
const registerStudent = async (req, res) => {
    try {

        const { name, email, password, gender, phone, address, image } = req.body;

        console.log(image)
        console.log(name);
        const isUserExist = await User.findOne({ email: email });
        const getStudentRole = await Role.findOne({ name: "Student" });

        if (isUserExist) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: getStudentRole._id,
            image,
            gender,
            phone,
            address
        });

        await Leave.create({
            user_id: user._id,
            total_leave: 30,
            available_leave: 30,
            used_leave: 0,
            attendance_percentage: 0,
            total_working_days: 200,
            academic_year: academicYear,
        })

        return res.status(201).json({ success: true, message: "Student registered successfully" });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const loginUser = await User.findOne({ email: email }).populate('role');

        if (!loginUser) return res.status(400).json({ success: false, message: "Invalid email or password!" });

        const isMatch = await bcrypt.compare(password, loginUser.password);

        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password!" });


        const token = jwt.sign({
            id: loginUser._id,
            role: loginUser.role.name
        }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200)
            .cookie('accessToken', token, {
                httpOnly: false,
                maxAge: 24 * 60 * 60 * 1000,
                secure: true
            })
            .json({ success: true, data: loginUser, token: token, message: "User login successfully!" });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

const logout = (req, res) => {
    res.clearCookie('accessToken');
    return res.status(200).json({ success: true, message: "User logout successfully!" });
}

const getProfile = async(req,res) => {

    try{
        const { id } = req.user
        const profile = await User.findOne({_id: id})

        if(!profile){
            return res.status(400).json({ success: false, message: "user profile is not found!"})
        }

        return res.status(200).json({ success: true, data: profile, message: 'User profile get successfully!'})
    } catch(error){
        return res.status(400).json({ success: false, message: error.message})
    }
   
}

const updateProfile = async(req,res) => {
   try{
        const {
             name,
             email,
             password,
             gender,
             image,
             phone,
             address,
             userId
        } = req.body

        const payload = {
             name,
             email,
             password,
             gender,
             image,
             phone,
             address
        }

        const isUserExists = await User.findOne({_id: userId})

        if(!isUserExists) {
              return res.status(400).json({ success: false, message: "User not Exists!"})
         }

        await User.findByIdAndUpdate({_id: isUserExists._id}, {$set: payload})
        
        return res.status(200).json({ success: true, message: "User Profile updated successfully!"})

   }
   catch(error){
       return res.status(400).json({ success: false, message: error.message})
   }
}

module.exports = {
    registerStudent,
    login,
    logout,
    getProfile,
    updateProfile
};