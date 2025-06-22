export const formatTime = (
  time: number | undefined,
  format = "mm:ss"
): string => {
  if (typeof time === "number" && !isNaN(time)) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    // Convert to string and pad with leading zeros if necessary
    const formatMinutes = minutes.toString().padStart(2, "0");
    const formatSeconds = seconds.toString().padStart(2, "0");

    return format.replace("mm", formatMinutes).replace("ss", formatSeconds);
  }
  return "00:00";
};
