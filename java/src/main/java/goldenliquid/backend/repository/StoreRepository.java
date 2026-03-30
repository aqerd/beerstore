package goldenliquid.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import goldenliquid.backend.model.Store;

public interface StoreRepository extends MongoRepository<Store, String> {
}
