package com.ecommerce.EcommerceApplication.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.dto.ProductVariantDto;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.entity.ProductVariant;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.repository.ProductVariantRepository;
import com.ecommerce.EcommerceApplication.service.ProductVariantService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private ProductRepository productRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDto> getVariantsByProductId(Long productId) {
        List<ProductVariant> variants = variantRepository.findByProductIdOrderByPositionAsc(productId);
        return variants.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDto> getActiveVariantsByProductId(Long productId) {
        List<ProductVariant> variants = variantRepository.findByProductIdAndStatusOrderByPositionAsc(productId, "active");
        return variants.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductVariantDto> getVariantById(Long variantId) {
        return variantRepository.findById(variantId)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductVariantDto> getVariantBySku(String sku) {
        return variantRepository.findBySku(sku)
                .map(this::convertToDto);
    }

    @Override
    public ProductVariantDto createVariant(Long productId, ProductVariantDto variantDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);

        // Generate SKU if not provided
        if (variantDto.getSku() == null || variantDto.getSku().trim().isEmpty()) {
            variant.setSku(generateVariantSku(productId, variantDto.getVariantOptions()));
        } else {
            variant.setSku(variantDto.getSku());
        }

        variant.setVariantTitle(variantDto.getVariantTitle());
        variant.setVariantOptions(variantDto.getVariantOptions());
        variant.setPrice(variantDto.getPrice());
        variant.setComparePrice(variantDto.getComparePrice());
        variant.setStockQuantity(variantDto.getStockQuantity() != null ? variantDto.getStockQuantity() : 0);
        variant.setWeightGram(variantDto.getWeightGram());
        variant.setStatus(variantDto.getStatus() != null ? variantDto.getStatus() : "active");
        variant.setPosition(variantDto.getPosition());

        ProductVariant savedVariant = variantRepository.save(variant);
        return convertToDto(savedVariant);
    }

    @Override
    public ProductVariantDto updateVariant(Long variantId, ProductVariantDto variantDto) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with ID: " + variantId));

        if (variantDto.getSku() != null) {
            variant.setSku(variantDto.getSku());
        }
        if (variantDto.getVariantTitle() != null) {
            variant.setVariantTitle(variantDto.getVariantTitle());
        }
        if (variantDto.getVariantOptions() != null) {
            variant.setVariantOptions(variantDto.getVariantOptions());
        }
        if (variantDto.getPrice() != null) {
            variant.setPrice(variantDto.getPrice());
        }
        if (variantDto.getComparePrice() != null) {
            variant.setComparePrice(variantDto.getComparePrice());
        }
        if (variantDto.getStockQuantity() != null) {
            variant.setStockQuantity(variantDto.getStockQuantity());
        }
        if (variantDto.getWeightGram() != null) {
            variant.setWeightGram(variantDto.getWeightGram());
        }
        if (variantDto.getStatus() != null) {
            variant.setStatus(variantDto.getStatus());
        }
        if (variantDto.getPosition() != null) {
            variant.setPosition(variantDto.getPosition());
        }

        ProductVariant savedVariant = variantRepository.save(variant);
        return convertToDto(savedVariant);
    }

    @Override
    public void deleteVariant(Long variantId) {
        if (!variantRepository.existsById(variantId)) {
            throw new RuntimeException("Variant not found with ID: " + variantId);
        }
        variantRepository.deleteById(variantId);
    }

    @Override
    public void updateVariantStock(Long variantId, Integer stockQuantity) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with ID: " + variantId));

        variant.setStockQuantity(stockQuantity);
        variantRepository.save(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<String>> getAvailableVariantOptions(Long productId) {
        Map<String, List<String>> optionsMap = new HashMap<>();

        List<String> optionKeys = variantRepository.getDistinctOptionKeysByProductId(productId);

        for (String optionKey : optionKeys) {
            List<String> optionValues = variantRepository
                    .getDistinctOptionValuesByProductIdAndKey(productId, optionKey);
            optionsMap.put(optionKey, optionValues);
        }

        return optionsMap;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDto> findVariantsByOptions(Long productId, Map<String, String> options) {
        try {
            String optionsJson = objectMapper.writeValueAsString(options);
            List<ProductVariant> variants = variantRepository.findByProductIdAndVariantOptions(productId, optionsJson);
            return variants.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error processing variant options", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isVariantAvailable(Long variantId, Integer requestedQuantity) {
        Optional<ProductVariant> variantOpt = variantRepository.findById(variantId);
        if (!variantOpt.isPresent()) {
            return false;
        }

        ProductVariant variant = variantOpt.get();
        return variant.isAvailable() && variant.getStockQuantity() >= requestedQuantity;
    }

    @Override
    public boolean reserveVariantStock(Long variantId, Integer quantity) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with ID: " + variantId));

        if (variant.getStockQuantity() >= quantity) {
            variant.setStockQuantity(variant.getStockQuantity() - quantity);
            variantRepository.save(variant);
            return true;
        }
        return false;
    }

    @Override
    public void releaseVariantStock(Long variantId, Integer quantity) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with ID: " + variantId));

        variant.setStockQuantity(variant.getStockQuantity() + quantity);
        variantRepository.save(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDto> getLowStockVariants(Integer threshold) {
        List<ProductVariant> variants = variantRepository.findLowStockVariants(threshold);
        return variants.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void updateVariantStatusByProductId(Long productId, String status) {
        variantRepository.updateStatusByProductId(productId, status);
    }

    @Override
    public String generateVariantSku(Long productId, Map<String, String> variantOptions) {
        StringBuilder skuBuilder = new StringBuilder();

        // Add product ID prefix
        skuBuilder.append("P").append(productId);

        // Add variant options
        if (variantOptions != null && !variantOptions.isEmpty()) {
            variantOptions.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(entry -> {
                        String key = entry.getKey().toUpperCase().substring(0, Math.min(3, entry.getKey().length()));
                        String value = entry.getValue().toUpperCase().replaceAll("[^A-Z0-9]", "");
                        skuBuilder.append("-").append(key).append(value);
                    });
        }

        // Add timestamp to ensure uniqueness
        skuBuilder.append("-").append(System.currentTimeMillis() % 10000);

        return skuBuilder.toString();
    }

    @Override
    public boolean validateVariantOptions(Map<String, String> options) {
        if (options == null || options.isEmpty()) {
            return false;
        }

        // Check for empty values
        for (Map.Entry<String, String> entry : options.entrySet()) {
            if (entry.getKey() == null || entry.getKey().trim().isEmpty() ||
                entry.getValue() == null || entry.getValue().trim().isEmpty()) {
                return false;
            }
        }

        return true;
    }

    private ProductVariantDto convertToDto(ProductVariant variant) {
        ProductVariantDto dto = new ProductVariantDto();
        dto.setId(variant.getId());
        dto.setProductId(variant.getProductId());
        dto.setSku(variant.getSku());
        dto.setVariantTitle(variant.getVariantTitle());
        dto.setVariantOptions(variant.getVariantOptions());
        dto.setPrice(variant.getPrice());
        dto.setComparePrice(variant.getComparePrice());
        dto.setEffectivePrice(variant.getEffectivePrice());
        dto.setStockQuantity(variant.getStockQuantity());
        dto.setWeightGram(variant.getWeightGram());
        dto.setStatus(variant.getStatus());
        dto.setPosition(variant.getPosition());
        dto.setAvailable(variant.isAvailable());
        dto.setDisplayName(variant.getDisplayName());
        dto.setCreatedAt(variant.getCreatedAt());
        dto.setUpdatedAt(variant.getUpdatedAt());

        // Convert images if needed
        if (variant.getImages() != null && !variant.getImages().isEmpty()) {
            dto.setImageUrls(variant.getImages().stream()
                    .map(img -> img.getImageUrl())
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}