// middleware to check if user is authenticated to vist admin routes
// every request to /admin/* will go through this middleware
const adminAuth = (req, res, next) => {
    const isAuthenticated = true; // This should be replaced with real authentication logic
    if (isAuthenticated) {
        next();
    } else {
        res.status(401).send('unauthorized');
    }
}

module.exports = { adminAuth }