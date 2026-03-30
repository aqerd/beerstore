package goldenliquid.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import goldenliquid.backend.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
}
