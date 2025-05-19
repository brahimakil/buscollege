import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, shadows, borderRadius } from '../../themes/theme';
import { getBusesForAssignment } from '../../services/riderService';

const styles = {
  form: {
    backgroundColor: colors.background.paper,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm,
    maxWidth: '600px',
    margin: '0 auto'
  },
  formGroup: {
    marginBottom: spacing.lg
  },
  label: {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeightMedium,
    color: colors.text.primary
  },
  input: {
    width: '100%',
    padding: spacing.md,
    fontSize: typography.fontSize,
    border: `1px solid ${colors.border.main}`,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.default,
    color: colors.text.primary
  },
  select: {
    width: '100%',
    padding: spacing.md,
    fontSize: typography.fontSize,
    border: `1px solid ${colors.border.main}`,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.default,
    color: colors.text.primary
  },
  error: {
    color: colors.status.error,
    fontSize: '0.85rem',
    marginTop: spacing.xs
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl
  },
  button: {
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.sm,
    border: 'none',
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeightMedium,
    cursor: 'pointer'
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    color: colors.text.light
  },
  cancelButton: {
    backgroundColor: colors.text.secondary,
    color: colors.text.light
  },
  radioGroup: {
    display: 'flex',
    gap: spacing.lg,
    marginTop: spacing.sm
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    cursor: 'pointer'
  },
  busInfoText: {
    fontSize: '0.85rem',
    color: colors.text.secondary,
    marginTop: spacing.xs
  }
};

const RiderForm = ({ rider, onSubmit, onCancel }) => {
  // Safely handle the rider prop being null/undefined
  const riderData = rider || {};
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    ...riderData
  });
  
  const [buses, setBuses] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Safely check if we're in edit mode
  const isEditMode = !!(riderData && riderData.id);
  
  // Fetch buses for dropdown selection
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const result = await getBusesForAssignment();
        if (result.buses) {
          setBuses(result.buses);
        }
      } catch (error) {
        console.error("Error fetching buses:", error);
      }
    };
    
    fetchBuses();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          style={styles.input}
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
        />
        {errors.name && <div style={styles.error}>{errors.name}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          style={styles.input}
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          disabled={isEditMode} // Can't edit email in edit mode
        />
        {errors.email && <div style={styles.error}>{errors.email}</div>}
      </div>
      
      {!isEditMode && (
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            style={styles.input}
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
          />
          {errors.password && <div style={styles.error}>{errors.password}</div>}
        </div>
      )}
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="phoneNumber">Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          style={styles.input}
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Enter phone number"
        />
        {errors.phoneNumber && <div style={styles.error}>{errors.phoneNumber}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          style={styles.input}
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter home address"
        />
        {errors.address && <div style={styles.error}>{errors.address}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="emergencyContact">Emergency Contact (Optional)</label>
        <input
          type="text"
          id="emergencyContact"
          name="emergencyContact"
          style={styles.input}
          value={formData.emergencyContact || ''}
          onChange={handleChange}
          placeholder="Name and phone number"
        />
      </div>
      
      <div style={styles.buttonGroup}>
        <button 
          type="button" 
          style={{...styles.button, ...styles.cancelButton}}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          style={{...styles.button, ...styles.submitButton}}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Rider' : 'Create Rider'}
        </button>
      </div>
    </form>
  );
};

export default RiderForm; 