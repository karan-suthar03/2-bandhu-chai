# Testing Guide for Enhanced Admin Authentication System

This guide outlines the testing procedures to verify that the enhanced admin authentication system is working correctly.

## Prerequisites

1. Ensure the backend server is running
2. Ensure the admin frontend is running
3. Have valid admin credentials available for testing
4. Have browser developer tools available to inspect cookies and network requests

## Test Cases

### 1. Login Functionality

#### 1.1 Successful Login
- **Steps**:
  1. Navigate to the admin login page
  2. Enter valid admin credentials
  3. Click the login button
- **Expected Results**:
  - User is redirected to the dashboard
  - HttpOnly cookies are set (check in browser dev tools)
  - Admin user data is stored in localStorage
  - No JWT token is visible in localStorage

#### 1.2 Failed Login
- **Steps**:
  1. Navigate to the admin login page
  2. Enter invalid credentials
  3. Click the login button
- **Expected Results**:
  - Error message is displayed
  - No cookies are set
  - User remains on the login page

#### 1.3 Password Validation
- **Steps**:
  1. Navigate to the dashboard
  2. Go to change password functionality
  3. Try to set a weak password (less than 8 characters)
- **Expected Results**:
  - Error message about password requirements is displayed
  - Password is not changed

### 2. Session Management

#### 2.1 Token Refresh
- **Steps**:
  1. Login successfully
  2. Wait for access token to expire (15 minutes) or simulate expiration
  3. Perform an action that requires authentication
- **Expected Results**:
  - The action succeeds
  - Network tab shows a call to the refresh endpoint
  - A new access token cookie is set

#### 2.2 Session Persistence
- **Steps**:
  1. Login successfully
  2. Close the browser tab
  3. Open a new tab and navigate to the admin dashboard
- **Expected Results**:
  - User is still logged in
  - Dashboard is displayed without requiring login

#### 2.3 Logout
- **Steps**:
  1. Login successfully
  2. Click the logout button
- **Expected Results**:
  - User is redirected to the login page
  - Cookies are cleared (check in browser dev tools)
  - Admin user data is removed from localStorage

### 3. Security Features

#### 3.1 HttpOnly Cookie Protection
- **Steps**:
  1. Login successfully
  2. Open browser console
  3. Try to access cookies via JavaScript: `document.cookie`
- **Expected Results**:
  - The authentication cookies are not visible in the output
  - Only non-HttpOnly cookies (if any) are displayed

#### 3.2 Token Type Verification
- **Steps**:
  1. Login successfully
  2. Using browser dev tools, modify the cookie to change the token type
  3. Perform an action that requires authentication
- **Expected Results**:
  - The action fails with an authentication error

#### 3.3 CORS and Credentials
- **Steps**:
  1. Login successfully
  2. Open network tab in browser dev tools
  3. Perform actions that make API requests
- **Expected Results**:
  - Requests include credentials
  - Responses include proper CORS headers

#### 3.4 Password Security
- **Steps**:
  1. Navigate to the dashboard
  2. Go to change password functionality
  3. Try to set various passwords that don't meet requirements
- **Expected Results**:
  - Specific error messages about password requirements
  - Password is only accepted when it meets all requirements

### 4. Edge Cases

#### 4.1 Expired Refresh Token
- **Steps**:
  1. Login successfully
  2. Simulate or wait for refresh token to expire (7 days)
  3. Perform an action that requires authentication
- **Expected Results**:
  - User is logged out
  - User is redirected to the login page

#### 4.2 Server Unavailable
- **Steps**:
  1. Login successfully
  2. Disconnect from the server (turn off backend)
  3. Perform an action that requires authentication
- **Expected Results**:
  - Appropriate error message is displayed
  - User experience degrades gracefully

#### 4.3 Multiple Tabs
- **Steps**:
  1. Login successfully in one tab
  2. Open another tab with the admin dashboard
  3. Logout from the first tab
  4. Perform an action in the second tab
- **Expected Results**:
  - The action in the second tab fails
  - User is redirected to the login page

## Automated Testing Recommendations

For a production environment, consider implementing the following automated tests:

1. **Unit Tests**:
   - Test token generation functions
   - Test authentication middleware
   - Test API client functions

2. **Integration Tests**:
   - Test login flow
   - Test token refresh flow
   - Test logout flow

3. **End-to-End Tests**:
   - Test complete user journeys
   - Test edge cases like network failures
   - Test cross-browser compatibility

## Security Testing Recommendations

1. **Penetration Testing**:
   - Attempt to bypass authentication
   - Test for common vulnerabilities (CSRF, XSS)
   - Test for token leakage

2. **Security Scanning**:
   - Use automated tools to scan for vulnerabilities
   - Check for outdated dependencies
   - Verify secure headers are in place

---

This testing guide provides a comprehensive approach to verify that the enhanced admin authentication system is working correctly and securely.