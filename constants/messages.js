const messages = {
  auth: {
    emailExists: "Email already exists",
    registerSuccess: "Student registered successfully",
    invalidCredentials: "Invalid email or password!",
    loginSuccess: "User login successfully!",
    logoutSuccess: "User logout successfully!",
    userNotFound: "User not found!",
    profileNotFound: "User profile is not found!",
    profileFetchSuccess: "User profile fetched successfully!",
    profileUpdateSuccess: "User profile updated successfully!",
    passwordIncorrect: "Password does not match!",
    passwordUpdateSuccess: "Password updated successfully!",
    emailSent: "Email sent successfully",
    emailFailed: "Failed to send email",
    otpExpired: "Invalid or expired OTP!",
    otpVerified: "OTP verified successfully!",
    passwordResetSuccess: "Password reset successfully",
  },

  error: {
    serverError: "Internal Server Error!",
    defaultError: "Something went wrong. Please try again!",
  },

  user: {
    notExist: "User does not exist!",
  },

  leave: {
    notFound: "Leave not found!",
    fetchSuccess: "Leave fetched successfully!",
    reportFetchSuccess: "Leave report fetched successfully!",
    reportFetchFailed: "Failed to fetch leave report!",
    applySuccess: "Leave applied successfully!",
    updateSuccess: "Leave request updated successfully!",
    deleteSuccess: "Leave request deleted successfully!",
    exceedsLimit: "Cannot approve leave: exceeds total leave limit!",
    recordNotFound: "Leave record not found!",
    leaveRequestNotFound: "Leave request not found!",
    leaveRequestsNotFound: "No leave requests are found!",
    leaveRequestFetched: "Leave request fetched successfully!",
    leaveRequestsFetched: "Leave requests fetched successfully!",
    leaveRequestsEmpty: "No leave requests available!",
    leaveRequestUpdated: "Leave request status updated successfully!",
    leaveRequestApproved: "Leave request approved successfully!",
    leaveRequestRejected: "Leave request rejected successfully!",
    allLeavesFetched: "All leaves are fetched successfully!",
    leavesNotFound: "Leaves are not found!",
  },

  leaveRequest: {
    fetchSuccess: "Leave requests fetched successfully!",
    notFound: "Leave request not found!",
    approveSuccess: "Leave request approved successfully!",
    rejectSuccess: "Leave request rejected successfully!",
    statusUpdateSuccess: "Leave request status updated successfully!",
    noRequestsFound: "No leave requests found!",
    requestToUsersNotFound: "Users are not found for leave request!",
    requestToUsersFound: "Users are found for leave request!",
  },

  role: {
    alreadyExists: "Role already exists!",
    createdSuccess: "Role created successfully!",
    fetchSuccess: "Roles fetched successfully!",
    fetchFailed: "Failed to fetch roles!",
  },

  hodStaff: {
    userExists: "User already exists!",
    createdSuccess: "HOD/Staff created successfully!",
    updatedSuccess: "HOD/Staff updated successfully!",
    notFound: "HOD/Staff not found!",
    deletedSuccess: "HOD/Staff deleted successfully!",
    fetchSuccess: "HOD/Staff retrieved successfully!",
  },

  student: {
    alreadyExists: "Student already exists!",
    addSuccess: "Student added successfully!",
    updateSuccess: "Student updated successfully!",
    deleteSuccess: "Student deleted successfully!",
    notFound: "Student not found!",
    fetchSuccess: "Student fetched successfully!",
    fetchAllSuccess: "Students fetched successfully!",
    fetchAllNotFound: "Students not found!",
  },
};

module.exports = messages;
