package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.model.SystemSetting;
import com.ecommerce.EcommerceApplication.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository settingRepository;

    public Map<String, String> getAllSettings() {
        return settingRepository.findAll().stream()
                .collect(Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue));
    }

    public String getSetting(String key) {
        return settingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(null);
    }

    public String getSetting(String key, String defaultValue) {
        return settingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }

    @Transactional
    public void updateSetting(String key, String value) {
        SystemSetting setting = settingRepository.findByKey(key)
                .orElse(SystemSetting.builder()
                        .key(key)
                        .type("STRING")
                        .build());

        setting.setValue(value);
        settingRepository.save(setting);
    }

    @Transactional
    public void updateSettings(Map<String, String> settings) {
        settings.forEach(this::updateSetting);
    }

    @Transactional
    public void deleteSetting(String key) {
        settingRepository.findByKey(key).ifPresent(settingRepository::delete);
    }
}
