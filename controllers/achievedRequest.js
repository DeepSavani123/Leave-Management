const mongoose = require("mongoose");
const LeaveRequest = require("../models/leaveRequest");
const messages = require("../constants/messages");

const { LeaveRequest: LeaveRequestMessages, Common } = messages;

const leaveRequestAchieved = async (req, res) => {
  try {
    const { id } = req.user;
    const { page = 1, limit = 10, search = "", sort } = req.query;

    let searchFilter = { request_to_id: new mongoose.Types.ObjectId(id) };

    if (search) {
      searchFilter.name = { $regex: search, $options: "i" };
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

    const achievedLeave = await LeaveRequest.aggregate([
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
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const requestAchieved = achievedLeave[0]?.data;
    const totalLeaves = achievedLeave[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalLeaves / limitNumber);

    if (!requestAchieved || requestAchieved.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: LeaveRequestMessages.NO_LEAVE_REQUESTS,
        });
    }

    return res.status(200).json({
      success: true,
      data: requestAchieved,
      page: pageNumber,
      limit: limitNumber,
      totalLeaves,
      totalPages,
      message: LeaveRequestMessages.FETCH_SUCCESS,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: Common.SOMETHING_WENT_WRONG });
  }
};

module.exports = {
  leaveRequestAchieved,
};
