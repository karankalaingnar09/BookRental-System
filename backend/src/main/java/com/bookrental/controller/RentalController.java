package com.bookrental.controller;

import com.bookrental.dto.RentalDto;
import com.bookrental.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping("/rent")
    public ResponseEntity<RentalDto> rentBook(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestBody RentalDto.RentalRequest request) {
        return ResponseEntity.ok(rentalService.rentBook(
                userDetails.getUsername(), request.getBookId(), request.getRentalDays()));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<RentalDto> returnBook(@AuthenticationPrincipal UserDetails userDetails,
                                                 @PathVariable Long id) {
        return ResponseEntity.ok(rentalService.returnBook(userDetails.getUsername(), id));
    }

    @GetMapping("/my")
    public List<RentalDto> getMyRentals(@AuthenticationPrincipal UserDetails userDetails) {
        return rentalService.getUserRentals(userDetails.getUsername());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RentalDto> getAllRentals() {
        return rentalService.getAllRentals();
    }
}
