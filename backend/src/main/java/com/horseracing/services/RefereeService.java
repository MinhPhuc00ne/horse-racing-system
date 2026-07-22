package com.horseracing.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.horseracing.dto.request.AddBlacklistRequest;
import com.horseracing.dto.request.AddFlagRequest;
import com.horseracing.dto.request.UpdateConditionsRequest;
import com.horseracing.dto.response.FlagResponse;
import com.horseracing.dto.response.PreCheckResponse;
import com.horseracing.dto.response.RaceSimulationStateResponse;
import com.horseracing.dto.response.RefereeRaceResponse;
import com.horseracing.dto.response.TournamentResponse;
import com.horseracing.dto.response.ViolationResponse;
import com.horseracing.entities.BanHistory;
import com.horseracing.entities.Blacklist;
import com.horseracing.entities.Horse;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.PrizeDistribution;
import com.horseracing.entities.Race;
import com.horseracing.entities.RaceParticipant;
import com.horseracing.entities.RaceRegistration;
import com.horseracing.entities.RaceSimulation;
import com.horseracing.entities.RefereeFlag;
import com.horseracing.entities.SimulationHorseState;
import com.horseracing.entities.Tournament;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.entities.enums.NotificationType;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.BanHistoryRepository;
import com.horseracing.repositories.BlacklistRepository;
import com.horseracing.repositories.HorseRepository;
import com.horseracing.repositories.JockeyProfileRepository;
import com.horseracing.repositories.PrizeDistributionRepository;
import com.horseracing.repositories.RaceParticipantRepository;
import com.horseracing.repositories.RaceRegistrationRepository;
import com.horseracing.repositories.RaceRepository;
import com.horseracing.repositories.RaceSimulationRepository;
import com.horseracing.repositories.RefereeFlagRepository;
import com.horseracing.repositories.SimulationHorseStateRepository;
import com.horseracing.repositories.TournamentRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.repositories.WalletRepository;
import com.horseracing.repositories.WalletTransactionRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefereeService {

    private final UserRepository userRepository;
    private final RaceRepository raceRepository;
    private final RaceParticipantRepository raceParticipantRepository;
    private final RaceRegistrationRepository raceRegistrationRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final HorseRepository horseRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final RaceSimulationRepository raceSimulationRepository;
    private final SimulationHorseStateRepository simulationHorseStateRepository;
    private final RefereeFlagRepository refereeFlagRepository;
    private final BlacklistRepository blacklistRepository;
    private final BanHistoryRepository banHistoryRepository;
    private final PrizeDistributionRepository prizeDistributionRepository;
    private final PlatformTransactionManager transactionManager;
    private final NotificationService notificationService;
    private final TournamentRepository tournamentRepository;
    private final LiveRaceService liveRaceService;
    private final PredictionPayoutService predictionPayoutService;

    private TransactionTemplate transactionTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final ConcurrentHashMap<Integer, ScheduledFuture<?>> activeSimulations = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Transactional(readOnly = true)
    public List<RefereeRaceResponse> getAssignedRaces(String refereeEmail, String status) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        List<Race> races = new ArrayList<>(raceRepository.findByRefereeId(referee.getId()));

        // Auto-assign the demo race to the current referee so any logged-in referee can run it
        try {
            raceRepository.findAll().stream()
                    .filter(r -> "Trận Giả Lập 4 Ngựa (Demo)".equalsIgnoreCase(r.getRaceName()))
                    .filter(r -> races.stream().noneMatch(existing -> existing.getId().equals(r.getId())))
                    .forEach(r -> {
                        r.setReferee(referee);
                        raceRepository.save(r);
                        races.add(r);
                    });
        } catch (Exception e) {
            // Ignore if transactional flush is pending
        }

        List<RefereeRaceResponse> result = new ArrayList<>();

        for (Race r : races) {
            boolean matches = false;
            if (status == null || status.isBlank()) {
                matches = true;
            } else if ("upcoming".equalsIgnoreCase(status) || "preparation".equalsIgnoreCase(status)) {
                matches = "Upcoming".equalsIgnoreCase(r.getStatus())
                        || "OPEN_FOR_REGISTER".equalsIgnoreCase(r.getStatus())
                        || "CLOSED_FOR_REGISTER".equalsIgnoreCase(r.getStatus())
                        || "LOCKED_LIST".equalsIgnoreCase(r.getStatus());
            } else if ("running".equalsIgnoreCase(status) || "ongoing".equalsIgnoreCase(status)) {
                matches = "RUNNING".equalsIgnoreCase(r.getStatus());
            } else if ("finished".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) {
                boolean hasFinishedSim = raceSimulationRepository.findByRaceId(r.getId()).stream()
                        .anyMatch(sim -> "FINISHED".equalsIgnoreCase(sim.getStatus()));
                matches = "FINISHED".equalsIgnoreCase(r.getStatus()) || hasFinishedSim;
            }

            if (matches) {
                result.add(RefereeRaceResponse.fromEntity(r));
            }
        }
        return result;
    }

    @Transactional
    public void cancelAssignment(Integer tournamentId, String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getReferee() == null || !tournament.getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You are not the assigned referee for this tournament");
        }

        if (tournament.getRegistrationDeadline() != null && java.time.LocalDateTime.now().isAfter(tournament.getRegistrationDeadline())) {
            throw new RuntimeException("Cannot cancel assignment after registration has closed");
        }

        tournament.setReferee(null);
        tournamentRepository.save(tournament);

        List<Race> races = raceRepository.findByTournamentId(tournamentId);
        for (Race race : races) {
            if (race.getReferee() != null && race.getReferee().getId().equals(referee.getId())) {
                race.setReferee(null);
                raceRepository.save(race);
            }
        }

        // Notify all ADMIN users about referee cancellation
        try {
            List<User> adminUsers = userRepository.findByRole(Role.ADMIN);
            String title = "Trọng tài từ chối / hủy phân công";
            String refereeName = referee.getFullName() != null ? referee.getFullName() : referee.getUsername();
            String content = String.format("Trọng tài %s đã hủy phân công tham gia giải đấu '%s' (Mã: #%d). Vui lòng phân công trọng tài khác.",
                    refereeName,
                    tournament.getTournamentName(),
                    tournament.getId());

            for (User admin : adminUsers) {
                notificationService.sendNotification(admin, title, content, NotificationType.SYSTEM_ALERT);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to admin users on referee cancel assignment: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getAssignedTournaments(String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        return tournamentRepository.findByRefereeId(referee.getId()).stream()
                .map(TournamentResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHorsesToInspect(String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        List<Race> races = raceRepository.findByRefereeId(referee.getId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (Race r : races) {
            if ("CLOSED_FOR_REGISTER".equalsIgnoreCase(r.getStatus()) || "OPEN_FOR_REGISTER".equalsIgnoreCase(r.getStatus()) || "LOCKED_LIST".equalsIgnoreCase(r.getStatus())) {
                List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(r.getId());
                for (RaceParticipant p : participants) {
                    if ("PENDING_INSPECTION".equalsIgnoreCase(p.getStatus())) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", p.getId());
                        map.put("horseName", p.getHorse().getName());
                        map.put("breed", p.getHorse().getBreed() != null ? p.getHorse().getBreed().getBreedName() : "Unknown");
                        map.put("jockeyName", p.getJockey().getUser().getFullName());
                        map.put("weight", p.getJockey().getWeight());
                        map.put("status", p.getStatus());
                        map.put("raceName", r.getRaceName());
                        result.add(map);
                    }
                }
            }
        }
        return result;
    }

    @Transactional
    public void updateInspectionStatus(Integer participantId, String status, String reason, String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        RaceParticipant participant = raceParticipantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        if (!participant.getRace().getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You are not assigned to this race");
        }

        participant.setStatus(status);
        raceParticipantRepository.save(participant);

        if ("REJECTED".equalsIgnoreCase(status)) {
            // Also notify owner and jockey
            RaceRegistration reg = raceRegistrationRepository
                    .findFirstByRaceIdAndHorseId(participant.getRace().getId(), participant.getHorse().getId())
                    .orElse(null);

            if (reg != null) {
                reg.setStatus("REJECTED");
                raceRegistrationRepository.save(reg);

                notificationService.sendNotification(
                        reg.getOwner().getUser(),
                        "Ngựa không vượt qua vòng kiểm tra trước trận",
                        "Ngựa " + participant.getHorse().getName() + " đã bị từ chối tham gia vòng đua " + participant.getRace().getRaceName() + " bởi Trọng tài. Lý do: " + reason + ". Lệ phí tham gia không được hoàn lại.",
                        NotificationType.RACE_STATUS
                );
            }

            // Refund all spectator bets on this horse in this race
            predictionPayoutService.refundBetsForParticipant(participant, reason,
                    "Ngựa " + participant.getHorse().getName() + " không vượt qua vòng kiểm tra trước trận. Hệ thống đã hoàn trả 100% số tiền đặt cược ({amount} VNĐ) vào ví của bạn.");
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats(String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        List<Race> races = raceRepository.findByRefereeId(referee.getId());
        long upcomingRaces = races.stream()
                .filter(r -> "Upcoming".equalsIgnoreCase(r.getStatus()) || "OPEN_FOR_REGISTER".equalsIgnoreCase(r.getStatus()) || "CLOSED_FOR_REGISTER".equalsIgnoreCase(r.getStatus()) || "LOCKED_LIST".equalsIgnoreCase(r.getStatus()))
                .count();

        long horsesToInspect = 0;
        for (Race r : races) {
            if ("CLOSED_FOR_REGISTER".equalsIgnoreCase(r.getStatus()) || "OPEN_FOR_REGISTER".equalsIgnoreCase(r.getStatus()) || "LOCKED_LIST".equalsIgnoreCase(r.getStatus())) {
                horsesToInspect += raceParticipantRepository.findByRaceId(r.getId()).stream()
                        .filter(p -> "PENDING_INSPECTION".equalsIgnoreCase(p.getStatus()))
                        .count();
            }
        }

        long violationsIssued = refereeFlagRepository.count(); // Could filter by referee

        Map<String, Object> stats = new HashMap<>();
        stats.put("upcomingRaces", upcomingRaces);
        stats.put("horsesToInspect", horsesToInspect);
        stats.put("violationsIssued", violationsIssued);

        return stats;
    }

    @Transactional(readOnly = true)
    public PreCheckResponse getPreCheck(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);
        List<PreCheckResponse.ParticipantPreCheck> list = new ArrayList<>();

        for (RaceParticipant p : participants) {
            JockeyProfile jockey = p.getJockey();
            list.add(PreCheckResponse.ParticipantPreCheck.builder()
                    .participantId(p.getId())
                    .horseId(p.getHorse().getId())
                    .horseName(p.getHorse().getName())
                    .jockeyId(jockey.getId())
                    .jockeyName(jockey.getUser().getFullName())
                    .registeredWeight(jockey.getWeight())
                    .actualWeight(jockey.getWeight()) // actualWeight can be updated via the weight endpoint
                    .status(p.getStatus())
                    .horseImageUrl(p.getHorse().getImageUrl())
                    .build());
        }

        return PreCheckResponse.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .trackCondition(race.getRaceTrack() != null ? race.getRaceTrack().getShape() : "Unknown")
                .weather(race.getWeather())
                .participants(list)
                .build();
    }

    @Transactional
    public RefereeRaceResponse updateConditions(Integer raceId, UpdateConditionsRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (request.getWeather() != null) {
            race.setWeather(request.getWeather());
        }
        if (request.getTrackCondition() != null) {
            race.setSurfaceType(request.getTrackCondition());
        }

        race = raceRepository.save(race);
        return RefereeRaceResponse.fromEntity(race);
    }

    @Transactional
    public void updateJockeyWeight(Integer raceId, Integer jockeyId, Double actualWeight) {
        JockeyProfile jockey = jockeyProfileRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        jockey.setWeight(actualWeight);
        jockeyProfileRepository.save(jockey);
    }

    @Transactional
    public void disqualifyParticipant(Integer raceId, Integer participantId, String reason) {
        RaceParticipant participant = raceParticipantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        participant.setStatus("DISQUALIFIED");
        raceParticipantRepository.save(participant);

        RaceRegistration reg = raceRegistrationRepository
                .findFirstByRaceIdAndHorseId(raceId, participant.getHorse().getId())
                .orElse(null);
        if (reg != null) {
            reg.setStatus("REJECTED");
            raceRegistrationRepository.save(reg);

            // Notify Owner and Jockey
            notificationService.sendNotification(
                    reg.getOwner().getUser(),
                    "Truất quyền thi đấu trước trận",
                    "Cặp đấu của bạn (Ngựa: " + participant.getHorse().getName() + ", Jockey: " + participant.getJockey().getUser().getFullName() + ") đã bị Trọng tài loại khỏi vòng đua " + participant.getRace().getRaceName() + " do vi phạm điều lệ thi đấu. Lý do: " + reason + ". Phí tham gia không được hoàn lại.",
                    NotificationType.RACE_STATUS
            );
            notificationService.sendNotification(
                    reg.getJockey().getUser(),
                    "Truất quyền thi đấu trước trận",
                    "Cặp đấu của bạn (Ngựa: " + participant.getHorse().getName() + ", Jockey: " + participant.getJockey().getUser().getFullName() + ") đã bị Trọng tài loại khỏi vòng đua " + participant.getRace().getRaceName() + " do vi phạm điều lệ thi đấu. Lý do: " + reason + ". Phí tham gia không được hoàn lại.",
                    NotificationType.RACE_STATUS
            );
        }

        // Refund all spectator bets on this horse in this race
        predictionPayoutService.refundBetsForParticipant(participant, reason,
                "Ngựa " + participant.getHorse().getName() + " đã bị loại khỏi vòng đua " + participant.getRace().getRaceName() + " trước giờ chạy. Hệ thống đã hoàn trả 100% số tiền đặt cược ({amount} VNĐ) vào ví của bạn.");
    }

    @Transactional
    public void startRace(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        String status = race.getStatus();
        boolean isValidStatus = "OPEN_FOR_REGISTER".equalsIgnoreCase(status)
                || "CLOSED_FOR_REGISTER".equalsIgnoreCase(status)
                || "LOCKED_LIST".equalsIgnoreCase(status)
                || "RUNNING".equalsIgnoreCase(status)
                || "FINISHED".equalsIgnoreCase(status);
        if (!isValidStatus) {
            throw new RuntimeException("Trạng thái cuộc đua phải là OPEN_FOR_REGISTER, CLOSED_FOR_REGISTER, LOCKED_LIST, RUNNING hoặc FINISHED để bắt đầu");
        }

        // Clean up previous simulations and horse states for this race if any exist
        List<RaceSimulation> oldSims = raceSimulationRepository.findByRaceId(raceId);
        for (RaceSimulation oldSim : oldSims) {
            List<RefereeFlag> flags = refereeFlagRepository.findBySimulationId(oldSim.getId());
            refereeFlagRepository.deleteAll(flags);
            
            List<SimulationHorseState> states = simulationHorseStateRepository.findBySimulationId(oldSim.getId());
            simulationHorseStateRepository.deleteAll(states);
            
            raceSimulationRepository.delete(oldSim);
        }

        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);

        // Validate all participants have been inspected (not in PENDING_INSPECTION status)
        boolean hasPendingInspection = participants.stream()
                .anyMatch(p -> "PENDING_INSPECTION".equalsIgnoreCase(p.getStatus()));
        if (hasPendingInspection) {
            throw new RuntimeException("Cannot start race. All participants must be inspected first.");
        }

        // Validate we have at least one approved participant to start the race simulation
        long approvedCount = participants.stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()) 
                        || "FINISHED".equalsIgnoreCase(p.getStatus()) 
                        || "RACING".equalsIgnoreCase(p.getStatus()))
                .count();
        if (approvedCount == 0) {
            throw new RuntimeException("Cannot start race. No approved participants in this race.");
        }

        race.setStatus("RUNNING");
        raceRepository.save(race);

        Tournament tournament = race.getTournament();
        if ("Upcoming".equalsIgnoreCase(tournament.getTournamentStatus())) {
            tournament.setTournamentStatus("Active");
            raceRepository.save(race); // save via cascade or directly
        }

        // Reject and refund any remaining PENDING or PENDING_JOCKEY registrations
        List<RaceRegistration> remainingRegs = raceRegistrationRepository.findByRaceId(raceId).stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "PENDING_JOCKEY".equalsIgnoreCase(r.getStatus()))
                .collect(java.util.stream.Collectors.toList());
        BigDecimal entryFee = tournament.getEntryFee();
        for (RaceRegistration reg : remainingRegs) {
            reg.setStatus("REJECTED");
            raceRegistrationRepository.save(reg);

            if (entryFee != null && entryFee.compareTo(BigDecimal.ZERO) > 0) {
                Wallet wallet = walletRepository.findByUserId(reg.getOwner().getUser().getId())
                        .orElseThrow(() -> new RuntimeException("Wallet not found"));
                wallet.setBalance(wallet.getBalance().add(entryFee));
                walletRepository.save(wallet);

                WalletTransaction transaction = WalletTransaction.builder()
                        .wallet(wallet)
                        .transactionType("REFUND")
                        .amount(entryFee)
                        .status("SUCCESS")
                        .referenceType("RACE_REGISTRATION")
                        .referenceId(reg.getId())
                        .build();
                walletTransactionRepository.save(transaction);
            }
        }

        RaceSimulation simulation = RaceSimulation.builder()
                .race(race)
                .startTime(LocalDateTime.now())
                .status("RUNNING")
                .currentTick(0)
                .build();
        simulation = raceSimulationRepository.save(simulation);

        for (RaceParticipant p : participants) {
            if ("APPROVED".equalsIgnoreCase(p.getStatus()) 
                    || "FINISHED".equalsIgnoreCase(p.getStatus()) 
                    || "RACING".equalsIgnoreCase(p.getStatus())) {
                p.setStatus("RACING");
                p.setFinishTime(null);
                p.setFinalRank(null);
                raceParticipantRepository.save(p);

                SimulationHorseState state = SimulationHorseState.builder()
                        .simulation(simulation)
                        .horse(p.getHorse())
                        .currentPosition(0.0)
                        .speed(0.0)
                        .stamina(100.0)
                        .status("RACING")
                        .build();
                simulationHorseStateRepository.save(state);
            }
        }

        startSimulation(simulation.getId());
    }

    @SuppressWarnings("all")
    private void startSimulation(Integer simulationId) {
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                Object tickPayload = transactionTemplate.execute(status -> {
                    RaceSimulation sim = raceSimulationRepository.findById(simulationId).orElse(null);
                    if (sim == null || !"RUNNING".equals(sim.getStatus())) {
                        return null; // Stop task
                    }

                    sim.setCurrentTick(sim.getCurrentTick() + 1);
                    raceSimulationRepository.save(sim);

                    Race race = sim.getRace();
                    List<SimulationHorseState> states = simulationHorseStateRepository.findBySimulationId(simulationId);

                    boolean allFinishedOrDisqualified = true;
                    List<Map<String, Object>> horseStates = new ArrayList<>();

                    for (SimulationHorseState state : states) {
                        List<RefereeFlag> flags = refereeFlagRepository.findBySimulationIdAndHorseId(simulationId, state.getHorse().getId());
                        List<Integer> flaggedPositions = new ArrayList<>();
                        for (RefereeFlag flag : flags) {
                            try {
                                String desc = flag.getDescription();
                                if (desc != null && desc.contains("at ") && desc.contains("%")) {
                                    String numStr = desc.substring(desc.indexOf("at ") + 3, desc.indexOf("%")).trim();
                                    flaggedPositions.add(Integer.valueOf(numStr));
                                }
                            } catch (NumberFormatException | IndexOutOfBoundsException e) {
                                // Ignore
                            }
                        }

                        if ("FINISHED".equals(state.getStatus()) || "DISQUALIFIED".equals(state.getStatus())) {
                            Map<String, Object> hState = new HashMap<>();
                            hState.put("horseId", state.getHorse().getId());
                            hState.put("horseName", state.getHorse().getName());
                            hState.put("currentPosition", state.getCurrentPosition());
                            hState.put("speed", state.getSpeed());
                            hState.put("stamina", state.getStamina());
                            hState.put("status", state.getStatus());
                            hState.put("flaggedPositions", flaggedPositions);
                            horseStates.add(hState);
                            continue;
                        }

                        allFinishedOrDisqualified = false;

                        Horse horse = state.getHorse();
                        RaceParticipant part = raceParticipantRepository.findByRaceIdAndHorseId(race.getId(), horse.getId())
                                .orElse(null);

                        if (part == null || "DISQUALIFIED".equals(part.getStatus())) {
                            state.setStatus("DISQUALIFIED");
                            simulationHorseStateRepository.save(state);
                            continue;
                        }

                        JockeyProfile jockey = part.getJockey();

                        double baseSpeed = 15.0;
                        if (horse.getSpeedRating() != null) {
                            baseSpeed += horse.getSpeedRating() * 0.05;
                        }
                        if (jockey.getRankingScore() != null) {
                            baseSpeed += jockey.getRankingScore() * 0.001;
                        }

                        double currentStamina = state.getStamina();
                        if (sim.getCurrentTick() > 5) {
                            currentStamina = Math.max(0.0, currentStamina - 2.0);
                        }
                        state.setStamina(currentStamina);

                        double staminaFactor = currentStamina < 30.0 ? 0.8 : 1.0;
                        double variation = (ThreadLocalRandom.current().nextDouble() - 0.5) * 1.5;

                        double speed = 0.0;
                        if (sim.getCurrentTick() > 5) {
                            speed = (baseSpeed + variation) * staminaFactor;
                            if (speed < 5.0) speed = 5.0;
                        }

                        state.setSpeed(speed);

                        double newPos = state.getCurrentPosition() + speed;
                        state.setCurrentPosition(newPos);

                        if (newPos >= race.getDistance()) {
                            state.setStatus("FINISHED");
                            part.setFinishTime(sim.getCurrentTick());
                            raceParticipantRepository.save(part);
                        }

                        simulationHorseStateRepository.save(state);

                        Map<String, Object> hState = new HashMap<>();
                        hState.put("horseId", horse.getId());
                        hState.put("horseName", horse.getName());
                        hState.put("currentPosition", newPos);
                        hState.put("speed", speed);
                        hState.put("stamina", currentStamina);
                        hState.put("status", state.getStatus());
                        hState.put("flaggedPositions", flaggedPositions);
                        horseStates.add(hState);
                    }

                    Map<String, Object> response = new HashMap<>();
                    response.put("raceId", race.getId());
                    response.put("currentTick", sim.getCurrentTick());
                    response.put("horses", horseStates);
                    response.put("povHorseId", sim.getPovHorseId());

                    if (allFinishedOrDisqualified) {
                        sim.setStatus("FINISHED");
                        sim.setEndTime(LocalDateTime.now());
                        raceSimulationRepository.save(sim);

                        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(race.getId());
                        List<ParticipantRankInfo> rankInfos = new ArrayList<>();
                        for (RaceParticipant p : participants) {
                            if ("DISQUALIFIED".equals(p.getStatus())) {
                                continue;
                            }
                            long flags = refereeFlagRepository.countBySimulationIdAndHorseId(sim.getId(), p.getHorse().getId());
                            Integer ft = p.getFinishTime();
                            int finishTime = ft != null ? ft : 9999;
                            int finalTime = finishTime + (int)(flags * 3);
                            p.setFinishTime(finalTime);

                            rankInfos.add(new ParticipantRankInfo(p, finalTime));
                        }

                        rankInfos.sort(Comparator.comparingInt(a -> a.finalTime));

                        List<Map<String, Object>> results = new ArrayList<>();
                        for (int rank = 0; rank < rankInfos.size(); rank++) {
                            RaceParticipant p = rankInfos.get(rank).participant;
                            p.setFinalRank(rank + 1);
                            p.setStatus("FINISHED");
                            raceParticipantRepository.save(p);

                            Map<String, Object> rMap = new HashMap<>();
                            rMap.put("rank", rank + 1);
                            rMap.put("horseName", p.getHorse().getName());
                            rMap.put("jockeyName", p.getJockey().getUser().getFullName());
                            rMap.put("time", p.getFinishTime());
                            results.add(rMap);
                        }

                        int nextRank = rankInfos.size() + 1;
                        for (RaceParticipant p : participants) {
                            if ("DISQUALIFIED".equals(p.getStatus())) {
                                p.setFinalRank(nextRank++);
                                raceParticipantRepository.save(p);
                            }
                        }

                        response.put("status", "FINISHED");
                        response.put("results", results);
                        return response;
                    }

                    return response;
                });

                if (tickPayload == null) {
                    cancelSimulation(simulationId);
                } else if (tickPayload instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) tickPayload;
                    Integer raceId = (Integer) map.get("raceId");
                    boolean finished = "FINISHED".equals(map.get("status"));
                    if (finished) {
                        cancelSimulation(simulationId);
                        liveRaceService.broadcastEnd(raceId, map);
                    } else {
                        liveRaceService.broadcastTick(raceId, map);
                    }
                }
            } catch (RuntimeException e) {
                log.error("Error occurred during race simulation for simulation ID: {}", simulationId, e);
                cancelSimulation(simulationId);
            }
        }, 1, 1, TimeUnit.SECONDS);

        activeSimulations.put(simulationId, future);
    }

    private void cancelSimulation(Integer simulationId) {
        ScheduledFuture<?> future = activeSimulations.remove(simulationId);
        if (future != null) {
            future.cancel(true);
        }
    }

    @Transactional
    public void updatePov(Integer raceId, Integer horseId) {
        RaceSimulation simulation = raceSimulationRepository.findFirstByRaceIdAndStatus(raceId, "RUNNING")
                .orElseThrow(() -> new RuntimeException("No running simulation found"));
        simulation.setPovHorseId(horseId);
        raceSimulationRepository.save(simulation);
    }

    @Transactional
    public FlagResponse addFlag(Integer raceId, AddFlagRequest request, String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        RaceSimulation simulation;
        if (request.getSimulationId() != null) {
            simulation = raceSimulationRepository.findById(request.getSimulationId())
                    .orElseThrow(() -> new RuntimeException("Simulation not found"));
        } else {
            simulation = raceSimulationRepository.findFirstByRaceIdAndStatus(raceId, "RUNNING")
                    .orElseGet(() -> {
                        List<RaceSimulation> sims = raceSimulationRepository.findByRaceId(raceId);
                        if (sims.isEmpty()) {
                            throw new RuntimeException("No simulation found for this race");
                        }
                        return sims.get(sims.size() - 1);
                    });
        }

        RefereeFlag flag = RefereeFlag.builder()
                .referee(referee)
                .horse(horse)
                .simulation(simulation)
                .violationType(request.getViolationType())
                .description(request.getDescription())
                .build();
        refereeFlagRepository.save(flag);

        long count = refereeFlagRepository.countBySimulationIdAndHorseId(simulation.getId(), horse.getId());
        boolean disqualified = false;
        RaceParticipant part = raceParticipantRepository.findByRaceIdAndHorseId(raceId, horse.getId())
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        if (count >= 3) {
            disqualified = true;
            // Disqualify participant
            part.setStatus("DISQUALIFIED");
            raceParticipantRepository.save(part);

            SimulationHorseState state = simulationHorseStateRepository.findBySimulationIdAndHorseId(simulation.getId(), horse.getId())
                    .orElseThrow(() -> new RuntimeException("Simulation state not found"));
            state.setStatus("DISQUALIFIED");
            simulationHorseStateRepository.save(state);
        }

        if (disqualified) {
            notificationService.sendNotification(
                    horse.getOwner().getUser(),
                    "Truất quyền thi đấu do nhận đủ 3 cờ vi phạm",
                    "Ngựa " + horse.getName() + " đã bị xử thua và truất quyền thi đấu trực tiếp (Disqualified) tại vòng đua " + part.getRace().getRaceName() + " do nhận đủ 3 cờ vi phạm từ Trọng tài.",
                    NotificationType.RACE_STATUS
            );
            notificationService.sendNotification(
                    part.getJockey().getUser(),
                    "Truất quyền thi đấu do nhận đủ 3 cờ vi phạm",
                    "Ngựa " + horse.getName() + " đã bị xử thua và truất quyền thi đấu trực tiếp (Disqualified) tại vòng đua " + part.getRace().getRaceName() + " do nhận đủ 3 cờ vi phạm từ Trọng tài.",
                    NotificationType.RACE_STATUS
            );
        } else {
            notificationService.sendNotification(
                    horse.getOwner().getUser(),
                    "Cảnh cáo vi phạm trên sân đua",
                    "Cảnh cáo: Ngựa " + horse.getName() + " của bạn bị Trọng tài gắn cờ vi phạm (" + request.getViolationType() + " - " + request.getDescription() + ") tại vòng đua " + part.getRace().getRaceName() + ". Tổng số cờ hiện tại: " + count + "/3. Bị phạt cộng thêm " + (count * 3) + " giây vào thời gian về đích.",
                    NotificationType.RACE_STATUS
            );
            notificationService.sendNotification(
                    part.getJockey().getUser(),
                    "Cảnh cáo vi phạm trên sân đua",
                    "Cảnh cáo: Ngựa " + horse.getName() + " của bạn bị Trọng tài gắn cờ vi phạm (" + request.getViolationType() + " - " + request.getDescription() + ") tại vòng đua " + part.getRace().getRaceName() + ". Tổng số cờ hiện tại: " + count + "/3. Bị phạt cộng thêm " + (count * 3) + " giây vào thời gian về đích.",
                    NotificationType.RACE_STATUS
            );
        }

        return FlagResponse.builder()
                .flagId(flag.getId())
                .horseId(horse.getId())
                .totalFlags(count)
                .penaltySeconds((int) (count * 3))
                .isDisqualified(disqualified)
                .build();
    }

    @Transactional
    public void addBlacklist(AddBlacklistRequest request, String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Blacklist blacklist = Blacklist.builder()
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .startDate(request.getEndDate() != null ? LocalDate.now() : LocalDate.now())
                .endDate(request.getEndDate())
                .isPermanent(request.getIsPermanent())
                .status("ACTIVE")
                .build();
        blacklist = blacklistRepository.save(blacklist);

        BanHistory history = BanHistory.builder()
                .blacklist(blacklist)
                .actionBy(referee)
                .actionNote(request.getReason())
                .build();
        banHistoryRepository.save(history);

        if ("USER".equalsIgnoreCase(request.getTargetType())) {
            User target = userRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Target user not found"));
            target.setEnabled(false);
            userRepository.save(target);

            notificationService.sendNotification(
                    target,
                    "Tài khoản bị tạm khóa / Đưa vào Blacklist",
                    "Tài khoản của bạn đã bị khóa bởi Trọng tài. Lý do: " + request.getReason() + ". Thời hạn cấm: " + (Boolean.TRUE.equals(request.getIsPermanent()) ? "Vĩnh viễn" : request.getEndDate()) + ". Vui lòng liên hệ Admin để được giải quyết.",
                    NotificationType.SYSTEM_ALERT
            );
        } else if ("HORSE".equalsIgnoreCase(request.getTargetType())) {
            Horse target = horseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Target horse not found"));
            target.setStatus("INACTIVE");
            horseRepository.save(target);

            notificationService.sendNotification(
                    target.getOwner().getUser(),
                    "Chiến mã bị đưa vào Blacklist",
                    "Ngựa " + target.getName() + " của bạn đã bị đưa vào Blacklist bởi Trọng tài. Lý do: " + request.getReason() + ".",
                    NotificationType.SYSTEM_ALERT
            );
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRaceResults(Integer raceId) {
        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (RaceParticipant p : participants) {
            Map<String, Object> map = new HashMap<>();
            map.put("rank", p.getFinalRank());
            map.put("horseName", p.getHorse().getName());
            map.put("jockeyName", p.getJockey().getUser().getFullName());
            map.put("time", p.getFinishTime() != null ? p.getFinishTime() + "s" : "N/A");
            result.add(map);
        }
        result.sort(Comparator.comparing(m -> (Integer) m.getOrDefault("rank", 999)));
        return result;
    }

    @Transactional
    public void confirmResults(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (!"RUNNING".equalsIgnoreCase(race.getStatus())) {
            throw new RuntimeException("Race is not running or already confirmed");
        }

        boolean hasFinishedSim = raceSimulationRepository.findByRaceId(raceId).stream()
                .anyMatch(sim -> "FINISHED".equalsIgnoreCase(sim.getStatus()));
        if (!hasFinishedSim) {
            throw new RuntimeException("Cannot confirm results. The race simulation has not finished yet.");
        }

        race.setStatus("FINISHED");
        raceRepository.save(race);

        Tournament tournament = race.getTournament();
        if (tournament != null) {
            List<Race> races = raceRepository.findByTournamentId(tournament.getId());
            boolean allFinished = races.stream()
                    .allMatch(r -> "FINISHED".equalsIgnoreCase(r.getStatus()) || r.getId().equals(raceId));
            if (allFinished) {
                tournament.setTournamentStatus("Finished");
            }
        }

        // 1. Refund bets on disqualified/rejected participants
        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);
        for (RaceParticipant p : participants) {
            if ("DISQUALIFIED".equalsIgnoreCase(p.getStatus()) || "REJECTED".equalsIgnoreCase(p.getStatus())) {
                predictionPayoutService.refundBetsForParticipant(p, "DISQUALIFIED_OR_REJECTED",
                        "Ngựa " + p.getHorse().getName() + " đã bị loại hoặc từ chối kết quả tại vòng đua " + race.getRaceName() + ". Hệ thống đã hoàn trả 100% số tiền đặt cược ({amount} VNĐ) vào ví của bạn.");
            }
        }

        // 2. Prize Distribution
        for (RaceParticipant p : participants) {
            if (p.getFinalRank() != null && p.getFinalRank() <= 3) {
                BigDecimal totalPrize = BigDecimal.ZERO;
                if (tournament != null) {
                    totalPrize = switch (p.getFinalRank()) {
                        case 1 -> tournament.getPrizeFirst();
                        case 2 -> tournament.getPrizeSecond();
                        case 3 -> tournament.getPrizeThird();
                        default -> BigDecimal.ZERO;
                    };
                }

                if (totalPrize == null) totalPrize = BigDecimal.ZERO;

                RaceRegistration reg = raceRegistrationRepository
                        .findFirstByRaceIdAndHorseId(raceId, p.getHorse().getId())
                        .orElse(null);

                if (reg != null && totalPrize.compareTo(BigDecimal.ZERO) > 0) {
                    Double ownerShare = reg.getOwnerSharePercent();
                    double ownerPercent = ownerShare != null ? ownerShare : 100.0;
                    Double jockeyShare = reg.getJockeySharePercent();
                    double jockeyPercent = jockeyShare != null ? jockeyShare : 0.0;

                    BigDecimal ownerAmount = totalPrize.multiply(BigDecimal.valueOf(ownerPercent / 100.0));
                    BigDecimal jockeyAmount = totalPrize.multiply(BigDecimal.valueOf(jockeyPercent / 100.0));

                    // Distribute to Owner
                    Wallet ownerWallet = walletRepository.findByUserId(reg.getOwner().getUser().getId())
                            .orElseGet(() -> {
                                Wallet w = Wallet.builder().user(reg.getOwner().getUser()).balance(BigDecimal.ZERO).build();
                                return walletRepository.save(w);
                            });
                    ownerWallet.setBalance(ownerWallet.getBalance().add(ownerAmount));
                    walletRepository.save(ownerWallet);

                    WalletTransaction wtOwner = WalletTransaction.builder()
                            .wallet(ownerWallet)
                            .transactionType("PRIZE")
                            .amount(ownerAmount)
                            .status("SUCCESS")
                            .referenceType("RACE_PARTICIPANT")
                            .referenceId(p.getId())
                            .build();
                    walletTransactionRepository.save(wtOwner);

                    // Distribute to Jockey
                    Wallet jockeyWallet = walletRepository.findByUserId(reg.getJockey().getUser().getId())
                            .orElseGet(() -> {
                                Wallet w = Wallet.builder().user(reg.getJockey().getUser()).balance(BigDecimal.ZERO).build();
                                return walletRepository.save(w);
                            });
                    jockeyWallet.setBalance(jockeyWallet.getBalance().add(jockeyAmount));
                    walletRepository.save(jockeyWallet);

                    WalletTransaction wtJockey = WalletTransaction.builder()
                            .wallet(jockeyWallet)
                            .transactionType("PRIZE")
                            .amount(jockeyAmount)
                            .status("SUCCESS")
                            .referenceType("RACE_PARTICIPANT")
                            .referenceId(p.getId())
                            .build();
                    walletTransactionRepository.save(wtJockey);

                    // Save PrizeDistribution
                    PrizeDistribution pd = PrizeDistribution.builder()
                            .participant(p)
                            .totalPrize(totalPrize)
                            .ownerAmount(ownerAmount)
                            .jockeyAmount(jockeyAmount)
                            .platformFee(BigDecimal.ZERO)
                            .status("DISTRIBUTED")
                            .distributedAt(LocalDateTime.now())
                            .build();
                    prizeDistributionRepository.save(pd);

                    notificationService.sendNotification(
                            reg.getOwner().getUser(),
                            "Nhận tiền thưởng giải đấu",
                            "Chúc mừng! Ngựa " + p.getHorse().getName() + " và Jockey " + p.getJockey().getUser().getFullName() + " đã đạt Giải " + (p.getFinalRank() == 1 ? "Nhất" : (p.getFinalRank() == 2 ? "Nhì" : "Ba")) + " tại vòng đua " + race.getRaceName() + ". Số tiền thưởng " + ownerAmount + " VNĐ đã được cộng vào ví của bạn.",
                            NotificationType.WALLET
                    );

                    notificationService.sendNotification(
                            reg.getJockey().getUser(),
                            "Nhận tiền thưởng giải đấu",
                            "Chúc mừng! Ngựa " + p.getHorse().getName() + " và Jockey " + p.getJockey().getUser().getFullName() + " đã đạt Giải " + (p.getFinalRank() == 1 ? "Nhất" : (p.getFinalRank() == 2 ? "Nhì" : "Ba")) + " tại vòng đua " + race.getRaceName() + ". Số tiền thưởng " + jockeyAmount + " VNĐ đã được cộng vào ví của bạn.",
                            NotificationType.WALLET
                    );
                }
            }
        }

        // 2. Betting Payout (Pari-Mutuel Option 1: Split-Pools)
        predictionPayoutService.processPayouts(raceId, participants, race);
    }

    @Transactional
    public void cancelRace(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if ("FINISHED".equalsIgnoreCase(race.getStatus()) || "CANCELLED".equalsIgnoreCase(race.getStatus())) {
            throw new RuntimeException("Race is already finished or cancelled");
        }

        // 1. Stop any running simulation
        Optional<RaceSimulation> activeSimOpt = raceSimulationRepository.findFirstByRaceIdAndStatus(raceId, "RUNNING");
        if (activeSimOpt.isPresent()) {
            RaceSimulation sim = activeSimOpt.get();
            sim.setStatus("CANCELLED");
            sim.setEndTime(LocalDateTime.now());
            raceSimulationRepository.save(sim);
            cancelSimulation(sim.getId());
        }

        // Update race status
        race.setStatus("CANCELLED");
        raceRepository.save(race);

        // 2. Refund spectator bets
        predictionPayoutService.refundBetsForRace(race);

        // 3. Refund owner entry fees for non-rejected registrations
        List<RaceRegistration> regs = raceRegistrationRepository.findByRaceId(raceId);
        BigDecimal entryFee = race.getTournament().getEntryFee();
        for (RaceRegistration reg : regs) {
            if ("APPROVED".equalsIgnoreCase(reg.getStatus()) || "PENDING".equalsIgnoreCase(reg.getStatus()) || "PENDING_JOCKEY".equalsIgnoreCase(reg.getStatus())) {
                reg.setStatus("CANCELLED");
                raceRegistrationRepository.save(reg);

                if (entryFee != null && entryFee.compareTo(BigDecimal.ZERO) > 0) {
                    Wallet wallet = walletRepository.findByUserId(reg.getOwner().getUser().getId())
                            .orElseGet(() -> {
                                Wallet w = Wallet.builder().user(reg.getOwner().getUser()).balance(BigDecimal.ZERO).build();
                                return walletRepository.save(w);
                            });
                    wallet.setBalance(wallet.getBalance().add(entryFee));
                    walletRepository.save(wallet);

                    WalletTransaction transaction = WalletTransaction.builder()
                            .wallet(wallet)
                            .transactionType("REFUND")
                            .amount(entryFee)
                            .status("SUCCESS")
                            .referenceType("RACE_REGISTRATION")
                            .referenceId(reg.getId())
                            .build();
                    walletTransactionRepository.save(transaction);
                }

                notificationService.sendNotification(
                        reg.getOwner().getUser(),
                        "Hủy cuộc đua và hoàn lệ phí",
                        "Cuộc đua " + race.getRaceName() + " đã bị hủy bỏ bởi Ban tổ chức. Lệ phí tham gia (" + (entryFee != null ? entryFee : BigDecimal.ZERO) + " VNĐ) đã được hoàn lại vào ví của bạn.",
                        NotificationType.REGISTRATION
                );

                notificationService.sendNotification(
                        reg.getJockey().getUser(),
                        "Hủy cuộc đua",
                        "Cuộc đua " + race.getRaceName() + " đã bị hủy bỏ bởi Ban tổ chức.",
                        NotificationType.REGISTRATION
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPrizeDistributions(Integer raceId) {
        List<PrizeDistribution> pds = prizeDistributionRepository.findByParticipantRaceId(raceId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (PrizeDistribution pd : pds) {
            Map<String, Object> map = new HashMap<>();
            map.put("rank", pd.getParticipant().getFinalRank());
            map.put("horseName", pd.getParticipant().getHorse().getName());
            map.put("jockeyName", pd.getParticipant().getJockey().getUser().getFullName());
            map.put("ownerName", pd.getParticipant().getHorse().getOwner().getUser().getFullName());
            map.put("totalPrize", pd.getTotalPrize());

            RaceRegistration reg = raceRegistrationRepository
                    .findFirstByRaceIdAndHorseId(raceId, pd.getParticipant().getHorse().getId())
                    .orElse(null);
            if (reg != null) {
                map.put("jockeySharePercent", reg.getJockeySharePercent());
                map.put("ownerSharePercent", reg.getOwnerSharePercent());
            } else {
                map.put("jockeySharePercent", 0.0);
                map.put("ownerSharePercent", 100.0);
            }

            map.put("jockeyAmount", pd.getJockeyAmount());
            map.put("ownerAmount", pd.getOwnerAmount());
            map.put("distributedAt", pd.getDistributedAt());
            result.add(map);
        }
        result.sort(Comparator.comparing(m -> (Integer) m.getOrDefault("rank", 999)));
        return result;
    }

    @Transactional(readOnly = true)
    public List<ViolationResponse> getViolations() {
        List<ViolationResponse> list = new ArrayList<>();

        // 1. Get all RefereeFlags
        List<RefereeFlag> flags = refereeFlagRepository.findAll();
        for (RefereeFlag flag : flags) {
            String dateStr = flag.getCreatedAt() != null
                    ? flag.getCreatedAt().toLocalDate().toString()
                    : "";

            String raceName = flag.getSimulation() != null && flag.getSimulation().getRace() != null
                    ? flag.getSimulation().getRace().getRaceName()
                    : "N/A";

            String horseName = flag.getHorse() != null ? flag.getHorse().getName() : "N/A";

            String jockeyName = "N/A";
            if (flag.getSimulation() != null && flag.getSimulation().getRace() != null && flag.getHorse() != null) {
                Optional<RaceParticipant> partOpt = raceParticipantRepository.findByRaceIdAndHorseId(
                        flag.getSimulation().getRace().getId(),
                        flag.getHorse().getId()
                );
                if (partOpt.isPresent() && partOpt.get().getJockey() != null && partOpt.get().getJockey().getUser() != null) {
                    jockeyName = partOpt.get().getJockey().getUser().getFullName();
                }
            }

            list.add(ViolationResponse.builder()
                    .id(flag.getId())
                    .date(dateStr)
                    .raceName(raceName)
                    .horseName(horseName)
                    .jockeyName(jockeyName)
                    .violationType(flag.getViolationType())
                    .status("FLAGGED")
                    .build());
        }

        // 2. Get all Blacklist entries
        List<Blacklist> blacklists = blacklistRepository.findAll();
        for (Blacklist bl : blacklists) {
            String dateStr = bl.getCreatedAt() != null
                    ? bl.getCreatedAt().toLocalDate().toString()
                    : (bl.getStartDate() != null ? bl.getStartDate().toString() : "");

            String raceName = "N/A";
            String horseName = "N/A";
            String jockeyName = "N/A";

            if ("HORSE".equalsIgnoreCase(bl.getTargetType())) {
                Optional<Horse> horseOpt = horseRepository.findById(bl.getTargetId());
                if (horseOpt.isPresent()) {
                    Horse horse = horseOpt.get();
                    horseName = horse.getName();

                    List<RaceParticipant> participants = raceParticipantRepository.findByHorseId(horse.getId());
                    if (!participants.isEmpty()) {
                        participants.sort((p1, p2) -> p2.getId().compareTo(p1.getId()));
                        RaceParticipant recent = participants.get(0);
                        if (recent.getRace() != null) {
                            raceName = recent.getRace().getRaceName();
                        }
                        if (recent.getJockey() != null && recent.getJockey().getUser() != null) {
                            jockeyName = recent.getJockey().getUser().getFullName();
                        }
                    }
                }
            } else if ("USER".equalsIgnoreCase(bl.getTargetType())) {
                Optional<User> userOpt = userRepository.findById(bl.getTargetId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    jockeyName = user.getFullName();

                    Optional<JockeyProfile> jockeyOpt = jockeyProfileRepository.findByUserId(user.getId());
                    if (jockeyOpt.isPresent()) {
                        List<RaceParticipant> participants = raceParticipantRepository.findByJockeyUserEmailAndStatusNot(user.getEmail(), "DUMMY_STATUS_THAT_NOT_EXIST");
                        if (!participants.isEmpty()) {
                            participants.sort((p1, p2) -> p2.getId().compareTo(p1.getId()));
                            RaceParticipant recent = participants.get(0);
                            if (recent.getRace() != null) {
                                raceName = recent.getRace().getRaceName();
                            }
                            if (recent.getHorse() != null) {
                                horseName = recent.getHorse().getName();
                            }
                        }
                    }
                }
            }

            list.add(ViolationResponse.builder()
                    .id(bl.getId())
                    .date(dateStr)
                    .raceName(raceName)
                    .horseName(horseName)
                    .jockeyName(jockeyName)
                    .violationType(bl.getReason())
                    .status("BLACKLISTED")
                    .build());
        }

        // Sort by date descending, then id descending
        list.sort((v1, v2) -> {
            int dateCompare = v2.getDate().compareTo(v1.getDate());
            if (dateCompare != 0) return dateCompare;
            return v2.getId().compareTo(v1.getId());
        });

        return list;
    }

    @Transactional(readOnly = true)
    public RaceSimulationStateResponse getSimulationState(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        Double distanceObj = race.getDistance();
        double distance = distanceObj != null ? distanceObj : 1200.0;

        List<RaceSimulation> simulations = raceSimulationRepository.findByRaceId(raceId);
        if (simulations.isEmpty()) {
            return RaceSimulationStateResponse.builder()
                    .simulationId(null)
                    .raceId(raceId)
                    .status("NOT_STARTED")
                    .currentTick(0)
                    .distance(distance)
                    .horseStates(new ArrayList<>())
                    .build();
        }

        // Get the latest simulation
        simulations.sort((s1, s2) -> s2.getId().compareTo(s1.getId()));
        RaceSimulation sim = simulations.get(0);

        List<SimulationHorseState> states = simulationHorseStateRepository.findBySimulationId(sim.getId());
        List<RaceSimulationStateResponse.HorseStateDto> horseStates = new ArrayList<>();

        for (SimulationHorseState state : states) {
            String jockeyName = "N/A";
            Optional<RaceParticipant> partOpt = raceParticipantRepository.findByRaceIdAndHorseId(raceId, state.getHorse().getId());
            if (partOpt.isPresent() && partOpt.get().getJockey() != null && partOpt.get().getJockey().getUser() != null) {
                jockeyName = partOpt.get().getJockey().getUser().getFullName();
            }

            horseStates.add(RaceSimulationStateResponse.HorseStateDto.builder()
                    .horseId(state.getHorse().getId())
                    .horseName(state.getHorse().getName())
                    .jockeyName(jockeyName)
                    .currentPosition(state.getCurrentPosition())
                    .speed(state.getSpeed())
                    .stamina(state.getStamina())
                    .status(state.getStatus())
                    .build());
        }

        return RaceSimulationStateResponse.builder()
                .simulationId(sim.getId())
                .raceId(raceId)
                .status(sim.getStatus())
                .currentTick(sim.getCurrentTick())
                .distance(distance)
                .horseStates(horseStates)
                .build();
    }

    private static class ParticipantRankInfo {
        RaceParticipant participant;
        int finalTime;

        ParticipantRankInfo(RaceParticipant participant, int finalTime) {
            this.participant = participant;
            this.finalTime = finalTime;
        }
    }
}
