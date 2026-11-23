package com.bookrental.repository;

import com.bookrental.model.Rental;
import com.bookrental.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    List<Rental> findByUser(User user);

    List<Rental> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT r FROM Rental r WHERE r.status = 'ACTIVE' AND r.dueDate < :today")
    List<Rental> findOverdueRentals(LocalDate today);

    long countByStatus(Rental.RentalStatus status);
}
