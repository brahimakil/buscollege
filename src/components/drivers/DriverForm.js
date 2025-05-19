import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, shadows, borderRadius } from '../../themes/theme';

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
  }
};

const DriverForm = ({ driver, onSubmit, onCancel }) => {
  // Safely handle the driver prop being null/undefined
  const driverData = driver || {};
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    licenseNumber: '',
    address: '',
    busAssignments: [],
    ...driverData
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Safely check if we're in edit mode
  const isEditMode = !!(driverData && driverData.id);
  
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
    
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
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
          value={formData.name || ''}
          onChange={handleChange}
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
          value={formData.email || ''}
          onChange={handleChange}
          disabled={isEditMode} // Can't change email in edit mode
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
            value={formData.password || ''}
            onChange={handleChange}
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
          value={formData.phoneNumber || ''}
          onChange={handleChange}
        />
        {errors.phoneNumber && <div style={styles.error}>{errors.phoneNumber}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="licenseNumber">Driver License Number</label>
        <input
          type="text"
          id="licenseNumber"
          name="licenseNumber"
          style={styles.input}
          value={formData.licenseNumber || ''}
          onChange={handleChange}
        />
        {errors.licenseNumber && <div style={styles.error}>{errors.licenseNumber}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          style={styles.input}
          value={formData.address || ''}
          onChange={handleChange}
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
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Driver' : 'Create Driver'}
        </button>
      </div>
    </form>
  );
};

// Add defaultProps to guarantee driver is never undefined
DriverForm.defaultProps = {
  driver: null,
  onSubmit: () => {},
  onCancel: () => {}
};

export default DriverForm; 