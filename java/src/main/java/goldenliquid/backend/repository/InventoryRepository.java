package goldenliquid.backend.repository;

import goldenliquid.backend.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InventoryRepository extends MongoRepository<Inventory, String> {
    List<Inventory> findByStoreId(String storeId);
}
