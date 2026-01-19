const rateLimiter = (req, res, next) => {
  // 1. Storage (Memory mein data rakhne ke liye)
  if (!global.requestCounts) {
    global.requestCounts = {};
  }

  // 2. User ki IP Address nikalo
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // 3. Rules (5 requests per 60 seconds)
  const LIMIT = 5;
  const WINDOW_MS = 60 * 1000;

  // 4. Agar naya user hai
  if (!global.requestCounts[ip]) {
    global.requestCounts[ip] = {
      count: 1,
      startTime: Date.now(),
    };
    return next();
  }

  // 5. Agar purana user hai
  const userData = global.requestCounts[ip];
  const currentTime = Date.now();
  const timePassed = currentTime - userData.startTime;

  // CASE A: Time Window expire ho gaya (Reset kar do)
  if (timePassed > WINDOW_MS) {
    userData.count = 1;
    userData.startTime = currentTime;
    return next();
  }

  // CASE B: Limit Cross ho gayi (BLOCK KARO 🛑)
  if (userData.count >= LIMIT) {
    // Calculate karo kitne seconds bache hain
    const timeRemaining = Math.ceil((WINDOW_MS - timePassed) / 1000);

    return res.status(429).json({
      error: "Too Many Requests",
      message: `Limit exceeded. Try again in ${timeRemaining} seconds.`,
      retryIn: timeRemaining // Frontend isko use karega Timer ke liye
    });
  }

  // CASE C: Sab sahi hai, count badhao
  userData.count++;
  next();
};

module.exports = rateLimiter;