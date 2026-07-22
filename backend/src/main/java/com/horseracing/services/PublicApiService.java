package com.horseracing.services;

import com.horseracing.dto.response.HorseLeaderboardDto;
import com.horseracing.dto.response.JockeyLeaderboardDto;
import com.horseracing.dto.response.PublicLeaderboardResponse;
import com.horseracing.dto.response.PublicStatsResponse;
import com.horseracing.entities.Horse;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.repositories.HorseRepository;
import com.horseracing.repositories.JockeyProfileRepository;
import com.horseracing.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicApiService {

    private final JockeyProfileRepository jockeyProfileRepository;
    private final HorseRepository horseRepository;
    private final TournamentRepository tournamentRepository;

    public PublicLeaderboardResponse getLeaderboard() {
        List<JockeyProfile> jockeys = jockeyProfileRepository.findAllByOrderByRankingScoreDescWinRateDesc(PageRequest.of(0, 5));
        List<Horse> horses = horseRepository.findAllByOrderBySpeedRatingDesc(PageRequest.of(0, 5));

        List<JockeyLeaderboardDto> jockeyDtos = new ArrayList<>();
        int jRank = 1;
        for (JockeyProfile j : jockeys) {
            String name = (j.getUser() != null && j.getUser().getFullName() != null) ? j.getUser().getFullName() : "Unknown Jockey";
            jockeyDtos.add(JockeyLeaderboardDto.builder()
                    .rank(jRank++)
                    .fullName(name)
                    .winRate(j.getWinRate() != null ? j.getWinRate() : 0.0)
                    .rankingScore(j.getRankingScore() != null ? j.getRankingScore() : 0)
                    .build());
        }

        List<HorseLeaderboardDto> horseDtos = new ArrayList<>();
        int hRank = 1;
        for (Horse h : horses) {
            String breedName = (h.getBreed() != null && h.getBreed().getBreedName() != null) ? h.getBreed().getBreedName() : "Unknown Breed";
            horseDtos.add(HorseLeaderboardDto.builder()
                    .rank(hRank++)
                    .horseName(h.getName())
                    .breedName(breedName)
                    .rating(h.getSpeedRating() != null ? h.getSpeedRating() : 50.0)
                    .build());
        }

        return PublicLeaderboardResponse.builder()
                .jockeys(jockeyDtos)
                .horses(horseDtos)
                .build();
    }

    public PublicStatsResponse getStats() {
        long activeTournaments = tournamentRepository.countActiveOrUpcomingTournaments();
        if (activeTournaments == 0) {
            activeTournaments = tournamentRepository.countByTournamentStatusIgnoreCase("Active");
        }

        BigDecimal totalPrizePoolVND = tournamentRepository.sumTotalPrize();
        long activeHorses = horseRepository.countByStatusNotIgnoreCase("BLACK_LISTED");

        return PublicStatsResponse.builder()
                .activeTournaments(activeTournaments)
                .totalPrizePoolVND(totalPrizePoolVND != null ? totalPrizePoolVND : BigDecimal.ZERO)
                .activeHorses(activeHorses)
                .build();
    }
}
