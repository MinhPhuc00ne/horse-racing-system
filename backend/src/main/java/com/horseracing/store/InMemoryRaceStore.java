package com.horseracing.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class InMemoryRaceStore {

    private final Map<Integer, LiveRaceState> activeRaces = new ConcurrentHashMap<>();

    public void startRace(Integer raceId, LiveRaceState state) {
        activeRaces.put(raceId, state);
    }

    public LiveRaceState getRaceState(Integer raceId) {
        return activeRaces.get(raceId);
    }

    public void removeRace(Integer raceId) {
        activeRaces.remove(raceId);
    }

    public boolean hasRunningRace(Integer raceId) {
        LiveRaceState state = activeRaces.get(raceId);
        return state != null && "RUNNING".equalsIgnoreCase(state.getStatus());
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LiveRaceState {
        private Integer simulationId;
        private Integer raceId;
        private String raceName;
        private double distance;
        private int currentTick;
        private String status; // RUNNING, FINISHED, CANCELLED
        private Integer povHorseId;
        @Builder.Default
        private List<HorseStateInMemory> horses = new CopyOnWriteArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HorseStateInMemory {
        private Integer horseId;
        private String horseName;
        private Integer jockeyId;
        private String jockeyName;
        private double speedRating;
        private double rankingScore;
        private double currentPosition;
        private double speed;
        private double stamina;
        private String status; // RACING, FINISHED, DISQUALIFIED
        private Integer finishTime;
        private Integer finalRank;
        @Builder.Default
        private List<Integer> flaggedPositions = new CopyOnWriteArrayList<>();
        @Builder.Default
        private List<String> flagDescriptions = new CopyOnWriteArrayList<>();
        private long penaltyFlagsCount;
    }
}
