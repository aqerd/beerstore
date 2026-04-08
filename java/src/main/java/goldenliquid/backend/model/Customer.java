package goldenliquid.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "customers")
public class Customer {
    @Id
    private String id;
    private String name;
    private String phone;
    private String email;
    private Double bonusBalance;
    private Double totalPurchases;
    private Integer purchaseCount;
    private LocalDateTime registeredAt;
    private LocalDateTime lastPurchaseAt;
    private String favoriteStoreId;
}
