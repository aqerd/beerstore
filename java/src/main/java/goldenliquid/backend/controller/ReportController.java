package goldenliquid.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import goldenliquid.backend.model.Sale;
import goldenliquid.backend.repository.SaleRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final SaleRepository saleRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard(@RequestParam(required = false) String storeId) {
        Map<String, Object> response = new HashMap<>();

        List<Sale> sales = storeId != null
            ? saleRepository.findByStoreId(storeId)
            : saleRepository.findAll();

        LocalDateTime today = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        LocalDateTime weekAgo = today.minusDays(7);

        double totalRevenue = sales.stream().mapToDouble(Sale::getTotal).sum();
        int totalSales = sales.size();
        double avgCheck = totalSales > 0 ? totalRevenue / totalSales : 0;

        long uniqueCustomers = sales.stream()
            .filter(s -> s.getCustomerId() != null)
            .map(Sale::getCustomerId)
            .distinct()
            .count();

        double todayRevenue = sales.stream()
            .filter(s -> s.getCreatedAt().isAfter(today))
            .mapToDouble(Sale::getTotal)
            .sum();
        int todaySalesCount = (int) sales.stream()
            .filter(s -> s.getCreatedAt().isAfter(today))
            .count();

        double weekRevenue = sales.stream()
            .filter(s -> s.getCreatedAt().isAfter(weekAgo))
            .mapToDouble(Sale::getTotal)
            .sum();
        int weekSalesCount = (int) sales.stream()
            .filter(s -> s.getCreatedAt().isAfter(weekAgo))
            .count();

        Map<String, Double> paymentStats = sales.stream()
            .collect(Collectors.groupingBy(
                Sale::getPaymentMethod,
                Collectors.summingDouble(Sale::getTotal)
            ));

        Map<String, Object> todayStats = new HashMap<>();
        todayStats.put("revenue", todayRevenue);
        todayStats.put("salesCount", todaySalesCount);
        todayStats.put("averageCheck", todaySalesCount > 0 ? todayRevenue / todaySalesCount : 0);
        todayStats.put("activeCustomers", uniqueCustomers);
        response.put("todayStats", todayStats);

        Map<String, Object> weekStats = new HashMap<>();
        weekStats.put("revenue", weekRevenue);
        weekStats.put("salesCount", weekSalesCount);
        weekStats.put("averageCheck", weekSalesCount > 0 ? weekRevenue / weekSalesCount : 0);
        response.put("weekStats", weekStats);

        DateTimeFormatter chartDateFormatter = DateTimeFormatter.ofPattern("dd.MM");
        List<Object> chartData = new ArrayList<>();
        LocalDate startDate = weekAgo.toLocalDate();
        LocalDate endDate = today.toLocalDate();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime nextDayStart = date.plusDays(1).atStartOfDay();

            List<Sale> daySales = sales.stream()
                .filter(s -> !s.getCreatedAt().isBefore(dayStart) && s.getCreatedAt().isBefore(nextDayStart))
                .toList();

            double dayRevenue = daySales.stream()
                .mapToDouble(Sale::getTotal)
                .sum();

            Map<String, Object> dayPoint = new HashMap<>();
            dayPoint.put("date", date.toString());
            dayPoint.put("name", date.format(chartDateFormatter));
            dayPoint.put("revenue", dayRevenue);
            dayPoint.put("sales", daySales.size());
            chartData.add(dayPoint);
        }
        response.put("chartData", chartData);

        response.put("lowStockCount", 0);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("totalSales", totalSales);
        analytics.put("averageCheck", avgCheck);
        analytics.put("uniqueCustomers", uniqueCustomers);
        analytics.put("paymentStats", paymentStats);
        response.put("analytics", analytics);

        return response;
    }
}
