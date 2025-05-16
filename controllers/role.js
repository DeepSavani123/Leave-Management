const Role = require("../models/role");

const createRole = async (req, res) => {
    console.log(req.body)
    try {

        const { name } = req.body;

        const isRoleExist = await Role.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (isRoleExist) {
            return res.status(400).json({ success: false, message: "Role already exists" });
        }

        await Role.create({ name });

        return res.status(201).json({ success: true, message: "Role created successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
}



module.exports = {
    createRole
}