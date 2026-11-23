package com.bookrental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false)
    private String author;

    private String isbn;
    private String genre;
    private String description;
    private String coverImage;

    @Positive
    @Column(nullable = false)
    private BigDecimal rentalPricePerDay;

    @Column(nullable = false)
    private Integer totalCopies = 1;

    @Column(nullable = false)
    private Integer availableCopies = 1;

    @Column(nullable = false)
    private boolean available = true;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
