package com.horseracing.services;

import com.horseracing.dto.request.RefereeChangeRequestDto;
import com.horseracing.dto.response.RefereeChangeResponseDto;
import com.horseracing.entities.RefereeChangeRequest;
import com.horseracing.entities.Tournament;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.RefereeChangeRequestRepository;
import com.horseracing.repositories.TournamentRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefereeChangeRequestService {

    private final RefereeChangeRequestRepository requestRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;

    @Transactional
    public RefereeChangeResponseDto createRequest(String userEmail, RefereeChangeRequestDto dto) {
        User referee = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        if (referee.getRole() != Role.RACE_REFEREE) {
            throw new RuntimeException("Only referees can create change requests");
        }

        Tournament tournament = tournamentRepository.findById(dto.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (!tournament.getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You are not the assigned referee for this tournament");
        }

        // Check if there is already a pending request
        List<RefereeChangeRequest> existingRequests = requestRepository.findByTournamentId(tournament.getId());
        for (RefereeChangeRequest req : existingRequests) {
            if ("PENDING".equals(req.getStatus())) {
                throw new RuntimeException("There is already a pending change request for this tournament");
            }
        }

        RefereeChangeRequest request = RefereeChangeRequest.builder()
                .referee(referee)
                .tournament(tournament)
                .reason(dto.getReason())
                .status("PENDING")
                .build();

        return RefereeChangeResponseDto.fromEntity(requestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<RefereeChangeResponseDto> getAllRequests() {
        return requestRepository.findAll().stream()
                .map(RefereeChangeResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RefereeChangeResponseDto> getRequestsByReferee(String userEmail) {
        User referee = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));
        return requestRepository.findByRefereeId(referee.getId()).stream()
                .map(RefereeChangeResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public RefereeChangeResponseDto approveRequest(Integer requestId, Integer newRefereeId) {
        RefereeChangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Request is not in PENDING status");
        }

        User newReferee = userRepository.findById(newRefereeId)
                .orElseThrow(() -> new RuntimeException("New referee not found"));

        if (newReferee.getRole() != Role.RACE_REFEREE) {
            throw new RuntimeException("Assigned user must be a referee");
        }

        Tournament tournament = request.getTournament();
        tournament.setReferee(newReferee);
        tournamentRepository.save(tournament);

        request.setStatus("APPROVED");
        return RefereeChangeResponseDto.fromEntity(requestRepository.save(request));
    }

    @Transactional
    public RefereeChangeResponseDto rejectRequest(Integer requestId) {
        RefereeChangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Request is not in PENDING status");
        }

        request.setStatus("REJECTED");
        return RefereeChangeResponseDto.fromEntity(requestRepository.save(request));
    }
}
