package com.horseracing.repositories;

import com.horseracing.entities.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    List<Feedback> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
