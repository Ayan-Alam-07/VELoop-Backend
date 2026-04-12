// // const jwt = require("jsonwebtoken");
// // const User = require("../models/User");

// // const authMiddleware = async (req, res, next) => {
// //   try {
// //     const authHeader = req.headers.authorization;

// //     if (!authHeader) {
// //       return res.status(401).json("No token provided");
// //     }

// //     const token = authHeader.split(" ")[1];

// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

// //     req.user = { id: decoded.id };

// //     next();
// //   } catch (error) {
// //     return res.status(401).json("Invalid token");
// //   }
// // };

// // module.exports = authMiddleware;

// import jwt from "jsonwebtoken";

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     console.log("Authorization Header:", authHeader);

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "No token provided",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     console.log("Token:", token);

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("Decoded Token:", decoded);

//     req.user = {
//       id: decoded.id,
//     };

//     next();
//   } catch (error) {
//     console.log("Auth Middleware Error:", error);

//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//       error: error.message,
//     });
//   }
// };

// export default authMiddleware;

const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded);

    req.user = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
