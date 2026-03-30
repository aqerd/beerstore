package goldenliquid.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard(@RequestParam(required = false) String storeId) {
        Map<String, Object> response = new HashMap<>();
        
        // Today Stats
        Map<String, Object> todayStats = new HashMap<>();
        todayStats.put("revenue", 0);
        todayStats.put("salesCount", 0);
        todayStats.put("averageCheck", 0);
        todayStats.put("activeCustomers", 0);
        response.put("todayStats", todayStats);
        
        // Week Stats
        Map<String, Object> weekStats = new HashMap<>();
        weekStats.put("revenue", 0);
        weekStats.put("salesCount", 0);
        response.put("weekStats", weekStats);
        
        // Chart Data (Empty for now)
        List<Object> chartData = new ArrayList<>();
        response.put("chartData", chartData);
        
        // Low Stock Count
        response.put("lowStockCount", 0);
        
        return response;
    }
}
