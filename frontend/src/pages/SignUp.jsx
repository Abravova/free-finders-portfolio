import SignUpForm from "../components/SignUpForm";
import testingImage from "../components/sign.jpg";
import "../styles/signup.css";

export default function SignUp() {
  return (
    <div className="signup-container">
      <div className="account-creation-form">
        <SignUpForm />
      </div>
      <img src={testingImage} alt="Signup Illustration" />
    </div>
  );
}
