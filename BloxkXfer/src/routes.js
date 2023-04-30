import UserProfile from "views/UserProfile.js";
import Login from "components/Login/Login";
import Payment from "views/Payment";
import OTPForm from "views/OTPForm";
import OTPVerifyForm from "views/OTP-VerificationForm";
import TransactionsList from "views/transactions";
import RequestsList from "views/requests";

const dashboardRoutes = [
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-circle-09",
    component: Login,
    layout: "/app",
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/app"
  },
  {
    path: "/payment",
    name: "Send/Request",
    icon: "nc-icon nc-notes",
    component: Payment,
    layout: "/app"
  },
  {
    path: "/transaction",
    name: "Transactions",
    icon: "nc-icon nc-notes",
    component: TransactionsList,
    layout: "/app"
  },
  {
    path: "/requests",
    name: "Requests",
    icon: "nc-icon nc-notes",
    component: RequestsList,
    layout: "/app"
  },
  {
    path: "/getotp",
    name: "GetOTP",
    icon: "nc-icon nc-notes",
    component: OTPForm,
    layout: "/app",
    redirect: true
  },
  {
    path: "/verifyotp",
    name: "VerifyOTP",
    icon: "nc-icon nc-notes",
    component: OTPVerifyForm,
    layout: "/app",
  }
];

export default dashboardRoutes;
