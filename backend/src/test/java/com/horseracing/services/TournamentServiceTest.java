package com.horseracing.services;

import com.horseracing.dto.request.CreateTournamentRequest;
import com.horseracing.dto.request.UpdateTournamentRequest;
import com.horseracing.dto.request.RegisterRaceRequest;
import com.horseracing.entities.*;
import com.horseracing.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TournamentServiceTest {

    @Mock
    private TournamentRepository tournamentRepository;
    @Mock
    private RaceRepository raceRepository;
    @Mock
    private RaceRegistrationRepository raceRegistrationRepository;
    @Mock
    private HorseRepository horseRepository;
    @Mock
    private HorseOwnerProfileRepository horseOwnerProfileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RaceTrackRepository raceTrackRepository;
    @Mock
    private RaceParticipantRepository raceParticipantRepository;

    @InjectMocks
    private TournamentService tournamentService;

    @InjectMocks
    private RaceRegistrationService raceRegistrationService;

    private User refereeUser;
    private Tournament tournament;

    @BeforeEach
    public void setUp() {
        refereeUser = User.builder().id(3).fullName("Test Referee").role(com.horseracing.entities.enums.Role.RACE_REFEREE).build();
        tournament = Tournament.builder()
                .id(1)
                .tournamentName("Spring Championship 2026")
                .tournamentStatus("Upcoming")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .referee(refereeUser)
                .build();
    }

    @Test
    void testCreateTournament_StartDateInPast() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Past Tournament")
                .startDate(LocalDate.now().minusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .build();

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Start date cannot be in the past", ex.getMessage());
    }

    @Test
    void testCreateTournament_EndDateInPast() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Past Tournament 2")
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().minusDays(1))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .build();

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Start date must be before end date", ex.getMessage());
    }

    @Test
    void testUpdateTournament_NotUpcoming() {
        tournament.setTournamentStatus("Active");
        when(tournamentRepository.findById(1)).thenReturn(Optional.of(tournament));

        UpdateTournamentRequest request = UpdateTournamentRequest.builder()
                .tournamentName("Active Update")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .build();

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.updateTournament(1, request));
        assertEquals("Cannot update a tournament unless it is in Upcoming status", ex.getMessage());
    }

    @Test
    void testSubmitRegistration_InvalidAge() {
        tournament.setAllowedAges("2-3, trên 7");
        Race race = Race.builder().id(5).tournament(tournament).status("OPEN_FOR_REGISTER").build();
        
        User ownerUser = User.builder().id(10).email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();
        
        HorseBreed breed = HorseBreed.builder().id(1).breedName("Arabian").build();
        Horse horse = Horse.builder().id(4).name("Lightning").owner(owner).breed(breed).age(5).gender("Male").build(); // Age 5 is not in "2-3, trên 7"

        RegisterRaceRequest request = RegisterRaceRequest.builder()
                .raceId(5)
                .horseId(4)
                .jockeyId(2)
                .ownerSharePercent(70.0)
                .jockeySharePercent(30.0)
                .build();

        when(horseOwnerProfileRepository.findByUserEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(horseRepository.findById(4)).thenReturn(Optional.of(horse));

        Exception ex = assertThrows(RuntimeException.class, () -> raceRegistrationService.submitRegistration("owner@test.com", request));
        assertTrue(ex.getMessage().contains("Horse age 5 is not allowed"));
    }

    @Test
    void testSubmitRegistration_InvalidBreed() {
        tournament.setAllowedClasses("Arabian, Thoroughbred");
        Race race = Race.builder().id(5).tournament(tournament).status("OPEN_FOR_REGISTER").build();
        
        User ownerUser = User.builder().id(10).email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();
        
        HorseBreed breed = HorseBreed.builder().id(1).breedName("Mustang").build(); // Mustang is not allowed
        Horse horse = Horse.builder().id(4).name("Lightning").owner(owner).breed(breed).age(3).gender("Male").build();

        RegisterRaceRequest request = RegisterRaceRequest.builder()
                .raceId(5)
                .horseId(4)
                .jockeyId(2)
                .ownerSharePercent(70.0)
                .jockeySharePercent(30.0)
                .build();

        when(horseOwnerProfileRepository.findByUserEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(horseRepository.findById(4)).thenReturn(Optional.of(horse));

        Exception ex = assertThrows(RuntimeException.class, () -> raceRegistrationService.submitRegistration("owner@test.com", request));
        assertTrue(ex.getMessage().contains("Horse breed 'Mustang' is not allowed"));
    }

    @Test
    void testSubmitRegistration_InvalidGender() {
        tournament.setAllowedGenders("Female");
        Race race = Race.builder().id(5).tournament(tournament).status("OPEN_FOR_REGISTER").build();
        
        User ownerUser = User.builder().id(10).email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();
        
        HorseBreed breed = HorseBreed.builder().id(1).breedName("Arabian").build();
        Horse horse = Horse.builder().id(4).name("Lightning").owner(owner).breed(breed).age(3).gender("Male").build(); // Male is not allowed

        RegisterRaceRequest request = RegisterRaceRequest.builder()
                .raceId(5)
                .horseId(4)
                .jockeyId(2)
                .ownerSharePercent(70.0)
                .jockeySharePercent(30.0)
                .build();

        when(horseOwnerProfileRepository.findByUserEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(horseRepository.findById(4)).thenReturn(Optional.of(horse));

        Exception ex = assertThrows(RuntimeException.class, () -> raceRegistrationService.submitRegistration("owner@test.com", request));
        assertTrue(ex.getMessage().contains("Horse gender 'Male' is not allowed"));
    }

    @Test
    void testSubmitRegistration_BeforeOpeningTime() {
        tournament.setRegistrationOpeningTime(LocalDateTime.now().plusDays(1));
        Race race = Race.builder().id(5).tournament(tournament).status("OPEN_FOR_REGISTER").build();
        
        User ownerUser = User.builder().id(10).email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();
        
        HorseBreed breed = HorseBreed.builder().id(1).breedName("Arabian").build();
        Horse horse = Horse.builder().id(4).name("Lightning").owner(owner).breed(breed).age(3).gender("Male").build();

        RegisterRaceRequest request = RegisterRaceRequest.builder()
                .raceId(5)
                .horseId(4)
                .jockeyId(2)
                .ownerSharePercent(70.0)
                .jockeySharePercent(30.0)
                .build();

        when(horseOwnerProfileRepository.findByUserEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(horseRepository.findById(4)).thenReturn(Optional.of(horse));

        Exception ex = assertThrows(RuntimeException.class, () -> raceRegistrationService.submitRegistration("owner@test.com", request));
        assertEquals("Registration has not opened yet", ex.getMessage());
    }

    @Test
    void testSubmitRegistration_AfterDeadline() {
        tournament.setRegistrationDeadline(LocalDateTime.now().minusDays(1));
        Race race = Race.builder().id(5).tournament(tournament).status("OPEN_FOR_REGISTER").build();
        
        User ownerUser = User.builder().id(10).email("owner@test.com").build();
        HorseOwnerProfile owner = HorseOwnerProfile.builder().id(1).user(ownerUser).build();
        
        HorseBreed breed = HorseBreed.builder().id(1).breedName("Arabian").build();
        Horse horse = Horse.builder().id(4).name("Lightning").owner(owner).breed(breed).age(3).gender("Male").build();

        RegisterRaceRequest request = RegisterRaceRequest.builder()
                .raceId(5)
                .horseId(4)
                .jockeyId(2)
                .ownerSharePercent(70.0)
                .jockeySharePercent(30.0)
                .build();

        when(horseOwnerProfileRepository.findByUserEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(horseRepository.findById(4)).thenReturn(Optional.of(horse));

        Exception ex = assertThrows(RuntimeException.class, () -> raceRegistrationService.submitRegistration("owner@test.com", request));
        assertEquals("Registration deadline has passed", ex.getMessage());
    }

    @Test
    void testConfirmRegistration_LessThanMinSlots() {
        tournament.setMinSlots(5);
        Race race = Race.builder().id(5).tournament(tournament).status("OPEN_FOR_REGISTER").maxHorses(8).build();

        List<RaceRegistration> regs = new ArrayList<>();
        regs.add(RaceRegistration.builder().id(101).status("PENDING").build());
        regs.add(RaceRegistration.builder().id(102).status("APPROVED").build()); // only 2 registrations, min is 5

        when(raceRepository.findById(5)).thenReturn(Optional.of(race));
        when(raceRegistrationRepository.findByRaceId(5)).thenReturn(regs);

        Exception ex = assertThrows(RuntimeException.class, () -> raceRegistrationService.confirmRegistration(5));
        assertTrue(ex.getMessage().contains("is less than the minimum slots required"));
    }

    @Test
    void testCreateTournament_InvalidMaxSlots() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(13) // Invalid slots (must be 2 to 12)
                .build();

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Maximum slots must be between 2 and 12", ex.getMessage());
    }

    @Test
    void testCreateTournament_InvalidMinSlots() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .minSlots(1) // Invalid min slots (must be 2 to 12)
                .build();

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Minimum slots must be between 2 and 12", ex.getMessage());
    }

    @Test
    void testCreateTournament_RegistrationDeadlineInPast() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().minusMinutes(5)) // Deadline in the past
                .build();

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Registration deadline cannot be in the past", ex.getMessage());
    }

    @Test
    void testCreateTournament_RefereeRequired() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .build();

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Referee ID is required", ex.getMessage());
    }

    @Test
    void testCreateTournament_RefereeNotFound() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .refereeId(999)
                .build();

        when(userRepository.findById(999)).thenReturn(Optional.empty());

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Referee not found", ex.getMessage());
    }

    @Test
    void testCreateTournament_InvalidRefereeRole() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .refereeId(3)
                .build();

        User nonReferee = User.builder().id(3).fullName("Not a Referee").role(com.horseracing.entities.enums.Role.SPECTATOR).build();
        when(userRepository.findById(3)).thenReturn(Optional.of(nonReferee));

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("User must have RACE_REFEREE role", ex.getMessage());
    }

    @Test
    void testCreateTournament_LocationRequired() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .refereeId(3)
                .build();

        User ref = User.builder().id(3).fullName("Referee").role(com.horseracing.entities.enums.Role.RACE_REFEREE).build();
        when(userRepository.findById(3)).thenReturn(Optional.of(ref));

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Location (venue name or region) is required", ex.getMessage());
    }

    @Test
    void testCreateTournament_TrackNotFound() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .location("Unknown Track")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .refereeId(3)
                .build();

        User ref = User.builder().id(3).fullName("Referee").role(com.horseracing.entities.enums.Role.RACE_REFEREE).build();
        when(userRepository.findById(3)).thenReturn(Optional.of(ref));
        when(raceTrackRepository.findByName("Unknown Track")).thenReturn(Optional.empty());
        when(raceTrackRepository.findAll()).thenReturn(new ArrayList<>());

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Race track not found: Unknown Track", ex.getMessage());
    }

    @Test
    void testCreateTournament_ScheduleOverlap() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .location("Phu Tho")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .officialRaceTime(LocalDateTime.now().plusDays(5).withHour(9).withMinute(0))
                .refereeId(3)
                .build();

        User ref = User.builder().id(3).fullName("Referee").role(com.horseracing.entities.enums.Role.RACE_REFEREE).build();
        when(userRepository.findById(3)).thenReturn(Optional.of(ref));

        RaceTrack track = RaceTrack.builder().id(10).name("Phu Tho").location("TPHCM").build();
        when(raceTrackRepository.findByName("Phu Tho")).thenReturn(Optional.of(track));

        Race existingRace = Race.builder()
                .id(1)
                .startTime(java.time.LocalTime.of(8, 30))
                .endTime(java.time.LocalTime.of(9, 30)) // overlaps with 9:00 - 10:00
                .tournament(tournament)
                .build();

        when(raceRepository.findByRaceTrackIdAndRaceDate(10, request.getStartDate())).thenReturn(List.of(existingRace));

        Exception ex = assertThrows(RuntimeException.class, () -> tournamentService.createTournament(request));
        assertEquals("Race timing overlaps with another race on the same track", ex.getMessage());
    }

    @Test
    void testCreateTournament_Success() {
        CreateTournamentRequest request = CreateTournamentRequest.builder()
                .tournamentName("Test Tournament")
                .location("Phu Tho")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .prizeFirst(BigDecimal.valueOf(100.0))
                .prizeSecond(BigDecimal.valueOf(50.0))
                .prizeThird(BigDecimal.valueOf(25.0))
                .minBetAmount(BigDecimal.valueOf(10.0))
                .maxSlots(8)
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .officialRaceTime(LocalDateTime.now().plusDays(5).withHour(10).withMinute(0))
                .refereeId(3)
                .surfaceType("Grass")
                .build();

        User ref = User.builder().id(3).fullName("Referee").role(com.horseracing.entities.enums.Role.RACE_REFEREE).build();
        when(userRepository.findById(3)).thenReturn(Optional.of(ref));

        RaceTrack track = RaceTrack.builder().id(10).name("Phu Tho").location("TPHCM").build();
        when(raceTrackRepository.findByName("Phu Tho")).thenReturn(Optional.of(track));
        when(raceRepository.findByRaceTrackIdAndRaceDate(10, request.getStartDate())).thenReturn(new ArrayList<>());
        
        Tournament savedTournament = Tournament.builder()
                .id(100)
                .tournamentName(request.getTournamentName())
                .location(track.getName())
                .maxSlots(request.getMaxSlots())
                .startDate(request.getStartDate())
                .totalPrize(BigDecimal.valueOf(175.0))
                .referee(ref)
                .build();

        when(tournamentRepository.save(any(Tournament.class))).thenReturn(savedTournament);

        com.horseracing.dto.response.TournamentResponse response = tournamentService.createTournament(request);

        assertNotNull(response);
        assertEquals(100, response.getId());
        assertEquals("Phu Tho", response.getLocation());
        verify(raceRepository, times(1)).save(any(Race.class));
    }
}
