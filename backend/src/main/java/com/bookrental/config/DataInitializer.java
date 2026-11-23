package com.bookrental.config;

import com.bookrental.model.Book;
import com.bookrental.model.User;
import com.bookrental.repository.BookRepository;
import com.bookrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@bookrental.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            admin.setRoles(Set.of("USER", "ADMIN"));
            userRepository.save(admin);
        }

        // Seed books
        if (bookRepository.count() == 0) {
            bookRepository.saveAll(List.of(
                createBook("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565",
                    "Classic", "A story of the fabulously wealthy Jay Gatsby.",
                    "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg", "1.50", 5),
                createBook("To Kill a Mockingbird", "Harper Lee", "978-0061935466",
                    "Fiction", "A gripping tale of racial injustice and childhood innocence.",
                    "https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg", "1.75", 4),
                createBook("1984", "George Orwell", "978-0451524935",
                    "Dystopian", "A chilling prophecy about the future.",
                    "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg", "2.00", 6),
                createBook("Pride and Prejudice", "Jane Austen", "978-0141439518",
                    "Romance", "A romantic novel of manners.",
                    "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg", "1.25", 3),
                createBook("The Hobbit", "J.R.R. Tolkien", "978-0547928227",
                    "Fantasy", "A fantasy novel about the adventures of Bilbo Baggins.",
                    "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg", "2.50", 4),
                createBook("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "978-0439708180",
                    "Fantasy", "The first book in the Harry Potter series.",
                    "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg", "2.00", 8),
                createBook("The Alchemist", "Paulo Coelho", "978-0062315007",
                    "Adventure", "A philosophical novel about following your dreams.",
                    "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg", "1.50", 5),
                createBook("Brave New World", "Aldous Huxley", "978-0060850524",
                    "Dystopian", "A dystopian novel set in a futuristic World State.",
                    "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg", "1.75", 3)
            ));
        }
    }

    private Book createBook(String title, String author, String isbn, String genre,
                             String desc, String cover, String price, int copies) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn);
        book.setGenre(genre);
        book.setDescription(desc);
        book.setCoverImage(cover);
        book.setRentalPricePerDay(new BigDecimal(price));
        book.setTotalCopies(copies);
        book.setAvailableCopies(copies);
        book.setAvailable(true);
        return book;
    }
}
