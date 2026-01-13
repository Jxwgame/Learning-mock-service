const service = require("./dashboard.service");

async function getStats(req, res, next) {
    try {
        const data = await service.getDashboardStats();
        return res.json({ ok: true, data });
    } catch (e) {
        next(e);
    }
}

module.exports = {
    getStats
};
