# API Guide: Financial Refund Flows

This document specifies in detail 4 APIs related to the registration fee refund flows for Horse Owners and bet refund flows for Spectators when a tournament is cancelled, registration is rejected, or the participant list is confirmed.

> [!NOTE]
> All APIs require user authentication via JWT Token in the Header as `Authorization: Bearer <TOKEN>`.

---

## 1. Jockey Responds to / Rejects Race Invitation
The Jockey rejects the race invitation sent by the Horse Owner. The system automatically updates the registration status to `REJECTED_BY_JOCKEY` and refunds 100% of the entry fee back to the Horse Owner's wallet.

* **API Endpoint:** `PUT /api/jockey/invitations/{id}/respond`
* **Access Role:** `JOCKEY`
* **Path Parameters:**
  - `id` (Integer): The ID of the `RaceRegistration` record.
* **Query Parameters:**
  - `action` (String): The response action (`REJECT` to reject, `ACCEPT` to accept).
* **Response (200 OK):**
  ```json
  {
    "id": 12,
    "raceId": 5,
    "raceName": "Qualifying Round 1",
    "horseId": 4,
    "horseName": "Lightning Bolt",
    "jockeyId": 2,
    "jockeyName": "Test Jockey 1",
    "ownerId": 1,
    "ownerName": "Test Owner 1",
    "status": "REJECTED_BY_JOCKEY",
    "jockeySharePercent": 30.0,
    "ownerSharePercent": 70.0,
    "createdAt": "2026-06-19T22:30:00"
  }
  ```
* **BE Side-effects:**
  - The Horse Owner's (`ownerId`) wallet balance is credited with 100% of the tournament's `entryFee`.
  - A `WalletTransaction` record is created with type `REFUND`, status `SUCCESS` linked to the registration.
  - Sends a notification of type `REGISTRATION` to the Horse Owner.

---

## 2. Admin Rejects Horse Owner's Race Registration
The Admin rejects a Horse Owner's registration during the open registration phase. The system automatically sets the status to `REJECTED` and refunds 100% of the entry fee back to the Horse Owner's wallet.

* **API Endpoint:** `PUT /api/admin/race-registrations/{id}/reject`
* **Access Role:** `ADMIN`
* **Path Parameters:**
  - `id` (Integer): The ID of the `RaceRegistration` record.
* **Response (200 OK):**
  ```json
  {
    "id": 12,
    "raceId": 5,
    "raceName": "Qualifying Round 1",
    "horseId": 4,
    "horseName": "Lightning Bolt",
    "jockeyId": 2,
    "jockeyName": "Test Jockey 1",
    "ownerId": 1,
    "ownerName": "Test Owner 1",
    "status": "REJECTED",
    "jockeySharePercent": 30.0,
    "ownerSharePercent": 70.0,
    "createdAt": "2026-06-19T22:30:00"
  }
  ```
* **BE Side-effects:**
  - Refunds 100% of the tournament's `entryFee` back to the Horse Owner's wallet.
  - Creates a `WalletTransaction` record with type `REFUND` and status `SUCCESS`.
  - Sends a notification of type `REGISTRATION` to both the Horse Owner and the Jockey.

---

## 3. Admin Confirms Official Race Registrations (Clears Waiting List)
The Admin confirms the official participant list. The registrations remaining in the queue (not yet set to `APPROVED` or accepted) are automatically rejected (`REJECTED`) and refunded 100% of their entry fee.

* **API Endpoint:** `POST /api/admin/races/{raceId}/confirm-registration`
* **Access Role:** `ADMIN`
* **Path Parameters:**
  - `raceId` (Integer): The ID of the race to lock and confirm.
* **Response (200 OK):**
  ```json
  {
    "message": "Registrations confirmed successfully. Waiting list cleared and refunded."
  }
  ```
* **BE Side-effects:**
  - Closes registration (race status changes to `CLOSED_FOR_REGISTER`).
  - Scans all registrations with `PENDING` or `PENDING_JOCKEY` status for this race and updates them to `REJECTED`.
  - For each rejected registration: Refunds 100% of the `entryFee` back to the corresponding Horse Owner's wallet, records a `WalletTransaction` of type `REFUND` with status `SUCCESS`, and sends notifications to the Horse Owner and the Jockey.

---

## 4. Admin Cancels Tournament
The Admin updates the tournament status to `"Cancelled"`. The system automatically cancels the associated races, cancels all registrations, refunds entry fees to Horse Owners, and refunds 100% of the bet amounts to Spectators.

* **API Endpoint:** `PUT /api/admin/tournaments/{id}/status`
* **Access Role:** `ADMIN`
* **Path Parameters:**
  - `id` (Integer): The ID of the tournament to cancel.
* **Request Body:**
  ```json
  {
    "status": "Cancelled"
  }
  ```
* **Response (200 OK):** Returns the cancelled tournament details.
* **BE Side-effects:**
  - Sets the tournament status to `Cancelled` and all associated races' status to `CANCELLED`.
  - Updates all race registrations of those races (which are in `PENDING`, `PENDING_JOCKEY`, or `APPROVED` status) to `CANCELLED`, refunds 100% of the `entryFee` to the Horse Owners, and records a `REFUND` transaction history.
  - Scans all `PENDING` bets for those races, updates their status to `REFUNDED`, refunds 100% of the bet amount to the Spectators' wallets, and records a `WalletTransaction` of type `REFUND`.
  - Sends notifications of type `REGISTRATION` (to Horse Owners and Jockeys) and type `WALLET` (to Spectators).
