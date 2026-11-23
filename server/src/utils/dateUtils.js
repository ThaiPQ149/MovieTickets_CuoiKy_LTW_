const DAY_MS = 24 * 60 * 60 * 1000;

export const parseDayRange = (dateStr) => {
    if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return null;
    }

    const start = new Date(`${dateStr}T00:00:00+07:00`);
    if (Number.isNaN(start.getTime())) {
        return null;
    }

    return { start, end: new Date(start.getTime() + DAY_MS) };
};

export const formatTimeVN = (date) =>
    new Date(date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh"
    });