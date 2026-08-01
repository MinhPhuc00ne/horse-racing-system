package com.horseracing.controllers;

import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        try {
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Please select at least one file to upload."));
            }
            if (files.length > 5) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "You can upload a maximum of 5 files at a time."));
            }

            List<String> fileUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                String fileUrl = fileStorageService.storeFile(file);
                fileUrls.add(fileUrl);
            }
            if (fileUrls.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "No valid files were uploaded."));
            }
            return ResponseEntity.ok(fileUrls);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
