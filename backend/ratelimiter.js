// backend/rateLimiter.js

const rateLimiter = (req, res, next) => {
  // 1. Storage check
  if (!global.requestCounts) {
    global.requestCounts = {};
  }

  // 2. User Identify (IP Address)
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // 3. Rules Set Karo
  const LIMIT = 5; 
  const WINDOW_MS = 60 * 1000; // 1 Minute

  // 4. New User Logic
  if (!global.requestCounts[ip]) {
    global.requestCounts[ip] = {
      count: 1,
      startTime: Date.now(),
    };
    return next();
  }

  // 5. Existing User Logic
  const userData = global.requestCounts[ip];
  const currentTime = Date.now();
  const timePassed = currentTime - userData.startTime;

  // SCENARIO A: Time Window expire ho gayi (User Safe hai)
  if (timePassed > WINDOW_MS) {
    userData.count = 1;
    userData.startTime = currentTime;
    return next();
  }

  // SCENARIO B: Limit Cross ho gayi (BLOCK KARO 🛑)
  if (userData.count >= LIMIT) {
    // Calculate seconds remaining
    const timeRemaining = Math.ceil((WINDOW_MS - timePassed) / 1000);

    return res.status(429).json({
      error: "Too Many Requests",
      message: `Limit exceeded. Try again in ${timeRemaining} seconds.`,
      retryIn: timeRemaining // Frontend isko use karega countdown ke liye
    });
  }

  // SCENARIO C: Sab sahi hai, count badhao
  userData.count++;
  next();
};

module.exports = rateLimiter;