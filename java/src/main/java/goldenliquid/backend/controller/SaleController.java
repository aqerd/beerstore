package goldenliquid.backend.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import goldenliquid.backend.model.Sale;
import goldenliquid.backend.model.Customer;
import goldenliquid.backend.repository.SaleRepository;
import goldenliquid.backend.repository.CustomerRepository;
import goldenliquid.backend.repository.InventoryRepository;
import goldenliquid.backend.model.Inventory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final InventoryRepository inventoryRepository;

    @GetMapping
    public List<Sale> getSales(@RequestParam(required = false) String storeId) {
        if (storeId != null) {
            return saleRepository.findByStoreId(storeId);
        }
        return saleRepository.findAll();
    }

    @GetMapping("/{id}")
    public Sale getSaleById(@PathVariable String id) {
        return saleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sale not found: " + id));
    }

    @PostMapping
    public Sale createSale(@RequestBody CreateSaleRequest request) {
        // Update Inventory first
        for (Sale.SaleItem item : request.getItems()) {
            List<Inventory> inventoryList = inventoryRepository.findByStoreId(request.getStoreId());
            Optional<Inventory> inventoryOpt = inventoryList.stream()
                    .filter(inv -> inv.getProductId().equals(item.getProductId()))
                    .findFirst();

            if (inventoryOpt.isPresent()) {
                Inventory inventory = inventoryOpt.get();
                if (inventory.getQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient quantity for product: " + item.getProductId());
                }
                inventory.setQuantity(inventory.getQuantity() - item.getQuantity());
                inventory.setLastUpdated(LocalDateTime.now());
                inventoryRepository.save(inventory);
            } else {
                throw new IllegalArgumentException("Inventory not found for product: " + item.getProductId() + " in store: " + request.getStoreId());
            }
        }

        String customerId = null;
        String customerName = "Гость";

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            Customer customer = customerRepository.findByPhone(request.getPhone());
            if (customer == null && request.getCustomerName() != null) {
                customer = new Customer();
                customer.setId("cust-" + UUID.randomUUID().toString().substring(0, 8));
                customer.setName(request.getCustomerName());
                customer.setPhone(request.getPhone());
                customer.setBonusBalance(0.0);
                customer.setTotalPurchases(0.0);
                customer.setPurchaseCount(0);
                customer.setRegisteredAt(LocalDateTime.now());
                customer = customerRepository.save(customer);
            }
            if (customer != null) {
                customerId = customer.getId();
                customerName = customer.getName();

                // Update customer stats
                double totalPurchase = request.getItems().stream()
                    .mapToDouble(Sale.SaleItem::getTotal)
                    .sum();
                customer.setTotalPurchases(customer.getTotalPurchases() + totalPurchase);
                customer.setPurchaseCount(customer.getPurchaseCount() + 1);
                int bonusEarned = (int) (totalPurchase * 0.01); // 1% bonus
                customer.setBonusBalance(customer.getBonusBalance() + bonusEarned);
                customer.setLastPurchaseAt(LocalDateTime.now());
                customerRepository.save(customer);
            }
        }

        Sale sale = new Sale();
        sale.setId("sale-" + UUID.randomUUID().toString().substring(0, 8));
        sale.setStoreId(request.getStoreId());
        sale.setSellerId(request.getSellerId());
        sale.setCustomerId(customerId);
        sale.setItems(request.getItems());
        sale.setTotal(request.getItems().stream()
            .mapToDouble(Sale.SaleItem::getTotal)
            .sum());
        sale.setPaymentMethod(request.getPaymentMethod());
        sale.setCreatedAt(LocalDateTime.now());
        sale.setBonusUsed(request.getBonusUsed() != null ? request.getBonusUsed() : 0.0);

        int bonusEarned = (int) (sale.getTotal() * 0.01);
        sale.setBonusEarned((double) bonusEarned);

        return saleRepository.save(sale);
    }

    @PostMapping("/{id}/refund")
    public Sale refundSale(@PathVariable String id, @RequestBody RefundRequest request) {
        Sale sale = saleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sale not found: " + id));
        // Logic for refund would go here
        return sale;
    }

    @Data
    public static class CreateSaleRequest {
        private String storeId;
        private String sellerId;
        private String customerName;
        private String phone;
        private List<Sale.SaleItem> items;
        private String paymentMethod;
        private Double bonusUsed;
    }

    @Data
    public static class RefundRequest {
        private String reason;
    }
}
