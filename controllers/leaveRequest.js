const mongoose = require("mongoose")
const LeaveRequest = require("../models/leaveRequest");
const User = require("../models/user");

const applyLeave = async (req, res) => {
    try {
        const { start_date, end_date, request_to_id, leave_type, reason } = req.body;

        await LeaveRequest.create({
            user_id: req.user.id,
            start_date,
            end_date,
            request_to_id,
            leave_type,
            reason,
            status: 'Pending'
        });

        return res.status(201).json({ success: true, message: 'Leave applied successfully' });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};


const getIndividualLeave = async (req, res) => {
  try {
    const { id } = req.user;

    const {
      page = 1,
      limit = 10,
      sort = 'start_date:desc', 
      search = ''
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let sortField = 'start_date';
    let sortOrder = -1; 

    if (sort) {
      console.log(sort)
      const [field, order] = sort.split(':');
      sortField = field?.trim() || 'start_date';
      sortOrder = order?.trim() === 'asc' ? 1 : -1;
    }

    const leave = await LeaveRequest.aggregate([
  
      {
        $lookup: {
          from: 'users',
          localField: 'request_to_id',
          foreignField: '_id',
          as: 'request_to_name',
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
          path: '$request_to_name'
        }
      },
      {
        $addFields: {
          request_to: '$request_to_name.name'
        }
      },

      {
        $match: {
          user_id: new mongoose.Types.ObjectId(id),
          $or: [
               {request_to: { $regex: search, $options : "i"}}
          ]
        }
      },

      {
        $project: {
          start_date: 1,
          end_date: 1,
          leave_type: 1,
          reason: 1,
          status: 1,
          request_to: 1
        }
      },
      {
        $sort: {
          [sortField]: sortOrder
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],   
          data: [
            { $skip: skip },
            { $limit: limitNumber }
          ]
        }
      }
    ]);

    if(!leave || leave.length === 0) {
        return res.status(400).json({ success: false, message: 'Not any leave requests are found!'})
    }

    const data = leave[0].data;
    const total = leave[0].metadata[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      message: 'Leave requests fetched successfully!'
    });

  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { status, id } = req.body;

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest)
      return res.status(404).json({ message: "Leave request not found!" });

    await LeaveRequest.updateOne(
      { _id: leaveRequest._id },
      { $set: { status } }
    );

    if (status.toLowerCase() === "approved") {
      let leaveDays = 0;

      if (leaveRequest.leave_type === "Full day") {
        leaveDays = 1;
      } else if (
        leaveRequest.leave_type === "First half" ||
        leaveRequest.leave_type === "Second half"
      ) {
        leaveDays = 0.5;
      } else {

        const start = new Date(leaveRequest.start_date);
        const end = new Date(leaveRequest.end_date);
        leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }


      await Leave.updateOne(
        { user_id: leaveRequest.user_id },
        { $inc: { used_leave: leaveDays, available_leave: -leaveDays } }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Leave request ${status?.toLowerCase()} successfully!`,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort } = req.query;

    let searchFilter = {};
    if (search) {
      searchFilter = {
        name: { $regex: search, $options: "i" },
      };
    }

    let sortOptions = { createdAt: -1 };
    if (sort) {
      sortOptions = {};
      const [key, order] = sort.split(":");
      sortOptions[key] = order === "asc" ? 1 : -1;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const fetchedLeaves = await LeaveRequest.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
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
          path: "$user",
        },
      },

      {
        $addFields: {
          name: "$user.name",
        },
      },

      {
        $match: searchFilter,
      },

      {
        $project: {
          name: 1,
          start_date: 1,
          end_date: 1,
          leave_type: 1,
          reason: 1,
          status: 1,
        },
      },

      {
        $facet: {
          data: [
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limitNumber },
          ],

          totalCount: [
             { $count: 'count'}
          ]
        },
      },
    ]);

     const allLeaves = fetchedLeaves[0]?.data;
     const totalLeaves = fetchedLeaves[0]?.totalCount[0]?.count || 0

     const totalPages = Math.ceil(totalLeaves/limitNumber)

    if (!allLeaves) {
      return res
        .status(400)
        .json({ success: false, message: "Leaves are not found!" });
    }

    return res.status(200).json({
      success: true,
      data: allLeaves,
      page: pageNumber,
      limit: limitNumber,
      totalLeaves,
      totalPages, 
      message: "All leaves are fetched successfully!",
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};



const requestToOptions = async (req, res) => {
  const { role } = req.user;
  const newRole = role.toLowerCase() === "student" ? "Hod/Staff" : "Admin";

  const options = await User.aggregate([
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
      $match: {
        "role_details.name": newRole,
      },
    },

    {
      $addFields: {
        label: "$name",
        value: "$_id",
      },
    },

    {
      $project: {
        label: 1,
        value: 1,
        _id: 0,
      },
    },
  ]);

  if (!options || options.length === 0) {
    return res.status(400).json({
      success: false,
      data: [],
      message: "Users are not found for request to leave!",
    });
  }

  console.log(options);

  return res.status(200).json({
    success: true,
    data: options,
    message: "Users are found for leave request",
  });
};


module.exports = {
    applyLeave,
    getIndividualLeave,
    requestToOptions,
    getAllLeaves,
    approveLeave,
    requestToOptions
}