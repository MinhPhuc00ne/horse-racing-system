package com.horseracing.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.repositories.WalletRepository;
import com.horseracing.repositories.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.exception.PayOSException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;
import vn.payos.model.v2.paymentRequests.PaymentLink;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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
            
        } catch (PayOSException | IllegalArgumentException e) {
            log.error("Webhook processing error: {}", e.getMessage());
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
            
            // Query PayOS directly
            try {
                PaymentLink paymentLinkData = payOS.paymentRequests().get(orderCode);
                if (vn.payos.model.v2.paymentRequests.PaymentLinkStatus.PAID.equals(paymentLinkData.getStatus())) {
                    if ("PENDING".equals(tx.getStatus())) {
                        tx.setStatus("SUCCESS");
                        walletTransactionRepository.save(tx);

                        Wallet wallet = tx.getWallet();
                        wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
                        walletRepository.save(wallet);
                        log.info("Successfully updated wallet balance via manual check for user: {}", wallet.getUser().getUsername());
                    }
                    return "SUCCESS";
                }
                return paymentLinkData.getStatus().name(); // PENDING, CANCELLED, etc.
            } catch (Exception e) {
                log.error("Error checking payment status from PayOS: {}", e.getMessage());
            }
            return tx.getStatus();
        }
        return "NOT_FOUND";
    }
}
