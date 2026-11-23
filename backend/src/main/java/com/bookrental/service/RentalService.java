package com.bookrental.service;

import com.bookrental.dto.RentalDto;
import com.bookrental.model.Book;
import com.bookrental.model.Rental;
import com.bookrental.model.User;
import com.bookrental.repository.BookRepository;
import com.bookrental.repository.RentalRepository;
import com.bookrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private static final BigDecimal LATE_FEE_PER_DAY = new BigDecimal("2.00");

    @Transactional
    public RentalDto rentBook(String username, Long bookId, int rentalDays) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (!book.isAvailable() || book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available for rental");
        }

        Rental rental = new Rental();
        rental.setUser(user);
        rental.setBook(book);
        rental.setRentalDate(LocalDate.now());
        rental.setDueDate(LocalDate.now().plusDays(rentalDays));
        rental.setStatus(Rental.RentalStatus.ACTIVE);
        rental.setTotalCost(book.getRentalPricePerDay().multiply(BigDecimal.valueOf(rentalDays)));

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) book.setAvailable(false);

        bookRepository.save(book);
        return RentalDto.from(rentalRepository.save(rental));
    }

    @Transactional
    public RentalDto returnBook(String username, Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        if (!rental.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        if (rental.getStatus() == Rental.RentalStatus.RETURNED) {
            throw new RuntimeException("Book already returned");
        }

        LocalDate today = LocalDate.now();
        rental.setReturnDate(today);
        rental.setStatus(Rental.RentalStatus.RETURNED);

        if (today.isAfter(rental.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(rental.getDueDate(), today);
            rental.setLateFee(LATE_FEE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays)));
        }

        Book book = rental.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setAvailable(true);
        bookRepository.save(book);

        return RentalDto.from(rentalRepository.save(rental));
    }

    public List<RentalDto> getUserRentals(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return rentalRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(RentalDto::from).collect(Collectors.toList());
    }

    public List<RentalDto> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(RentalDto::from).collect(Collectors.toList());
    }
}
