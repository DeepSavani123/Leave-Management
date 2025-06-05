const { CronJob } = require("cron");
const LeaveRequest = require("../models/leaveRequest");
const { pendingLeaveRequestMessage } = require("../mailer/mailMessages.js");
const sendMail = require("../mailer/mail.js");

const job = new CronJob(
  "0 9 * * *",
  async () => {
    console.log("Running cron job: Checking for pending leave requests...");

    try {
      const pendingRequests = await LeaveRequest.find({ status: "Pending" })
        .populate("request_to_id")
        .populate("user_id");
      console.log(pendingRequests);

      for (const request of pendingRequests) {
        const approver = request.request_to_id;
        const requester = request.user_id;

        if (!approver || !approver.email || !requester) {
          console.warn(
            `Skipping request due to missing approver or requester: ${request._id}`
          );
          continue;
        }

        const { subject, text } = pendingLeaveRequestMessage({
          approverName: approver.name,
          requesterName: requester.name,
          request,
        });

        await sendMail({
          to: approver.email,
          subject,
          text,
        });
      }
    } catch (error) {
      console.error("Cron job error:", error.message);
    }
  },
  null,
  false,
  "Asia/Kolkata"
);

module.exports = job;
