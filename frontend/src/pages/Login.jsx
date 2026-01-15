import LoginForm from "../components/LoginForm";
import testingImage from "../components/sign.jpg";
import "../styles/signup.css";

export default function Login() {
  return (
    <div className="signup-container">
      <div className="account-creation-form">
        <LoginForm />
      </div>
      <img src={testingImage} alt="Signup Illustration" />
    </div>
  );
}
