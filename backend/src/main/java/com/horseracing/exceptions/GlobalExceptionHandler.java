package com.horseracing.exceptions;

import com.horseracing.dto.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler to centralize error responses (#13).
 * Eliminates repetitive try-catch blocks in controllers.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(new ErrorResponse(ex.getStatus().value(), ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Email hoặc mật khẩu không chính xác."));
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabled(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra hộp thư email để xác thực tài khoản."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Bạn không có quyền truy cập chức năng này."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("status", 400);
        response.put("message", "Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.");
        response.put("errors", errors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex) {
        log.error("Database constraint violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(409, "Dữ liệu bị trùng lặp hoặc không hợp lệ. Vui lòng kiểm tra lại."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
        log.error("Unhandled RuntimeException: {}", ex.getMessage(), ex);
        
        // If it is a manually thrown RuntimeException, map its message to a user-friendly Vietnamese explanation.
        // Unexpected system exceptions (like NullPointerException, DB crashes) use subclasses or have database traces,
        // and should be masked to avoid sensitive data leakage.
        if (ex.getClass() == RuntimeException.class && ex.getMessage() != null) {
            String cleanMsg = ex.getMessage().trim();
            if (!cleanMsg.toLowerCase().contains("sql") && 
                !cleanMsg.toLowerCase().contains("database") && 
                !cleanMsg.toLowerCase().contains("hibernate")) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, translateMessage(cleanMsg)));
            }
        }
        
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Có lỗi xảy ra trong quá trình xử lý yêu cầu. Vui lòng thử lại sau."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        // Do NOT expose ex.getMessage() as it can contain database queries, file paths or other sensitive logs
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Lỗi hệ thống xảy ra trên server. Vui lòng thử lại sau."));
    }

    private String translateMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "Có lỗi xảy ra trong quá trình xử lý yêu cầu. Vui lòng thử lại sau.";
        }

        String msg = message.trim();

        // Substring / Pattern matching for dynamic error messages
        if (msg.startsWith("User not found with ID:")) {
            return "Không tìm thấy người dùng với mã số đã chọn.";
        }
        if (msg.startsWith("Horse breed '") && msg.contains("is not allowed in this tournament")) {
            return "Giống ngựa này không được phép tham gia giải đấu này.";
        }
        if (msg.startsWith("Horse gender '") && msg.contains("is not allowed in this tournament")) {
            return "Giới tính ngựa không phù hợp với quy định của giải đấu này.";
        }
        if (msg.startsWith("Horse age ") && msg.contains("is not allowed in this tournament")) {
            return "Độ tuổi ngựa không phù hợp với quy định của giải đấu này.";
        }
        if (msg.startsWith("Race has reached its maximum slots")) {
            return "Cuộc đua đã đạt số lượng ngựa tham gia tối đa.";
        }
        if (msg.startsWith("Cannot confirm registration. The number of APPROVED registrations")) {
            return "Không thể xác nhận đăng ký. Số lượng ngựa được duyệt ít hơn quy định tối thiểu của vòng đua.";
        }

        // Exact matches
        switch (msg) {
            case "Insufficient balance":
                return "Số dư tài khoản không đủ để thực hiện giao dịch.";
            case "Invalid transaction state":
                return "Trạng thái giao dịch không hợp lệ.";
            case "Transaction not found":
                return "Không tìm thấy giao dịch yêu cầu.";
            case "Email is already registered":
                return "Email này đã được đăng ký trên hệ thống.";
            case "Username is already registered":
            case "Username is already taken":
                return "Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.";
            case "Cannot delete user because they have active transactional data (bets, races, etc.). Consider deactivating/disabling the user instead.":
                return "Không thể xóa tài khoản do có dữ liệu liên quan (lịch sử đặt cược, thi đấu, v.v.). Vui lòng vô hiệu hóa thay vì xóa.";
            case "Cannot connect with yourself":
                return "Bạn không thể kết bạn với chính mình.";
            case "You are already connected":
                return "Hai người đã là bạn bè.";
            case "Connection request is already pending":
                return "Yêu cầu kết bạn đã được gửi và đang chờ phản hồi.";
            case "You are not authorized to respond to this request":
                return "Bạn không có quyền phản hồi yêu cầu kết bạn này.";
            case "Connection is not in PENDING status":
                return "Yêu cầu kết bạn này không ở trạng thái chờ.";
            case "Invalid action. Must be ACCEPT or REJECT":
                return "Hành động không hợp lệ. Chỉ chấp nhận ACCEPT hoặc REJECT.";
            case "You are not authorized to delete this connection":
                return "Bạn không có quyền xóa mối liên kết này.";
            case "Cannot request upgrade to ADMIN or SPECTATOR role":
                return "Không thể yêu cầu nâng cấp lên vai trò ADMIN hoặc SPECTATOR.";
            case "User already has the requested role":
                return "Người dùng đã sở hữu vai trò được yêu cầu.";
            case "You already have a pending upgrade request":
                return "Bạn đã có một yêu cầu nâng cấp đang chờ xử lý.";
            case "Full name is required":
                return "Họ và tên là bắt buộc.";
            case "Date of birth is required":
                return "Ngày sinh là bắt buộc.";
            case "Phone number is required":
                return "Số điện thoại là bắt buộc.";
            case "Identity card / Passport number is required":
                return "Số CMND/CCCD hoặc Hộ chiếu là bắt buộc.";
            case "Jockey weight must be between 40 and 80 kg":
                return "Cân nặng của kỵ sĩ phải nằm trong khoảng từ 40 đến 80 kg.";
            case "Jockey height must be a positive number":
                return "Chiều cao của kỵ sĩ phải là một số dương.";
            case "Jockey license number is required":
                return "Số giấy phép kỵ sĩ là bắt buộc.";
            case "Stable name is required":
                return "Tên trang trại ngựa là bắt buộc.";
            case "Stable address is required":
                return "Địa chỉ trang trại ngựa là bắt buộc.";
            case "Referee certification number is required":
                return "Số chứng chỉ trọng tài là bắt buộc.";
            case "Referee experience years must be a positive number":
                return "Số năm kinh nghiệm của trọng tài phải là một số dương.";
            case "Only pending requests can be approved":
                return "Chỉ các yêu cầu đang chờ duyệt mới có thể phê duyệt.";
            case "Only pending requests can be rejected":
                return "Chỉ các yêu cầu đang chờ duyệt mới có thể từ chối.";
            case "Prize money must be positive or zero":
                return "Tiền thưởng phải lớn hơn hoặc bằng 0.";
            case "Minimum bet amount must be positive or zero":
                return "Số tiền đặt cược tối thiểu phải lớn hơn hoặc bằng 0 VNĐ.";
            case "Maximum slots must be between 3 and 12":
                return "Số lượng ngựa tối đa tham gia phải từ 3 đến 12 con.";
            case "Minimum slots must be between 3 and 12":
                return "Số lượng ngựa tối thiểu tham gia phải từ 3 đến 12 con.";
            case "Minimum slots cannot be greater than maximum slots":
                return "Số lượng ngựa tối thiểu không được lớn hơn số lượng tối đa.";
            case "Entry fee must be positive or zero":
                return "Lệ phí tham gia phải lớn hơn hoặc bằng 0 VNĐ.";
            case "Start date must be before end date":
                return "Ngày bắt đầu giải đấu phải trước ngày kết thúc.";
            case "Start date cannot be in the past":
                return "Ngày bắt đầu giải đấu không được ở trong quá khứ.";
            case "End date cannot be in the past":
                return "Ngày kết thúc giải đấu không được ở trong quá khứ.";
            case "Registration deadline must be before start date":
                return "Hạn chót đăng ký phải diễn ra trước ngày bắt đầu giải đấu.";
            case "Registration opening time must be before registration deadline":
                return "Thời gian mở đăng ký phải trước hạn chót đăng ký.";
            case "Registration deadline must be before official race time":
                return "Hạn chót đăng ký phải trước thời gian thi đấu chính thức.";
            case "Registration deadline cannot be in the past":
                return "Hạn chót đăng ký không được ở trong quá khứ.";
            case "Referee ID is required":
                return "Mã số trọng tài là bắt buộc.";
            case "User must have RACE_REFEREE role":
                return "Người dùng được chọn phải là trọng tài (vai trò Trọng tài).";
            case "Race track ID is required":
                return "Đường đua được chọn không hợp lệ hoặc bị bỏ trống.";
            case "Race timing overlaps with another race on the same track":
                return "Thời gian tổ chức bị trùng lặp với một trận đua khác trên cùng đường đua.";
            case "Cannot update a tournament unless it is in Upcoming status":
                return "Chỉ có thể cập nhật giải đấu khi giải đấu ở trạng thái Sắp diễn ra (Upcoming).";
            case "Maximum participating horses must be between 2 and 12":
                return "Số lượng ngựa tối đa tham gia trận đua phải từ 2 đến 12 con.";
            case "Start time must be before end time":
                return "Thời gian bắt đầu phải trước thời gian kết thúc.";
            case "This tournament already has a race. Only 1 race is allowed per tournament.":
                return "Giải đấu này đã có trận đua được tạo. Mỗi giải đấu chỉ cho phép tối đa 1 trận đua.";
            case "Cannot create race for a finished or cancelled tournament":
                return "Không thể tạo trận đua cho giải đấu đã kết thúc hoặc đã bị hủy.";
            case "Race date cannot be in the past":
                return "Ngày đua không được ở trong quá khứ.";
            case "Race date cannot be before tournament start date":
                return "Ngày đua không được trước ngày bắt đầu giải đấu.";
            case "Race date cannot be after tournament end date":
                return "Ngày đua không được sau ngày kết thúc giải đấu.";
            case "Total profit sharing percentage must equal 100%":
                return "Tổng tỷ lệ chia lợi nhuận giữa các bên phải bằng 100%.";
            case "Race is not open for registration":
                return "Cuộc đua hiện không mở cổng đăng ký.";
            case "Registration has not opened yet":
                return "Thời gian đăng ký thi đấu chưa bắt đầu.";
            case "Registration deadline has passed":
                return "Đã quá hạn chót đăng ký thi đấu.";
            case "Horse gender is not specified":
                return "Giới tính ngựa thi đấu chưa được xác định.";
            case "This horse does not belong to you":
                return "Chú ngựa này không thuộc quyền sở hữu của kỵ sĩ/chủ ngựa này.";
            case "This horse is already registered for this race":
                return "Chú ngựa này đã được đăng ký tham gia trận đua này.";
            case "This jockey is already registered for this race":
                return "Kỵ sĩ này đã được đăng ký tham gia trận đua này.";
            case "Insufficient wallet balance to pay entry fee":
                return "Số dư tài khoản ví không đủ để thanh toán lệ phí tham gia.";
            case "Only pending registrations can be approved":
                return "Chỉ các yêu cầu đăng ký đang chờ duyệt mới có thể được phê duyệt.";
            case "Cannot approve registration because the race is no longer open for registration":
                return "Không thể phê duyệt vì giải đấu/vòng đua đã đóng cổng đăng ký.";
            case "Only pending registrations can be rejected":
                return "Chỉ các yêu cầu đăng ký đang chờ duyệt mới có thể bị từ chối.";
            case "Not authorized to cancel this registration":
                return "Bạn không có quyền hủy đăng ký thi đấu này.";
            case "Cannot cancel registration because the race is not open for registration":
                return "Không thể hủy đăng ký vì cuộc đua không ở trạng thái mở đăng ký.";
            case "Only pending registrations can be cancelled":
                return "Chỉ các đăng ký đang chờ duyệt mới có thể hủy.";
            case "Not authorized to update this registration":
                return "Bạn không có quyền cập nhật thông tin đăng ký thi đấu này.";
            case "Only pending registrations can be updated":
                return "Chỉ các đăng ký đang chờ duyệt mới có thể cập nhật.";
            case "Tournament has no associated race":
                return "Giải đấu chưa có cuộc đua nào được thiết lập.";
            case "You are not assigned to this race":
                return "Bạn không được phân công làm trọng tài cho cuộc đua này.";
            case "Race must be LOCKED_LIST to start":
                return "Danh sách tham gia phải được khóa mới có thể bắt đầu cuộc đua.";
            case "Cannot start race. All participants must be inspected first.":
                return "Không thể bắt đầu cuộc đua. Tất cả ngựa tham gia phải được kiểm tra trước.";
            case "Cannot start race. No approved participants in this race.":
                return "Không thể bắt đầu cuộc đua vì không có ngựa tham gia nào được phê duyệt.";
            case "No simulation found for this race":
                return "Không tìm thấy dữ liệu mô phỏng cho cuộc đua này.";
            case "Race is not running or already confirmed":
                return "Cuộc đua không ở trạng thái đang diễn ra hoặc đã được xác nhận kết quả.";
            case "Cannot confirm results. The race simulation has not finished yet.":
                return "Không thể xác nhận kết quả. Quá trình mô phỏng cuộc đua vẫn đang chạy.";
            case "Race is already finished or cancelled":
                return "Cuộc đua đã kết thúc hoặc đã bị hủy trước đó.";
            case "Invalid Google token":
                return "Mã xác thực Google không hợp lệ hoặc đã hết hạn.";
            default:
                return msg;
        }
    }
}
