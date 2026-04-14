package goldenliquid.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import goldenliquid.backend.model.Sale;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends MongoRepository<Sale, String> {
    List<Sale> findByStoreId(String storeId);
    List<Sale> findByCreatedAtAfter(LocalDateTime date);
    List<Sale> findByStoreIdAndCreatedAtAfter(String storeId, LocalDateTime date);
}
