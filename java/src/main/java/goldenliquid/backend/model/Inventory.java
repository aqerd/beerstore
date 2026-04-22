package goldenliquid.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "inventory")
public class Inventory {
    @Id
    private String id;
    private String productId;
    private String storeId;
    private Double quantity;
    private Double minQuantity;
    private LocalDateTime lastUpdated;
}
