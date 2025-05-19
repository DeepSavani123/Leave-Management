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

    // Parse sort string (e.g., "request_to:asc")
    let sortField = 'start_date';
    let sortOrder = -1; // default: descending

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
          metadata: [{ $count: 'total' }],      //[ { total : 3 }]
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




module.exports = {
    applyLeave,
    getIndividualLeave,

}