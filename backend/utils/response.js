// const success = (res, data = {}, message = "Success", statusCode = 200) =>
//   res.status(statusCode).json({ success: true, data, message });

// const error = (res, message = "Unable to process request", statusCode = 500, error_code = "SERVER_ERROR") =>
//   res.status(statusCode).json({ success: false, message, error_code });

// module.exports = { success, error };

const success = (
  res,
  data = {},
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const error = (
  res,
  message = "Unable to process request",
  statusCode = 500,
  error_code = "SERVER_ERROR",
  details = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error_code,
    ...(details ? { details } : {}),
  });
};

module.exports = {
  success,
  error,
};
