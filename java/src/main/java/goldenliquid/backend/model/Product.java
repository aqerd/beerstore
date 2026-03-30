package goldenliquid.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String category;
    private String manufacturer;
    private String country;
    private Double abv;
    private Integer ibu;
    private String description;
    private Double pricePerLiter;
    private Boolean isActive;
}
