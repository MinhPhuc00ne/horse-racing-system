package com.horseracing.repositories;

import com.horseracing.entities.UserConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserConnectionRepository extends JpaRepository<UserConnection, Integer> {

    @Query("SELECT uc FROM UserConnection uc WHERE (uc.requester.id = :uid1 AND uc.recipient.id = :uid2) OR (uc.requester.id = :uid2 AND uc.recipient.id = :uid1)")
    Optional<UserConnection> findConnectionBetween(@Param("uid1") Integer uid1,
            @Param("uid2") Integer uid2);

    @Query("SELECT uc FROM UserConnection uc WHERE (uc.requester.id = :userId OR uc.recipient.id = :userId) AND uc.status = 'ACCEPTED'")
    List<UserConnection> findAllFriends(@Param("userId") Integer userId);

    @Query("SELECT uc FROM UserConnection uc WHERE uc.requester.id = :userId OR uc.recipient.id = :userId")
    List<UserConnection> findAllConnections(@Param("userId") Integer userId);
}
