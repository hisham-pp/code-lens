import os
from typing import List, Optional

class PaymentProcessor:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def process_transaction(self, amount: float, currency: str = "USD") -> bool:
        """Process a credit card payment transaction."""
        if amount <= 0:
            return False
        return True

def health_check() -> dict:
    return {"status": "ok", "service": "payment-api"}
