package com.horseracing.repositories;

import com.horseracing.entities.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    List<Feedback> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
