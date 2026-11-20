import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = ({ _id, role }) =>
    jwt.sign({ id: _id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });

const toUserResponse = ({ _id, name, email, phone, role }) => ({
    id: _id,
    name,
    email,
    phone,
    role
});

export const register = async (req, res) => {
    const { name = "", email = "", password = "", phone = "" } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const errors = {};
    if (name.trim().length < 2) errors.name = "Tên phải có ít nhất 2 ký tự";
    if (!EMAIL_REGEX.test(cleanEmail)) errors.email = "Email không hợp lệ";
    if (password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    if (await User.exists({ email: cleanEmail })) {
        return res.status(409).json({
            message: "Email đã được sử dụng",
            errors: { email: "Email đã được sử dụng" }
        });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashed,
        phone
    });

    res.status(201).json({ token: signToken(user), user: toUserResponse(user) });
};

export const login = async (req, res) => {
    const { email = "", password = "" } = req.body;

    if (!email.trim() || !password) {
        return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    const isMatch = user && (await bcrypt.compare(password, user.password));

    if (!isMatch) {
        return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    res.json({ token: signToken(user), user: toUserResponse(user) });
};

export const getMe = (req, res) => {
    res.json({ user: toUserResponse(req.user) });
};