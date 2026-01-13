const AppError = require("../errors/AppError");
const { randomToken } = require("./tokenHash");
const Redis = require("./mfa.redis");

const MFA_TX_TTL = Number(process.env.MFA_TX_TTL_SEC);
const MFA_OTP_TTL = Number(process.env.MFA_OTP_TTL_SEC);
const MFA_ATT_TTL = Number(process.env.MFA_ATT_TTL_SEC);
const MFA_ATT_MAX = Number(process.env.MFA_ATTEMPTS_MAX);

// create MFA transaction
async function createTransaction(user_id) {
  const tx = randomToken(24);

  await Redis.setTx(tx, user_id, MFA_TX_TTL);

  return { mfa_tx: tx };
}

// store OTP (call after sending OTP)
async function storeOtp(mfa_tx, otp) {
  const user_id = await Redis.getTx(mfa_tx);
  if (!user_id) {
    throw new AppError("MFA_TX_EXPIRED", 410);
  }

  await Redis.setOtp(mfa_tx, otp, MFA_OTP_TTL);
  await Redis.setAttemptTtl(mfa_tx, MFA_ATT_TTL);
}

// verify OTP
async function verifyOtp({ mfa_tx, otp }) {
  const user_id = await Redis.getTx(mfa_tx);
  if (!user_id) {
    throw new AppError("MFA_TX_EXPIRED", 410);
  }

  const attempts = await Redis.getAttempt(mfa_tx);
  if (attempts >= MFA_ATT_MAX) {
    await Redis.clearTx(mfa_tx);
    throw new AppError("MFA_TOO_MANY_ATTEMPTS", 429);
  }

  const savedOtp = await Redis.getOtp(mfa_tx);
  if (!savedOtp) {
    throw new AppError("MFA_OTP_EXPIRED", 410);
  }

  if (String(savedOtp) !== String(otp)) {
    await Redis.incrAttempt(mfa_tx);
    throw new AppError("MFA_OTP_INVALID", 401);
  }

  await Redis.clearTx(mfa_tx);

  return { user_id: Number(user_id) };
}

module.exports = {
  createTransaction,
  storeOtp,
  verifyOtp,
};