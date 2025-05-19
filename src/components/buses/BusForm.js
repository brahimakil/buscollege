import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, shadows, borderRadius } from '../../themes/theme';
import { getAllDriversForSelection } from '../../services/busService';

const styles = {
  form: {
    backgroundColor: colors.background.paper,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm,
    maxWidth: '800px',
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
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: typography.fontSize,
    cursor: 'pointer'
  },
  checkbox: {
    marginRight: spacing.xs
  },
  timeInputs: {
    display: 'flex',
    gap: spacing.md,
    alignItems: 'center'
  },
  timeInput: {
    padding: spacing.md,
    fontSize: typography.fontSize,
    border: `1px solid ${colors.border.main}`,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.default,
    color: colors.text.primary,
    width: '150px'
  },
  locationsContainer: {
    marginTop: spacing.md
  },
  locationItem: {
    padding: spacing.md,
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.background.default,
    position: 'relative'
  },
  locationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: colors.status.error,
    cursor: 'pointer',
    fontSize: '1.2rem',
    position: 'absolute',
    top: '10px',
    right: '10px'
  },
  addLocationButton: {
    padding: `${spacing.xs} ${spacing.md}`,
    backgroundColor: colors.secondary.main,
    color: colors.text.light,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    marginTop: spacing.sm,
    fontSize: '0.9rem'
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
  flexRow: {
    display: 'flex',
    gap: spacing.md,
    alignItems: 'center'
  },
  flex1: {
    flex: 1
  },
  locationOrder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: colors.primary.main,
    color: colors.text.light,
    fontWeight: 'bold',
    marginRight: spacing.sm
  }
};

const days = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const emptyLocation = {
  name: '',
  arrivalTimeFrom: '',
  arrivalTimeTo: ''
};

