import { createSlice } from "@reduxjs/toolkit";

export const MAX_SEATS = 8;

const initialState = {
    showtimeId: null,
    selectedSeats: []
};

const isSameSeat = (a, b) => a.row === b.row && a.number === b.number;

const seatSlice = createSlice({
    name: "seats",
    initialState,
    reducers: {
        setShowtime: (state, { payload }) =>
            state.showtimeId === payload ? state : { showtimeId: payload, selectedSeats: [] },
        toggleSeat: (state, { payload }) => {
            const exists = state.selectedSeats.some((seat) => isSameSeat(seat, payload));
            if (exists) {
                return {
                    ...state,
                    selectedSeats: state.selectedSeats.filter((seat) => !isSameSeat(seat, payload))
                };
            }
            if (state.selectedSeats.length >= MAX_SEATS) {
                return state;
            }
            return { ...state, selectedSeats: [...state.selectedSeats, payload] };
        },
        clearSeats: (state) => ({ ...state, selectedSeats: [] })
    }
});

export const { setShowtime, toggleSeat, clearSeats } = seatSlice.actions;

export default seatSlice.reducer;