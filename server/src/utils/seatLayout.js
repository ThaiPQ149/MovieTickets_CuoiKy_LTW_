export const getRowLabels = (totalRows) =>
    Array.from({ length: totalRows }, (_, index) => String.fromCharCode(65 + index));

export const buildSeatLayout = ({ totalRows, seatsPerRow, vipRows = [] }) =>
    getRowLabels(totalRows).flatMap((row) =>
        Array.from({ length: seatsPerRow }, (_, index) => ({
            row,
            number: index + 1,
            type: vipRows.includes(row) ? "vip" : "normal"
        }))
    );