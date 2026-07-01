package com.horseracing.services;

import com.horseracing.dto.request.TrackRequest;
import com.horseracing.dto.response.TrackResponse;
import com.horseracing.entities.RaceTrack;
import com.horseracing.repositories.RaceTrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TrackService {

    private final RaceTrackRepository raceTrackRepository;

    @Transactional
    public TrackResponse createTrack(TrackRequest request) {
        String shape = request.getShape();
        if (shape == null || shape.isBlank()) {
            shape = "OVAL";
        }

        if (!"STRAIGHT".equalsIgnoreCase(shape) && !"OVAL".equalsIgnoreCase(shape)) {
            throw new RuntimeException("Shape must be STRAIGHT or OVAL");
        }

        RaceTrack track = RaceTrack.builder()
                .name(request.getName())
                .location(request.getLocation())
                .shape(shape.toUpperCase())
                .build();

        return TrackResponse.fromEntity(raceTrackRepository.save(track));
    }

    @Transactional
    public TrackResponse updateTrack(Integer id, TrackRequest request) {
        RaceTrack track = raceTrackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Race track not found"));

        if (!"STRAIGHT".equalsIgnoreCase(request.getShape()) && !"OVAL".equalsIgnoreCase(request.getShape())) {
            throw new RuntimeException("Shape must be STRAIGHT or OVAL");
        }

        track.setName(request.getName());
        track.setLocation(request.getLocation());
        track.setShape(request.getShape().toUpperCase());

        return TrackResponse.fromEntity(raceTrackRepository.save(track));
    }

    @Transactional
    public void deleteTrack(Integer id) {
        RaceTrack track = raceTrackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Race track not found"));

        // Optionally, check if any tournaments/races are using this track before deleting
        // Assuming cascade or it will throw constraint violation
        raceTrackRepository.delete(track);
    }
}
