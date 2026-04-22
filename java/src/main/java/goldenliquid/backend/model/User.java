package goldenliquid.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    @Field("passwordHash")
    private String passwordHash;
    private String role;
    private String storeId;
}
