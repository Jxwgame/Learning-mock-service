const { getRedis } = require("../../config/redis");

const txKey = (tx) => `mfa:tx:${tx}`;
const otpKey = (tx) => `mfa:otp:${tx}`;
const attKey = (tx) => `mfa:att:${tx}`;

async function setTx(tx, user_id, ttlSec) {
  const redis = getRedis();
  await redis.set(txKey(tx), String(user_id), {
    EX: ttlSec,
  });
}

async function getTx(tx) {
  const redis = getRedis();
  return redis.get(txKey(tx));
}

async function setOtp(tx, otp, ttlSec) {
  const redis = getRedis();
  await redis.set(otpKey(tx), String(otp), {
    EX: ttlSec,
  });
}

async function getOtp(tx) {
  const redis = getRedis();
  return redis.get(otpKey(tx));
}

async function incrAttempt(tx) {
  const redis = getRedis();
  return redis.incr(attKey(tx));
}

async function getAttempt(tx) {
  const redis = getRedis();
  const v = await redis.get(attKey(tx));
  return v ? Number(v) : 0;
}

async function setAttemptTtl(tx, ttlSec) {
  const redis = getRedis();
  await redis.expire(attKey(tx), ttlSec);
}

async function clearTx(tx) {
  const redis = getRedis();
  await redis.del(txKey(tx), otpKey(tx), attKey(tx));
}

module.exports = {
  setTx,
  getTx,
  setOtp,
  getOtp,
  incrAttempt,
  getAttempt,
  setAttemptTtl,
  clearTx,
};