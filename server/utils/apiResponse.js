/**
 * Standard API Response Formatter
 * Guarantees { success, data, message } format on all endpoints.
 */
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      data: errors,
      message,
    });
  }
}

module.exports = ApiResponse;
