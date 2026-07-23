package com.horseracing.services;

import com.horseracing.exceptions.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final List<String> ALLOWED_EXTENSIONS =
            List.of(".jpg", ".jpeg", ".png", ".webp", ".pdf");
    private static final List<String> ALLOWED_MIME_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "application/pdf");

    public FileStorageService() {
        // Create the directory 'uploads' in the current project root if it doesn't exist
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException(
                    "Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Uploaded file cannot be empty.", HttpStatus.BAD_REQUEST);
        }

        // Validate MIME Content-Type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException(
                    "Invalid file format. Allowed formats: JPEG, PNG, WEBP, PDF.",
                    HttpStatus.BAD_REQUEST);
        }

        // Normalize file name and prevent path traversal
        String originalFileName =
                StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFileName.contains("..")) {
            throw new BusinessException(
                    "Filename contains invalid path sequence: " + originalFileName,
                    HttpStatus.BAD_REQUEST);
        }

        // Validate extension
        String fileExtension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFileName.substring(i).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new BusinessException(
                    "Invalid file extension. Allowed extensions: .jpg, .jpeg, .png, .webp, .pdf",
                    HttpStatus.BAD_REQUEST);
        }

        try {
            // Generate unique filename
            String newFileName = UUID.randomUUID().toString() + fileExtension;

            // Copy file to target location
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + newFileName;
        } catch (IOException ex) {
            throw new RuntimeException(
                    "Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
}
