package goldenliquid.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "sales")
public class Sale {
    @Id
    private String id;
    private String storeId;
    private String sellerId;
    private String customerId;
    private List<SaleItem> items;
    private Double total;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private Double bonusUsed;
    private Double bonusEarned;

    @Data
    public static class SaleItem {
        private String productId;
        private Double quantity;
        private Double pricePerLiter;
        private Double total;
    }
}
