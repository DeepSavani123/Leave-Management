const pendingLeaveRequestMessage = ({
  approverName,
  requesterName,
  request,
}) => {
  return {
    subject: "Pending Leave Request Notification",
    text: `
Hello ${approverName},

You have a new pending leave request from ${requesterName}.

🗓 From: ${new Date(request.start_date).toDateString()}
🗓 To: ${new Date(request.end_date).toDateString()}
📋 Reason: ${request.reason}
📝 Type: ${request.leave_type}

Please review it in the Leave Management System.

Thanks,
LMS System
    `,
  };
};

module.exports = {
  pendingLeaveRequestMessage,
};
