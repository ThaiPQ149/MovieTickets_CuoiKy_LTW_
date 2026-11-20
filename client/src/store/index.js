import { configureStore } from "@reduxjs/toolkit";
import seatReducer from "../features/seats/seatSlice";

const store = configureStore({
    reducer: {
        seats: seatReducer
    }
});

export default store;