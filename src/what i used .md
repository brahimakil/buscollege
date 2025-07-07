# Technology Constraints

## Web Application Technology Standards

The Website must conform to the following information technology standards:

### **React**
**What**: A JavaScript library for building user interfaces with component-based architecture.

**Why we chose it**: 
- Component-based architecture allows for reusable UI components (BusList, BusForm, BusDetails, Modal)
- Excellent state management with hooks for handling buses, riders, and drivers data
- Perfect for building admin dashboards with real-time updates

**How we implemented it**:
- Created modular components in src/components/ (buses/, riders/, ui/)
- Used React hooks (useState, useEffect, useCallback) throughout the application
- Built reusable components like Modal, MainLayout
- Used JSX for component rendering in all pages (Dashboard, Buses, Riders, Drivers)

### **JavaScript (ES6+)**
**What**: Programming language used for all application logic and Firebase interactions.

**Why we chose it**:
- Native language for React development
- ES6+ features like async/await for Firebase operations
- Arrow functions and destructuring for cleaner code

**How we implemented it**:
- Used ES6 modules in service files (busService.js, riderService.js, driverService.js)
- Implemented async/await for all Firebase operations
- Used destructuring in components for props and state
- Arrow functions for event handlers throughout the application

### **CSS (Inline Styles)**
**What**: Styling approach using JavaScript objects for component styling.

**Why we chose it**:
- Component-scoped styling without external dependencies
- Dynamic styling based on state and props
- Centralized theme system

**How we implemented it**:
- Created centralized theme system in themes/theme.js with colors, spacing, typography
- Used CSS-in-JS with style objects in every component
- Implemented responsive design patterns
- Created consistent styling across all components

### **Firebase Authentication**
**What**: Firebase service for user authentication and role management.

**Why we chose it**:
- Built-in authentication system with email/password
- Role-based access control for admin, driver, and rider
- Secure user management

**How we implemented it**:
- Set up in firebase/config.js with getAuth()
- Created AuthContext for application-wide authentication state
- Implemented in authService.js with login, register, logout functions
- Used PrivateRoute and PublicRoute components for route protection

### **Firestore Database**
**What**: NoSQL cloud database for storing all application data.

**Why we chose it**:
- Real-time data synchronization for live updates
- Flexible document structure for buses, users, subscriptions
- Scalable cloud database

**How we implemented it**:
- Configured in firebase/config.js with getFirestore()
- Created service layers (busService.js, riderService.js, driverService.js)
- Used collections: "buses", "users" 
- Implemented CRUD operations with Firestore methods (getDocs, addDoc, updateDoc, deleteDoc)
- Real-time listeners for live data updates

### **React Router DOM**
**What**: Routing library for navigation between different pages.

**Why we chose it**:
- Single-page application navigation
- URL-based routing for better user experience
- Protected routes for authentication

**How we implemented it**:
- Set up BrowserRouter in App.js with Routes and Route components
- Created navigation between Dashboard, Buses, Riders, Drivers pages
- Used useNavigate hook in Login.js and Register.js
- Implemented PrivateRoute component for authentication-required pages
- Used Link components in Sidebar.js for navigation

### **React Toastify**
**What**: Notification library for user feedback messages.

**Why we chose it**:
- Immediate user feedback for actions
- Non-intrusive notifications
- Easy integration with React

**How we implemented it**:
- Added ToastContainer in App.js for global notifications
- Used toast.success(), toast.error() in all CRUD operations
- Implemented in Buses.js, Riders.js, Drivers.js for operation feedback
- Used in BusDetails.js and RiderDetails.js for form submissions

### **React Leaflet**
**What**: React components for Leaflet maps to display bus routes.

**Why we chose it**:
- Interactive maps for route visualization
- Marker support for bus locations
- Route line drawing capabilities

**How we implemented it**:
- Used in BusRouteMap.js component
- Implemented MapContainer, TileLayer, Marker, Popup, Polyline components
- Created custom icons for bus markers
- Integrated with bus location data for route display

### **Firebase Storage**
**What**: Cloud storage service for file uploads.

**Why we chose it**:
- Secure file storage integration
- Easy integration with Firebase ecosystem

**How we implemented it**:
- Configured in firebase/config.js with getStorage()
- Set up for potential file uploads (profile pictures, documents)

The application requires internet access via mobile network or WiFi for real-time data synchronization with Firebase services.

## Mobile Application Technology Standards

This Mobile application must conform to the following information technology standards:

• **React Native**: A framework for building native mobile applications using React and JavaScript, allowing cross-platform development for iOS and Android from a single codebase.

• **Expo**: A platform and set of tools built around React Native that simplifies the development, building, and deployment of mobile applications.

• **AsyncStorage**: A simple, unencrypted, asynchronous, persistent, key-value storage system for React Native applications to handle local data storage.

• **Firebase SDK**: Mobile software development kit that provides authentication, real-time database, cloud messaging, and analytics capabilities for mobile applications.

• **React Navigation**: Routing and navigation library for React Native applications, providing stack, tab, and drawer navigation patterns.

## Additional Development Tools & Standards

• **Git**: Version control system for tracking changes in source code during software development, enabling collaborative development and code management.

• **npm/yarn**: Package managers for JavaScript, used to install, update, and manage project dependencies and third-party libraries.

• **ESLint**: A static code analysis tool for identifying problematic patterns in JavaScript code, ensuring code quality and consistency.

• **Prettier**: An opinionated code formatter that enforces a consistent code style across the entire codebase.

• **Webpack/Vite**: Module bundlers that compile and optimize JavaScript modules and assets for production deployment.
