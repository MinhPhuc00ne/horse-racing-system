import axiosClient from '../api/axiosClient';

/**
 * Authentication Service connecting to Spring Boot Backend
 */

const isMockMode = () => {
  return false;
};

export async function loginAPI(email, password) {
  try {
    const response = await axiosClient.post('/auth/login', {
      email,
      password,
    });
    return response.data; // { accessToken, refreshToken, user: { ... } }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function signupAPI({ username, fullName, email, password, role = 'SPECTATOR' }) {
  try {
    const response = await axiosClient.post('/auth/register', {
      username,
      fullName,
      email,
      password,
      role,
    });
    return response.data; // { accessToken, refreshToken, user: { ... } }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin đăng ký.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function verifyAccountAPI(token) {
  try {
    const response = await axiosClient.get(`/auth/verify?token=${token}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Xác thực tài khoản thất bại. Mã OTP không hợp lệ hoặc đã hết hạn.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function logoutAPI(refreshToken) {
  try {
    const response = await axiosClient.post('/auth/logout', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Đăng xuất thất bại. Vui lòng thử lại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getProfileAPI() {
  try {
    const response = await axiosClient.get('/auth/me');
    return response.data; // UserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy thông tin hồ sơ người dùng.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function googleLoginAPI(credential) {
  try {
    const response = await axiosClient.post('/auth/google', {
      credential,
    });
    return response.data; // { accessToken, refreshToken, user: { ... } }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function forgotPasswordAPI(email) {
  try {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function resetPasswordAPI({ email, otp, newPassword }) {
  try {
    const response = await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP và thử lại.';
    throw new Error(errMsg, { cause: error });
  }
}

// ==========================================
// MOCK APIS cho Luồng OTP Google (Frontend only)
// ==========================================

export async function sendGoogleOtpAPI(email) {
  // Giả lập call API mất 1 giây
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`[MOCK] OTP sent to ${email}`);
  return { success: true, message: 'OTP sent successfully' };
}

export async function completeGoogleProfileAPI(username, fullName) {
  try {
    const response = await axiosClient.post('/auth/google/complete-profile', {
      username,
      fullName,
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể hoàn tất cập nhật thông tin tài khoản.';
    throw new Error(errMsg, { cause: error });
  }
}