const BusForm = ({ bus, onSubmit, onCancel }) => {
  // Safely handle the bus prop being null/undefined
  const busData = bus || {};
  
  // Convert workingDays object to array if needed
  const workingDaysFromBus = (() => {
    if (!busData.workingDays) return [];
    
    // If workingDays is already an array, use it
    if (Array.isArray(busData.workingDays)) {
      return busData.workingDays;
    }
    
    // If workingDays is an object, convert it to array
    return Object.keys(busData.workingDays).filter(day => busData.workingDays[day]);
  })();
  
  // Ensure numeric values are properly initialized
  const ensureNumeric = (value) => {
    if (value === undefined || value === null || isNaN(parseFloat(value))) {
      return 0;
    }
    return parseFloat(value);
  };
  
  const [formData, setFormData] = useState({
    busName: busData.busName || '',
    busLabel: busData.busLabel || '',
    driverId: busData.driverId || '',
    driverName: busData.driverName || '',
    workingDays: workingDaysFromBus,
    operatingTimeFrom: busData.operatingTimeFrom || '',
    operatingTimeTo: busData.operatingTimeTo || '',
    locations: Array.isArray(busData.locations) ? [...busData.locations] : [],
    pricePerRide: ensureNumeric(busData.pricePerRide),
    pricePerMonth: ensureNumeric(busData.pricePerMonth),
    maxCapacity: ensureNumeric(busData.maxCapacity)
  });
  
  const [drivers, setDrivers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!(busData && busData.id);
  
  // Fetch drivers for dropdown
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const result = await getAllDriversForSelection();
        if (result.drivers) {
          setDrivers(result.drivers);
        }
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    
    fetchDrivers();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle working days checkboxes
      if (name.startsWith('day-')) {
        const day = name.replace('day-', '');
        const updatedWorkingDays = checked
          ? [...formData.workingDays, day]
          : formData.workingDays.filter(d => d !== day);
        
        setFormData({
          ...formData,
          workingDays: updatedWorkingDays
        });
      }
    } else if (name === 'driverId') {
      // Set driver name when driver is selected
      const selectedDriver = drivers.find(driver => driver.id === value);
      setFormData({
        ...formData,
        driverId: value,
        driverName: selectedDriver ? selectedDriver.name : ''
      });
    } else if (type === 'number') {
      // Ensure numeric values are handled properly
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Add a time interval validation function 
  const isTimeIntervalOverlapping = (newStart, newEnd, existingLocations, excludeIndex = -1) => {
    // Convert times to minutes for easier comparison
    const newStartMinutes = convertTimeToMinutes(newStart);
    const newEndMinutes = convertTimeToMinutes(newEnd);
    
    // Check each existing location except the one being edited
    return existingLocations.some((location, index) => {
      // Skip the location being edited
      if (index === excludeIndex) return false;
      
      // Skip locations without proper time data
      if (!location.arrivalTimeFrom || !location.arrivalTimeTo) return false;
      
      // Convert existing location times to minutes
      const existingStartMinutes = convertTimeToMinutes(location.arrivalTimeFrom);
      const existingEndMinutes = convertTimeToMinutes(location.arrivalTimeTo);
      
      // Check for overlap - new interval starts during existing, or ends during existing,
      // or completely contains existing, or is completely contained by existing
      return (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes) ||
        (newStartMinutes >= existingStartMinutes && newEndMinutes <= existingEndMinutes)
      );
    });
  };

  // Helper to convert HH:MM time format to minutes
  const convertTimeToMinutes = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  // Then modify the handleLocationChange function
  const handleLocationChange = (index, field, value) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: value
    };
    
    // Validate time intervals if the field is a time field
    if (field === 'arrivalTimeFrom' || field === 'arrivalTimeTo') {
      const location = updatedLocations[index];
      
      // Only validate if both time fields are filled
      if (location.arrivalTimeFrom && location.arrivalTimeTo) {
        // Check if new time interval overlaps with existing ones
        const isOverlapping = isTimeIntervalOverlapping(
          location.arrivalTimeFrom,
          location.arrivalTimeTo,
          updatedLocations,
          index // Exclude the current location from check
        );
        
        // Set error if overlapping
        if (isOverlapping) {
          setErrors(prev => ({
            ...prev,
            locationErrors: {
              ...(prev.locationErrors || {}),
              [index]: {
                ...(prev.locationErrors?.[index] || {}),
                timeOverlap: 'This time interval overlaps with another location'
              }
            }
          }));
          return; // Don't update state if there's an overlap
        } else {
          // Clear the error if no overlap
          setErrors(prev => {
            if (!prev.locationErrors || !prev.locationErrors[index]) return prev;
            
            const updatedLocationErrors = { ...prev.locationErrors };
            if (updatedLocationErrors[index]) {
              delete updatedLocationErrors[index].timeOverlap;
              
              // If no more errors for this location, remove the object
              if (Object.keys(updatedLocationErrors[index]).length === 0) {
                delete updatedLocationErrors[index];
              }
            }
            
            return {
              ...prev,
              locationErrors: Object.keys(updatedLocationErrors).length > 0 ? updatedLocationErrors : undefined
            };
          });
        }
      }
    }
    
    setFormData({
      ...formData,
      locations: updatedLocations
    });
  };
  
  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { ...emptyLocation }]
    });
  };
  
  const removeLocation = (index) => {
    const updatedLocations = [...formData.locations];
    updatedLocations.splice(index, 1);
    
    setFormData({
      ...formData,
      locations: updatedLocations
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.busName.trim()) {
      newErrors.busName = 'Bus name is required';
    }
    
    if (!formData.driverId) {
      newErrors.driverId = 'Driver selection is required';
    }
    
    if (formData.workingDays.length === 0) {
      newErrors.workingDays = 'At least one working day must be selected';
    }
    
    if (!formData.operatingTimeFrom) {
      newErrors.operatingTimeFrom = 'Operating start time is required';
    }
    
    if (!formData.operatingTimeTo) {
      newErrors.operatingTimeTo = 'Operating end time is required';
    }
    
    if (formData.locations.length === 0) {
      newErrors.locations = 'At least one location must be added';
    } else {
      // Check each location
      const locationErrors = [];
      
      formData.locations.forEach((location, index) => {
        const errors = {};
        
        if (!location.name.trim()) {
          errors.name = 'Location name is required';
        }
        
        if (!location.arrivalTimeFrom) {
          errors.arrivalTimeFrom = 'Arrival time from is required';
        }
        
        if (!location.arrivalTimeTo) {
          errors.arrivalTimeTo = 'Arrival time to is required';
        }
        
        // Check for time overlaps
        if (location.arrivalTimeFrom && location.arrivalTimeTo) {
          if (isTimeIntervalOverlapping(
            location.arrivalTimeFrom,
            location.arrivalTimeTo,
            formData.locations,
            index
          )) {
            errors.timeOverlap = 'This time interval overlaps with another location';
          }
        }
        
        if (Object.keys(errors).length > 0) {
          locationErrors[index] = errors;
        }
      });
      
      if (Object.keys(locationErrors).length > 0) {
        newErrors.locationErrors = locationErrors;
      }
    }
    
    // Ensure numeric values are greater than 0
    if (formData.pricePerRide <= 0) {
      newErrors.pricePerRide = 'Price per ride must be greater than 0';
    }
    
    if (formData.pricePerMonth <= 0) {
      newErrors.pricePerMonth = 'Price per month must be greater than 0';
    }
    
    if (formData.maxCapacity <= 0) {
      newErrors.maxCapacity = 'Maximum capacity must be greater than 0';
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
        <label style={styles.label} htmlFor="busName">Bus Name / ID</label>
        <input
          type="text"
          id="busName"
          name="busName"
          style={styles.input}
          value={formData.busName}
          onChange={handleChange}
          placeholder="Enter bus name or identifier"
        />
        {errors.busName && <div style={styles.error}>{errors.busName}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="busLabel">Bus Label (Optional)</label>
        <input
          type="text"
          id="busLabel"
          name="busLabel"
          style={styles.input}
          value={formData.busLabel}
          onChange={handleChange}
          placeholder="Additional label or description"
        />
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="driverId">Assign Driver</label>
        <select
          id="driverId"
          name="driverId"
          style={styles.select}
          value={formData.driverId}
          onChange={handleChange}
        >
          <option value="">Select a driver</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.name} ({driver.email})
            </option>
          ))}
        </select>
        {errors.driverId && <div style={styles.error}>{errors.driverId}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Working Days</label>
        <div style={styles.checkboxGroup}>
          {days.map(day => (
            <label key={day.value} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                id={`day-${day.value}`}
                name={`day-${day.value}`}
                checked={formData.workingDays.includes(day.value)}
                onChange={handleChange}
                style={styles.checkbox}
              />
              {day.label}
            </label>
          ))}
        </div>
        {errors.workingDays && <div style={styles.error}>{errors.workingDays}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Operating Time</label>
        <div style={styles.timeInputs}>
          <input
            type="time"
            id="operatingTimeFrom"
            name="operatingTimeFrom"
            style={styles.timeInput}
            value={formData.operatingTimeFrom}
            onChange={handleChange}
          />
          <span>to</span>
          <input
            type="time"
            id="operatingTimeTo"
            name="operatingTimeTo"
            style={styles.timeInput}
            value={formData.operatingTimeTo}
            onChange={handleChange}
          />
        </div>
        {errors.operatingTimeFrom && <div style={styles.error}>{errors.operatingTimeFrom}</div>}
        {errors.operatingTimeTo && <div style={styles.error}>{errors.operatingTimeTo}</div>}
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Route Locations</label>
        <div style={styles.locationsContainer}>
          {formData.locations.map((location, index) => (
            <div key={index} style={styles.locationItem}>
              <div style={styles.locationHeader}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={styles.locationOrder}>{index + 1}</div>
                  <h4>Location {index + 1}</h4>
                </div>
                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={() => removeLocation(index)}
                >
                  ×
                </button>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor={`location-${index}-name`}>
                  Location Name
                </label>
                <input
                  type="text"
                  id={`location-${index}-name`}
                  value={location.name || ''}
                  onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                  style={styles.input}
                  placeholder="e.g. Tyre, Abbasieh"
                />
                {errors.locationErrors?.[index]?.name && 
                  <div style={styles.error}>{errors.locationErrors[index].name}</div>
                }
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Arrival Time Range</label>
                <div style={styles.flexRow}>
                  <div style={styles.flex1}>
                    <input
                      type="time"
                      value={location.arrivalTimeFrom || ''}
                      onChange={(e) => handleLocationChange(index, 'arrivalTimeFrom', e.target.value)}
                      style={styles.input}
                    />
                    {errors.locationErrors?.[index]?.arrivalTimeFrom && (
                      <div style={styles.error}>{errors.locationErrors[index].arrivalTimeFrom}</div>
                    )}
                  </div>
                  <div style={{padding: '0 10px', display: 'flex', alignItems: 'center'}}>to</div>
                  <div style={styles.flex1}>
                    <input
                      type="time"
                      value={location.arrivalTimeTo || ''}
                      onChange={(e) => handleLocationChange(index, 'arrivalTimeTo', e.target.value)}
                      style={styles.input}
                    />
                    {errors.locationErrors?.[index]?.arrivalTimeTo && (
                      <div style={styles.error}>{errors.locationErrors[index].arrivalTimeTo}</div>
                    )}
                  </div>
                </div>
                
                {/* Display time overlap error */}
                {errors.locationErrors?.[index]?.timeOverlap && (
                  <div style={styles.error}>{errors.locationErrors[index].timeOverlap}</div>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            style={styles.addLocationButton}
            onClick={addLocation}
          >
            + Add Location
          </button>
          
          {errors.locations && <div style={styles.error}>{errors.locations}</div>}
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Pricing Rules</label>
        <div style={styles.flexRow}>
          <div style={styles.flex1}>
            <label style={styles.label} htmlFor="pricePerRide">Price Per Ride ($)</label>
            <input
              type="number"
              id="pricePerRide"
              name="pricePerRide"
              style={styles.input}
              value={formData.pricePerRide}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            {errors.pricePerRide && <div style={styles.error}>{errors.pricePerRide}</div>}
          </div>
          
          <div style={styles.flex1}>
            <label style={styles.label} htmlFor="pricePerMonth">Price Per Month ($)</label>
            <input
              type="number"
              id="pricePerMonth"
              name="pricePerMonth"
              style={styles.input}
              value={formData.pricePerMonth}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            {errors.pricePerMonth && <div style={styles.error}>{errors.pricePerMonth}</div>}
          </div>
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="maxCapacity">Maximum Rider Capacity</label>
        <input
          type="number"
          id="maxCapacity"
          name="maxCapacity"
          style={styles.input}
          value={formData.maxCapacity}
          onChange={handleChange}
          min="1"
          step="1"
        />
        {errors.maxCapacity && <div style={styles.error}>{errors.maxCapacity}</div>}
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
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Bus' : 'Create Bus'}
        </button>
      </div>
    </form>
  );
};

// Add defaultProps to guarantee bus is never undefined
BusForm.defaultProps = {
  bus: null,
  onSubmit: () => {},
  onCancel: () => {}
};

export default BusForm; 