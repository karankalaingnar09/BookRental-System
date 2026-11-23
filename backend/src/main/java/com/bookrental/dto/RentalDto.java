package com.bookrental.dto;

import com.bookrental.model.Rental;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RentalDto {

    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookCover;
    private String username;
    private LocalDate rentalDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private Rental.RentalStatus status;
    private BigDecimal totalCost;
    private BigDecimal lateFee;
    private LocalDateTime createdAt;

    @Data
    public static class RentalRequest {
        private Long bookId;
        private Integer rentalDays;
    }

    public static RentalDto from(Rental rental) {
        RentalDto dto = new RentalDto();
        dto.setId(rental.getId());
        dto.setBookId(rental.getBook().getId());
        dto.setBookTitle(rental.getBook().getTitle());
        dto.setBookAuthor(rental.getBook().getAuthor());
        dto.setBookCover(rental.getBook().getCoverImage());
        dto.setUsername(rental.getUser().getUsername());
        dto.setRentalDate(rental.getRentalDate());
        dto.setDueDate(rental.getDueDate());
        dto.setReturnDate(rental.getReturnDate());
        dto.setStatus(rental.getStatus());
        dto.setTotalCost(rental.getTotalCost());
        dto.setLateFee(rental.getLateFee());
        dto.setCreatedAt(rental.getCreatedAt());
        return dto;
    }
}
