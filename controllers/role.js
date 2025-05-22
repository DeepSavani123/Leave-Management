const Role = require("../models/role");
const messages = require('../constants/messages.js');

const { Role: RoleMessages, Common } = messages;

const createRole = async (req, res) => {
    console.log(req.body);
    try {
        const { name } = req.body;

        const isRoleExist = await Role.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (isRoleExist) {
            return res.status(400).json({ success: false, message: RoleMessages.ALREADY_EXISTS });
        }

        await Role.create({ name });

        return res.status(201).json({ success: true, message: RoleMessages.CREATED_SUCCESS });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || Common.SOMETHING_WENT_WRONG });
    }
}

module.exports = {
    createRole
}
