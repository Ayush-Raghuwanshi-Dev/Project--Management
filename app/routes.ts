import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("routes/auth/auth-layout.tsx", [
        index("routes/root/home.tsx"),
        route("sign-in","routes/auth/Sign-in.tsx"),
        route("sign-up","routes/auth/Sign-Up.tsx"),
        route("forgot-password","routes/auth/ForgotPassword.tsx"),
        route("reset-password","routes/auth/ResetPassword.tsx"),
        route("verify-email","routes/auth/VerifyEmail.tsx"),
    ]),
] satisfies RouteConfig;
