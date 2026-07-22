package com.horseracing.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class LiveRaceService {

    // Key is raceId, Value is the list of active emitters for that race
    private final Map<Integer, List<SseEmitter>> raceEmitters = new ConcurrentHashMap<>();

    /**
     * Subscribe a client to real-time updates of a specific race.
     */
    public SseEmitter subscribe(Integer raceId) {
        // Create an emitter with a 10 minutes timeout (standard race duration is much less)
        SseEmitter emitter = new SseEmitter(600_000L);

        List<SseEmitter> emitters =
                raceEmitters.computeIfAbsent(raceId, k -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);

        emitter.onCompletion(() -> {
            log.info("SSE connection completed for race ID: {}", raceId);
            emitters.remove(emitter);
        });
        emitter.onTimeout(() -> {
            log.info("SSE connection timeout for race ID: {}", raceId);
            emitters.remove(emitter);
        });
        emitter.onError((e) -> {
            log.error("SSE connection error for race ID: {}: {}", raceId, e.getMessage());
            emitters.remove(emitter);
        });

        // Send connection success event
        try {
            emitter.send(
                    SseEmitter.event().name("CONNECT").data("Subscribed to live race " + raceId));
        } catch (IOException | IllegalStateException e) {
            emitters.remove(emitter);
        }

        log.info("Client subscribed successfully to race ID: {}. Active listeners: {}", raceId,
                emitters.size());
        return emitter;
    }

    /**
     * Broadcast a single simulation tick update (horse positions) to all active subscribers.
     */
    public void broadcastTick(Integer raceId, Object payload) {
        List<SseEmitter> emitters = raceEmitters.get(raceId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("RACE_TICK").data(payload));
            } catch (IOException | IllegalStateException e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
            log.info("Removed {} dead SSE emitters for race ID: {}. Remaining: {}",
                    deadEmitters.size(), raceId, emitters.size());
        }
    }

    /**
     * Broadcast the final simulation results and close connections cleanly.
     */
    public void broadcastEnd(Integer raceId, Object payload) {
        List<SseEmitter> emitters = raceEmitters.get(raceId);
        if (emitters == null || emitters.isEmpty()) {
            raceEmitters.remove(raceId);
            return;
        }

        log.info("Broadcasting race finished for race ID: {}. Completing {} SSE connections.",
                raceId, emitters.size());
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("RACE_FINISHED").data(payload));
                emitter.complete();
            } catch (IOException | IllegalStateException e) {
                // ignore, complete already handles cleanup if possible
            }
        }
        raceEmitters.remove(raceId);
    }
}
