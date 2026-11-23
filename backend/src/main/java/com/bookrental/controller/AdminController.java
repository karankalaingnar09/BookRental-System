package com.bookrental.controller;

import com.bookrental.repository.BookRepository;
import com.bookrental.repository.RentalRepository;
import com.bookrental.repository.UserRepository;
import com.bookrental.model.Rental;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final BookRepository bookRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public StatsResponse getStats() {
        BigDecimal totalRevenue = rentalRepository.findAll().stream()
                .map(r -> {
                    BigDecimal cost = r.getTotalCost() != null ? r.getTotalCost() : BigDecimal.ZERO;
                    BigDecimal fee = r.getLateFee() != null ? r.getLateFee() : BigDecimal.ZERO;
                    return cost.add(fee);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        StatsResponse stats = new StatsResponse();
        stats.setTotalBooks(bookRepository.count());
        stats.setAvailableBooks(bookRepository.findByAvailableTrue().size());
        stats.setTotalUsers(userRepository.count());
        stats.setActiveRentals(rentalRepository.countByStatus(Rental.RentalStatus.ACTIVE));
        stats.setOverdueRentals(rentalRepository.countByStatus(Rental.RentalStatus.OVERDUE));
        stats.setReturnedRentals(rentalRepository.countByStatus(Rental.RentalStatus.RETURNED));
        stats.setTotalRevenue(totalRevenue);
        return stats;
    }

    @Data
    public static class StatsResponse {
        private long totalBooks;
        private long availableBooks;
        private long totalUsers;
        private long activeRentals;
        private long overdueRentals;
        private long returnedRentals;
        private BigDecimal totalRevenue;
    }
}
