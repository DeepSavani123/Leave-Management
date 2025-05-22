    const Messages = {
    Auth: {
        EMAIL_EXISTS: "Email already exists.",
        REGISTER_SUCCESS: "Student registered successfully.",
        LOGIN_SUCCESS: "User login successfully!",
        INVALID_CREDENTIALS: "Invalid email or password!",
        LOGOUT_SUCCESS: "User logout successfully!",
        PROFILE_NOT_FOUND: "User profile is not found!",
        PROFILE_FETCHED: "User profile fetched successfully!",
        PROFILE_UPDATED: "User profile updated successfully!",
        USER_NOT_EXIST: "User not exists!"
    },

    LeaveReq: {
        APPLIED_SUCCESS: "Leave applied successfully!",
        FETCH_SUCCESS: "Leave requests fetched successfully!",
        FETCH_ONE_SUCCESS: "Leave request fetched successfully!",
        UPDATED_SUCCESS: "Leave request updated successfully!",
        DELETED_SUCCESS: "Leave request deleted successfully!",
        DELETE_FAILED: "Leave request not found!",
        APPROVAL_SUCCESS: (status) => `Leave request ${status?.toLowerCase()} successfully!`,
        NOT_FOUND: "Leave request not found!",
        NO_LEAVE_REQUESTS: "Not any leave requests are found!",
    },

    Leave: {
        NOT_FOUND: "Leave not found!",
        FETCH_SUCCESS: "Leave fetched successfully!"
    },

    HODStaff: {
        USER_EXISTS: "User already exists!",
        USER_CREATED: "User created successfully",
        USER_RETRIEVED: "Users retrieved successfully!",
        USER_UPDATED: "User updated successfully",
        USER_NOT_FOUND: "User not found!",
        SINGLE_USER_FETCHED: "Student fetched successfully!",
        USER_DELETED: "HOD/Staff deleted successfully!",
        USER_DELETE_ERROR: "This HOD/Staff is not found!"
    },

    AdminLeave: {
        ALL_FETCH_SUCCESS: "All leaves are fetched successfully!",
        NOT_FOUND: "Leaves are not found!"
    },

    Dropdown: {
        USERS_NOT_FOUND: "Users are not found for request to leave!",
        USERS_FETCHED: "Users are found for leave request"
    },

    Role: {
        ALREADY_EXISTS: "Role already exists",
        CREATED_SUCCESS: "Role created successfully"
    },

    Student: {
        CREATED_SUCCESS: "Student created successfully!",
        ALREADY_EXISTS: "Student already exists!",
        FETCH_ALL_SUCCESS: "All students fetched successfully!",
        FETCH_ONE_SUCCESS: "Student fetched successfully!",
        UPDATE_SUCCESS: "Student updated successfully!",
        DELETE_SUCCESS: "Student deleted successfully!",
        NOT_FOUND: "Student not found!",
        DELETE_FAILED: "Student could not be deleted!"
    },

    Common: {
        SERVER_ERROR: "Internal Server Error!",
        SOMETHING_WENT_WRONG: "Something went wrong. Please try again later."
    }
    };

module.exports = Messages;
