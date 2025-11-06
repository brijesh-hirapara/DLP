import moment from "moment";

/**
 * Common countdown calculation utility
 * @param {string} startTime - start time in UTC or ISO format
 * @param {number} duration - countdown duration in hours
 * @returns {{hours:number, minutes:number, seconds:number, expired:boolean}}
 */
export const calculateTimeLeft = (startTime: string, duration: number) => {
  if (!startTime) return { hours: 0, minutes: 0, seconds: 0, expired: true };

  const targetTime = moment.utc(startTime).add(duration, "hours").toDate().getTime();
  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, expired: false };
};
