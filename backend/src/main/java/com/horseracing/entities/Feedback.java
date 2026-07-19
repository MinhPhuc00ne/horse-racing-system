package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255, columnDefinition = "nvarchar(255)")
    private String subject;

    @Column(nullable = false, columnDefinition = "nvarchar(max)")
    private String content;

    @Builder.Default
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20) default 'PENDING'")
    private String status = "PENDING"; // PENDING, RESOLVED

    @Column(name = "admin_note", columnDefinition = "nvarchar(max)")
    private String adminNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
