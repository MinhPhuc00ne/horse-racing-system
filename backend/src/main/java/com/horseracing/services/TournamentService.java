package com.horseracing.services;

import com.horseracing.dto.request.CreateTournamentRequest;
import com.horseracing.dto.response.TournamentResponse;
import com.horseracing.entities.Tournament;
import com.horseracing.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;

    @Transactional
    public TournamentResponse createTournament(CreateTournamentRequest request) {
        if (request.getPrizeFirst().compareTo(BigDecimal.ZERO) < 0 ||
            request.getPrizeSecond().compareTo(BigDecimal.ZERO) < 0 ||
            request.getPrizeThird().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Prize money must be positive or zero");
        }
        if (request.getMinBetAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Minimum bet amount must be positive or zero");
        }

        BigDecimal totalPrize = request.getPrizeFirst()
                .add(request.getPrizeSecond())
                .add(request.getPrizeThird());

        Tournament tournament = Tournament.builder()
                .tournamentName(request.getTournamentName())
                .location(request.getLocation())
                .description(request.getDescription())
                .registrationDeadline(request.getRegistrationDeadline())
                .maxSlots(request.getMaxSlots())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrize(totalPrize)
                .tournamentStatus("Upcoming")
                .prizeFirst(request.getPrizeFirst())
                .prizeSecond(request.getPrizeSecond())
                .prizeThird(request.getPrizeThird())
                .minBetAmount(request.getMinBetAmount())
                .build();

        tournament = tournamentRepository.save(tournament);
        return TournamentResponse.fromEntity(tournament);
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(TournamentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TournamentResponse getTournamentById(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return TournamentResponse.fromEntity(tournament);
    }
}
