import fs from "fs";
export const logRequests = (req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   console.log(`Headers: ${JSON.stringify(req.headers)}`);

  const logData = `[${new Date().toISOString()}] ${req.method} ${
    req.originalUrl
  }\nHeaders: ${JSON.stringify(req.headers)}\n\n`;

  fs.appendFile("requests.log", logData, (err) => {
    if (err) {
      console.error(err);
    }
  });
  next();
};
