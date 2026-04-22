package goldenliquid.backend.controller;

import goldenliquid.backend.model.Inventory;
import goldenliquid.backend.model.Product;
import goldenliquid.backend.model.Store;
import goldenliquid.backend.repository.InventoryRepository;
import goldenliquid.backend.repository.ProductRepository;
import goldenliquid.backend.repository.StoreRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    @GetMapping
    public List<InventoryResponse> getInventory(@RequestParam(required = false) String storeId) {
        List<Inventory> inventoryList;
        if (storeId != null && !storeId.isEmpty()) {
            inventoryList = inventoryRepository.findByStoreId(storeId);
        } else {
            inventoryList = inventoryRepository.findAll();
        }

        return inventoryList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private InventoryResponse convertToResponse(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setProductId(inventory.getProductId());
        response.setStoreId(inventory.getStoreId());
        response.setQuantity(inventory.getQuantity());
        response.setMinQuantity(inventory.getMinQuantity());
        response.setLastUpdated(inventory.getLastUpdated());

        productRepository.findById(inventory.getProductId())
                .ifPresent(response::setProduct);
        
        storeRepository.findById(inventory.getStoreId())
                .ifPresent(response::setStore);

        return response;
    }

    @Data
    public static class InventoryResponse {
        private String id;
        private String productId;
        private String storeId;
        private Double quantity;
        private Double minQuantity;
        private LocalDateTime lastUpdated;
        private Product product;
        private Store store;
    }
}
