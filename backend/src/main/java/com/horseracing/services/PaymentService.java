package com.horseracing.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.repositories.WalletRepository;
import com.horseracing.repositories.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;
import vn.payos.exception.PayOSException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PayOS payOS;
    private final WalletService walletService;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletRepository walletRepository;

    public ObjectNode createPaymentLink(User user, BigDecimal amount, String returnUrl, String cancelUrl) throws Exception {
        // Generate a unique order code (up to 53-bit integer). Unix timestamp is fine.
        long orderCode = System.currentTimeMillis();

        // Save pending transaction
        walletService.createPendingDeposit(user, amount, orderCode);

        // Build item data
        PaymentLinkItem item = PaymentLinkItem.builder()
                .name("Nạp tiền vào ví " + user.getUsername())
                .price(amount.longValue())
                .quantity(1)
                .build();

        // Build payment data
        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(amount.longValue())
                .description("Nạp tiền ví")
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .items(List.of(item))
                .build();

        CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode res = mapper.createObjectNode();
        res.put("checkoutUrl", data.getCheckoutUrl());
        res.put("qrCode", data.getQrCode());
        res.put("orderCode", orderCode);

        return res;
    }

    @Transactional
    public ObjectNode handleWebhook(ObjectNode webhookBody) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode response = mapper.createObjectNode();
        try {
            log.info("Raw webhook body from PayOS: {}", webhookBody.toString());

            // Verify webhook signature and extract data
            Webhook webhook = mapper.convertValue(webhookBody, Webhook.class);
            WebhookData data = payOS.webhooks().verify(webhook);
            
            log.info("Received valid webhook for order code: {}", data.getOrderCode());

            if ("00".equals(data.getCode()) || data.getCode().equals("00")) {
                Optional<WalletTransaction> optTx = walletTransactionRepository.findByPayosOrderCode(data.getOrderCode());
                if (optTx.isPresent()) {
                    WalletTransaction tx = optTx.get();
                    if ("PENDING".equals(tx.getStatus())) {
                        tx.setStatus("SUCCESS");
                        walletTransactionRepository.save(tx);

                        Wallet wallet = tx.getWallet();
                        wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
                        walletRepository.save(wallet);
                        log.info("Successfully updated wallet balance for user: {}", wallet.getUser().getUsername());
                    }
                } else {
                    log.warn("Transaction with order code {} not found.", data.getOrderCode());
                }
            }
            
            response.put("error", 0);
            response.put("message", "Ok");
            response.put("success", true);
            response.putNull("data");
            return response;
            
        } catch (IllegalArgumentException | PayOSException e) {
            log.error("Webhook processing error: {}", e.getMessage(), e);
            // PayOS requires { "error": 0, "message": "Ok" } even when setting up the webhook URL 
            // where the signature might be invalid or a dummy payload is sent.
            response.put("error", 0);
            response.put("message", "Ok");
            response.put("success", true);
            response.putNull("data");
            return response;
        }
    }

    @Transactional
    public String checkDepositStatus(long orderCode) {
        Optional<WalletTransaction> optTx = walletTransactionRepository.findByPayosOrderCode(orderCode);
        if (optTx.isPresent()) {
            WalletTransaction tx = optTx.get();
            if ("SUCCESS".equals(tx.getStatus())) {
                return "SUCCESS";
            }
            if ("FAILED".equals(tx.getStatus())) {
                return "FAILED";
            }
            
            // Query PayOS directly
            try {
                PaymentLink paymentLinkData = payOS.paymentRequests().get(orderCode);
                String payosStatus = String.valueOf(paymentLinkData.getStatus());
                if ("PAID".equals(payosStatus)) {
                    if ("PENDING".equals(tx.getStatus())) {
                        tx.setStatus("SUCCESS");
                        walletTransactionRepository.save(tx);

                        Wallet wallet = tx.getWallet();
                        wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
                        walletRepository.save(wallet);
                        log.info("Successfully updated wallet balance via manual check for user: {}", wallet.getUser().getUsername());
                    }
                    return "SUCCESS";
                } else if ("CANCELLED".equals(payosStatus) || "EXPIRED".equals(payosStatus)) {
                    if ("PENDING".equals(tx.getStatus())) {
                        tx.setStatus("FAILED");
                        walletTransactionRepository.save(tx);
                        log.info("Transaction {} marked as FAILED in database because PayOS status is: {}", orderCode, payosStatus);
                    }
                    return "FAILED";
                }
                return payosStatus;
            } catch (Exception e) {
                log.error("Error checking payment status from PayOS for order {}: {}", orderCode, e.getMessage());
            }
            return tx.getStatus();
        }
        return "NOT_FOUND";
    }

    /**
     * Scheduled cleanup job: runs every 5 minutes to query status of pending PayOS deposits
     * and automatically cancel/fail them if they have timed out or been cancelled.
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void cleanupPendingDeposits() {
        log.info("Scheduled task: Starting cleanup of stuck pending PayOS deposits...");
        java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusMinutes(15);
        List<WalletTransaction> pendingTxs = walletTransactionRepository.findAllPendingPayosDepositsBefore(cutoff);
        
        for (WalletTransaction tx : pendingTxs) {
            log.info("Processing cleanup for pending transaction ID: {}, Order Code: {}", tx.getId(), tx.getPayosOrderCode());
            try {
                PaymentLink paymentLinkData = payOS.paymentRequests().get(tx.getPayosOrderCode());
                String payosStatus = String.valueOf(paymentLinkData.getStatus());
                
                switch (payosStatus) {
                    case "PAID" -> {
                        tx.setStatus("SUCCESS");
                        walletTransactionRepository.save(tx);

                        Wallet wallet = tx.getWallet();
                        wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
                        walletRepository.save(wallet);
                        log.info("Stuck transaction {} was actually PAID. Updated balance.", tx.getPayosOrderCode());
                    }
                    case "CANCELLED", "EXPIRED" -> {
                        tx.setStatus("FAILED");
                        walletTransactionRepository.save(tx);
                        log.info("Stuck transaction {} marked as FAILED based on PayOS status: {}", tx.getPayosOrderCode(), payosStatus);
                    }
                    default -> {
                        // Still PENDING on PayOS side, but locally timed out (older than 15 minutes)
                        // Attempt to cancel payment link on PayOS side and mark as FAILED locally
                        try {
                            payOS.paymentRequests().cancel(tx.getPayosOrderCode(), "Transaction timed out after 15 minutes");
                            log.info("Successfully cancelled payment link on PayOS for order: {}", tx.getPayosOrderCode());
                        } catch (Exception e) {
                            log.warn("Failed to cancel payment link on PayOS for order {}: {}", tx.getPayosOrderCode(), e.getMessage());
                        }
                        tx.setStatus("FAILED");
                        walletTransactionRepository.save(tx);
                        log.info("Stuck transaction {} timed out locally and marked as FAILED.", tx.getPayosOrderCode());
                    }
                }
            } catch (Exception e) {
                // If payment link not found or any other PayOS error, mark as FAILED locally
                tx.setStatus("FAILED");
                walletTransactionRepository.save(tx);
                log.warn("Error querying PayOS for order {}. Marked as FAILED locally. Error: {}", tx.getPayosOrderCode(), e.getMessage());
            }
        }
    }
}
