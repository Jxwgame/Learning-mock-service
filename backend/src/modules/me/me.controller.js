const service = require("./me.service");

async function getMe(req, res, next) {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    }

    const data = await service.getMe({
      user_id,
      request_id: req.ctx.request_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function updateMe(req, res, next) {
  try {
    const user_id = req.user?.user_id;
    const { first_name, last_name } = req.body;

    if (!user_id) {
      return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    }

    const data = await service.updateMe({
      user_id,
      first_name,
      last_name,
      request_id: req.ctx?.request_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { getMe, updateMe };
