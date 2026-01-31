package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SystemSettingController {

    private final SystemSettingService settingService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @GetMapping("/{key}")
    public ResponseEntity<String> getSetting(@PathVariable String key) {
        String value = settingService.getSetting(key);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(value);
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> settings) {
        settingService.updateSettings(settings);
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
    }

    @PutMapping("/{key}")
    public ResponseEntity<?> updateSetting(@PathVariable String key, @RequestBody Map<String, String> body) {
        String value = body.get("value");
        settingService.updateSetting(key, value);
        return ResponseEntity.ok(Map.of("message", "Setting updated successfully"));
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<?> deleteSetting(@PathVariable String key) {
        settingService.deleteSetting(key);
        return ResponseEntity.ok(Map.of("message", "Setting deleted successfully"));
    }
}
