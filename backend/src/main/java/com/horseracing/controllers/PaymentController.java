package com.horseracing.controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/payos/webhook")
    public ResponseEntity<ObjectNode> handlePayOSWebhook(@RequestBody ObjectNode webhookBody) {
        ObjectNode response = paymentService.handleWebhook(webhookBody);
        return ResponseEntity.ok(response);
    }
}
