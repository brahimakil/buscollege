import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    // Validate password match
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setFormError("Password should be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    const success = await register(email, password, name);
    setIsLoading(false);
    
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Admin Registration</h1>
        
        {error && <div className="error-message">{error}</div>}
        {formError && <div className="error-message">{formError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an admin account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 