package com.horseracing.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String activationLink,
            String token) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String htmlMsg = "<h3>Hello " + fullName + ",</h3>"
                    + "<p>Thank you for registering an account at Horse Racing Management System.</p>"
                    + "<p>To activate your account, please enter the OTP code below on the verification page or click the link below:</p>"
                    + "<h2 style='color: #0f5132; background: #e2f0d9; display: inline-block; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;'>"
                    + token + "</h2>" + "<p style='margin-top: 20px;'><a href='" + activationLink
                    + "?token=" + token
                    + "' style='display:inline-block; background-color:#198754; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;'>Activate Account</a></p>"
                    + "<p style='color: #6c757d; font-size: 0.9em; margin-top: 15px;'>This verification code and link will expire in 15 minutes.</p>"
                    + "<br/>" + "<p>Best regards,<br/>Horse Racing Management Team.</p>";

            helper.setTo(toEmail);
            helper.setSubject("Activate Your Account - Horse Racing Management");
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Verification email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Error sending verification email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String htmlMsg = "<h3>Hello " + fullName + ",</h3>"
                    + "<p>We received a password reset request for your account at Horse Racing Management System.</p>"
                    + "<p>Please enter the OTP code below to reset your password:</p>"
                    + "<h2 style='color: #856404; background: #fff3cd; display: inline-block; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;'>"
                    + token + "</h2>"
                    + "<p style='color: #6c757d; font-size: 0.9em; margin-top: 15px;'>This code will expire in 10 minutes.</p>"
                    + "<p>If you did not request a password reset, please ignore this email or contact support.</p>"
                    + "<br/>" + "<p>Best regards,<br/>Horse Racing Management Team.</p>";

            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - Horse Racing Management");
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Password reset email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Error sending password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}
