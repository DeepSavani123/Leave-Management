const Role = require("../models/role");
const messages = require("../constants/messages.js");  
const { role, error } = messages;

const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const isRoleExist = await Role.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (isRoleExist) {
      return res.status(400).json({ success: false, message: role.alreadyExists });
    }

    await Role.create({ name });

    return res.status(201).json({ success: true, message: role.createdSuccess });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError});
  }
};

module.exports = {
  createRole,
};

// const roleOptions = async (req, res) => {
//     try {
//         const roleOptions = await Role.aggregatae([
//             {
//                 $addFields: {
//                     lable: "$name",
//                     value: "$_id"
//                 }
//             },
//             {
//                 $project: {
//                     lable: 1,
//                     value: 1,
//                     _id: 0
//                 }
//             }
//         ]);

//         return res.status(200).json({ success: true, data: roleOptions, message: "Role get successfully" });
//     } catch (error) {
//         return res.status(400).json({ success: false, error: error.message });
//     }
// }