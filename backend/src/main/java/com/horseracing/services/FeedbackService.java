package com.horseracing.services;

import com.horseracing.dto.request.CreateFeedbackRequest;
import com.horseracing.dto.request.ResolveFeedbackRequest;
import com.horseracing.dto.response.FeedbackResponse;

import java.util.List;

public interface FeedbackService {

    FeedbackResponse createFeedback(String username, CreateFeedbackRequest request);

    List<FeedbackResponse> getAllFeedbacks(String status, String role, String search);

    List<FeedbackResponse> getUserFeedbacks(String username);

    FeedbackResponse resolveFeedback(Integer feedbackId, ResolveFeedbackRequest request);

    FeedbackResponse rejectFeedback(Integer feedbackId, ResolveFeedbackRequest request);
}
