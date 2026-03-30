package goldenliquid.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "stores")
public class Store {
    @Id
    private String id;
    private String name;
    private String address;
    private String phone;
    private String workingHours;
    private String managerId;
    private Boolean isActive;
}
