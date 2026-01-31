package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.config.AppConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class FileUploadController {
    
    @Autowired
    private AppConfig appConfig;

    private static final String UPLOAD_DIR_CHAT = "uploads/chat/";
    private static final String UPLOAD_DIR_PRODUCTS = "uploads/products/";
    private static final String UPLOAD_DIR_PROFILES = "uploads/profiles/";
    private static final String UPLOAD_DIR_SHOPS = "uploads/shops/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

    // Upload chat image (ต้อง authenticated - เพราะเป็นส่วนของ chat)
    @PostMapping("/upload/chat")
    public ResponseEntity<?> uploadChatImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "ไฟล์ว่างเปล่า"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("error", "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)"));
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "ชื่อไฟล์ไม่ถูกต้อง"));
            }

            // Check file extension
            String fileExtension = getFileExtension(originalFilename).toLowerCase();
            boolean isValidExtension = false;
            for (String allowedExt : ALLOWED_EXTENSIONS) {
                if (fileExtension.equals(allowedExt)) {
                    isValidExtension = true;
                    break;
                }
            }

            if (!isValidExtension) {
                return ResponseEntity.badRequest().body(Map.of("error", "ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะรูปภาพ)"));
            }

            // Generate unique filename
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR_CHAT);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return file URL
            String fileUrl = "/files/chat/" + uniqueFilename;

            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", originalFilename,
                "size", file.getSize(),
                "type", file.getContentType()
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "ไม่สามารถบันทึกไฟล์ได้"));
        }
    }

    @GetMapping("/chat/{filename}")
    public ResponseEntity<byte[]> getChatImage(@PathVariable String filename) {
        return getImage(UPLOAD_DIR_CHAT, filename);
    }

    // Upload product image
    @PostMapping("/upload/product")
    public ResponseEntity<?> uploadProductImage(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, UPLOAD_DIR_PRODUCTS, "product");
    }

    @GetMapping("/products/{filename}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable String filename) {
        return getImage(UPLOAD_DIR_PRODUCTS, filename);
    }

    // Upload profile image
    @PostMapping("/upload/profile")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, UPLOAD_DIR_PROFILES, "profile");
    }

    @GetMapping("/profiles/{filename}")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable String filename) {
        return getImage(UPLOAD_DIR_PROFILES, filename);
    }

    // Upload shop logo
    @PostMapping("/upload/shop")
    public ResponseEntity<?> uploadShopLogo(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, UPLOAD_DIR_SHOPS, "shop");
    }

    @GetMapping("/shops/{filename}")
    public ResponseEntity<byte[]> getShopImage(@PathVariable String filename) {
        return getImage(UPLOAD_DIR_SHOPS, filename);
    }

    // Generic upload method
    private ResponseEntity<?> uploadImage(MultipartFile file, String uploadDir, String type) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "ไฟล์ว่างเปล่า"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("error", "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)"));
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "ชื่อไฟล์ไม่ถูกต้อง"));
            }

            // Check file extension
            String fileExtension = getFileExtension(originalFilename).toLowerCase();
            boolean isValidExtension = false;
            for (String allowedExt : ALLOWED_EXTENSIONS) {
                if (fileExtension.equals(allowedExt)) {
                    isValidExtension = true;
                    break;
                }
            }

            if (!isValidExtension) {
                return ResponseEntity.badRequest().body(Map.of("error", "ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะรูปภาพ)"));
            }

            // Generate unique filename
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return full file URL (including domain and /api prefix)
            String relativePath = "files/" + type + "s/" + uniqueFilename;
            String fileUrl = appConfig.buildFileUrl(relativePath);

            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", originalFilename,
                "size", file.getSize(),
                "type", file.getContentType()
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "ไม่สามารถบันทึกไฟล์ได้"));
        }
    }

    // Generic get image method
    private ResponseEntity<byte[]> getImage(String uploadDir, String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                    .body(fileBytes);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex);
    }
}