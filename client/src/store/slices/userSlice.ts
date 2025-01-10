import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: number | null;
    username: string | null;
    email: string | null;
    isAuthenticated: boolean;
    role: 'student' | 'admin' | null;
}

const initialState: UserState = {
    id: null,
    username: null,
    email: null,
    isAuthenticated: false,
    role: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<Omit<UserState, 'isAuthenticated'>>) => {
            state.id = action.payload.id;
            state.username = action.payload.username;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.isAuthenticated = true;
        },
        clearUser: (state) => {
            state.id = null;
            state.username = null;
            state.email = null;
            state.role = null;
            state.isAuthenticated = false;
        },
        updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
            Object.assign(state, action.payload);
        }
    }
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer; 